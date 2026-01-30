// src/api/orders.ts
import { api, toApiErrorMessage } from "./client";

export type OrderStatus =
  | "created"
  | "confirmed"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface Money {
  amount: number; // cents/paise
  currency: string; // "USD", "MMK", etc.
}

export interface Address {
  name?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price?: Money;
}

export interface Order {
  id: string;
  userId: string;
  driverId?: string;
  status: OrderStatus;
  pickup: Address;
  dropoff: Address;
  items?: OrderItem[];
  fee?: Money;
  total?: Money;
  note?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface CreateOrderRequest {
  pickup: Address;
  dropoff: Address;
  items?: OrderItem[];
  note?: string;
}

export interface UpdateOrderRequest {
  pickup?: Address;
  dropoff?: Address;
  items?: OrderItem[];
  note?: string;
}

export interface ListOrdersParams {
  status?: OrderStatus;
  limit?: number;
  cursor?: string; // for pagination
}

export interface ListOrdersResponse {
  data: Order[];
  nextCursor?: string;
}

export async function createOrder(payload: CreateOrderRequest): Promise<Order> {
  try {
    const res = await api.post<Order>("/orders", payload);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function getOrder(orderId: string): Promise<Order> {
  try {
    const res = await api.get<Order>(`/orders/${orderId}`);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function listOrders(params: ListOrdersParams = {}): Promise<ListOrdersResponse> {
  try {
    const res = await api.get<ListOrdersResponse>("/orders", { params });
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function updateOrder(orderId: string, payload: UpdateOrderRequest): Promise<Order> {
  try {
    const res = await api.patch<Order>(`/orders/${orderId}`, payload);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function cancelOrder(orderId: string, reason?: string): Promise<Order> {
  try {
    const res = await api.post<Order>(`/orders/${orderId}/cancel`, { reason });
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function assignDriver(orderId: string, driverId: string): Promise<Order> {
  try {
    const res = await api.post<Order>(`/orders/${orderId}/assign-driver`, { driverId });
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  try {
    const res = await api.post<Order>(`/orders/${orderId}/status`, { status });
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}