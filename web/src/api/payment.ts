import { api, toApiErrorMessage } from "./client";
import type { Money } from "./orders";

export type PaymentStatus = "pending" | "requires_action" | "paid" | "failed" | "refunded";

export interface Payment {
  id: string;
  orderId: string;
  status: PaymentStatus;
  amount: Money;
}

export async function createPayment(orderId: string, provider: string): Promise<Payment> {
  try {
    const res = await api.post<Payment>("/payments", { orderId, provider });
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