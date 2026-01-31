import { api, toApiErrorMessage } from "./client";

export interface LatLng { lat: number; lng: number; }
export interface TrackingEvent {
  id: string;
  orderId: string;
  type: string;
  location?: LatLng;
  createdAt: string;
}

export async function getTrackingTimeline(orderId: string): Promise<TrackingEvent[]> {
  try {
    const res = await api.get<TrackingEvent[]>(`/orders/${orderId}/tracking`);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function updateDriverLocation(orderId: string, location: LatLng): Promise<void> {
  try {
    await api.post(`/orders/${orderId}/driver-location`, { location });
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}