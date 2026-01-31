import { api, toApiErrorMessage } from "./client";

export type OrderStatus = "created" | "confirmed" | "picked_up" | "in_transit" | "delivered" | "cancelled";

export interface Money { amount: number; currency: string; }
export interface Address { line1: string; city?: string; state?: string; postalCode?: string; country?: string; }
export interface Order {
  id: string;
  status: OrderStatus;
  pickup: Address;
  dropoff: Address;
  createdAt: string;
}

export async function listOrders(params = {}): Promise<{ data: Order[] }> {
  try {
    const res = await api.get("/orders", { params });
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function createOrder(payload: any): Promise<Order> {
  try {
    const res = await api.post<Order>("/orders", payload);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}