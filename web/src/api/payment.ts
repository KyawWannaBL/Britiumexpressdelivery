// src/api/payments.ts
import { api, toApiErrorMessage } from "./client";
import type { Money } from "./orders";

export type PaymentProvider = "stripe" | "paypal" | "cash" | "manual";
export type PaymentStatus = "pending" | "requires_action" | "paid" | "failed" | "refunded";

export interface Payment {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: Money;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  // Provider-specific fields (optional)
  clientSecret?: string; // Stripe example
  redirectUrl?: string;  // PayPal example
}

export interface CreatePaymentRequest {
  orderId: string;
  provider: PaymentProvider;
}

export interface ConfirmPaymentRequest {
  paymentId: string;
  // e.g., Stripe: paymentMethodId, or whatever your backend expects
  data?: Record<string, unknown>;
}

export async function createPayment(payload: CreatePaymentRequest): Promise<Payment> {
  try {
    const res = await api.post<Payment>("/payments", payload);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function getPayment(paymentId: string): Promise<Payment> {
  try {
    const res = await api.get<Payment>(`/payments/${paymentId}`);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function listPaymentsByOrder(orderId: string): Promise<Payment[]> {
  try {
    const res = await api.get<Payment[]>(`/orders/${orderId}/payments`);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function confirmPayment(payload: ConfirmPaymentRequest): Promise<Payment> {
  try {
    const res = await api.post<Payment>(`/payments/${payload.paymentId}/confirm`, {
      data: payload.data ?? {},
    });
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}
