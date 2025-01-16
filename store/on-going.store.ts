import { create } from "zustand";
import { Order } from "./orders.store";
import { supabase } from "lib/supabase";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const LOCATION_TRACKING = "background-location-task";

TaskManager.defineTask(LOCATION_TRACKING, ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const { getUserLiveLocation } = useOnGoingStore.getState();
    getUserLiveLocation();
  }
});

interface OnGoingStore {
  ongoingOrder: Order | null;
  userLiveLocation: any;
  getOngoing: (orderId: number) => Promise<void>;
  changeStatus: (orderId: number, status: string) => Promise<void>;
  getUserLiveLocation: () => Promise<void>;
  updateUserLiveLocation: (location: any) => Promise<void>;
}

let foregroundSubscription: { remove: () => void } | null = null;

export const useOnGoingStore = create<OnGoingStore>((set) => ({
  ongoingOrder: null,
  userLiveLocation: null,
  getOngoing: async (orderId) => {
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
        *,
        id, 
        remarks, 
        payment, 
        runner:Runner!runner_id(*), 
        customer:Customer!customer_id(id, user:User!id(*)), 
        orderType:Order_Type!order_type_id(*), 
        pickup:Location!pickup_id(*), 
        dropoff:Location!dropoff_id(*),
        createdAt:created_at,
        orderStatus:order_status
      `
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching ongoing order", error);
      return;
    }

    if (data) {
      set({ ongoingOrder: data as any });
    }
  },
  changeStatus: async (orderId, status) => {
    const { data, error } = await supabase
      .from("Order")
      .update({ order_status: status })
      .eq("id", orderId);

    if (error) {
      console.error("Error changing order status", error);
      return;
    }

    if (data) {
      useOnGoingStore.getState().getOngoing(orderId);
    }
  },
  getUserLiveLocation: async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status === "granted") {
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
        distanceInterval: 10,
        foregroundService: {
          notificationTitle: "Location Tracking",
          notificationBody: "Tracking your location for delivery",
        },
      });

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          set({ userLiveLocation: location });
        }
      );
    }
  },
  updateUserLiveLocation: async (location) => {},
  stopLocationTracking: () => {},
}));
