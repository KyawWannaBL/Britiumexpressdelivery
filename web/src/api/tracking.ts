// src/api/tracking.ts
import { api, toApiErrorMessage } from "./client";

export type TrackingEventType =
  | "order_created"
  | "confirmed"
  | "driver_assigned"
  | "picked_up"
  | "in_transit"
  | "arrived"
  | "delivered"
  | "cancelled";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface TrackingEvent {
  id: string;
  orderId: string;
  type: TrackingEventType;
  message?: string;
  location?: LatLng;
  createdAt: string; // ISO
}

export interface DriverLocation {
  orderId: string;
  driverId: string;
  location: LatLng;
  heading?: number;
  speed?: number;
  accuracy?: number;
  recordedAt: string; // ISO
}

export async function getTrackingTimeline(orderId: string): Promise<TrackingEvent[]> {
  try {
    const res = await api.get<TrackingEvent[]>(`/orders/${orderId}/tracking`);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function addTrackingEvent(orderId: string, event: Omit<TrackingEvent, "id" | "createdAt">) {
  try {
    const res = await api.post<TrackingEvent>(`/orders/${orderId}/tracking`, event);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function updateDriverLocation(payload: Omit<DriverLocation, "recordedAt">): Promise<void> {
  try {
    await api.post(`/orders/${payload.orderId}/driver-location`, payload);
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function getLatestDriverLocation(orderId: string): Promise<DriverLocation | null> {
  try {
    const res = await api.get<DriverLocation | null>(`/orders/${orderId}/driver-location/latest`);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}
