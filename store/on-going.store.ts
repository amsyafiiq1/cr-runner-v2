import { create } from "zustand";
import { Order, OrderStatus } from "./orders.store";
import { supabase } from "lib/supabase";
import * as Location from "expo-location";
import { useAuthStore } from "./auth.store";
import * as TaskManager from "expo-task-manager";

interface OnGoingStore {
  ongoingOrder: Order | null;
  userLiveLocation: any;
  getOngoing: (orderId: number) => Promise<void>;
  changeStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  setUserLiveLocation: (location: any) => void;
  updateUserLiveLocation: (location: any) => Promise<void>;
}

const LOCATION_TRACKING = "LOCATION_TRACKING";

export const startTracking = async () => {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === "granted") {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status === "granted") {
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 10,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Location Tracking",
          notificationBody: "Tracking your location",
        },
      });
    }
  }
};

TaskManager.defineTask(LOCATION_TRACKING, ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { setUserLiveLocation } = useOnGoingStore.getState();
    const { locations } = data as any;

    console.log("Location update", locations[0]);
    setUserLiveLocation(locations[0]);
  }
});

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
    set((state) => ({
      ...state,
      ongoingOrder: state.ongoingOrder
        ? {
            ...state.ongoingOrder,
            orderStatus: status,
          }
        : state.ongoingOrder,
    }));
  },

  setUserLiveLocation: (location: any) => {
    const { coords } = location;

    set({
      userLiveLocation: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
    });

    useOnGoingStore.getState().updateUserLiveLocation(coords);
  },

  updateUserLiveLocation: async (location) => {
    console.log("Updating live location", location);
    const { error } = await supabase.from("Runner_Live_Location").upsert(
      {
        runner_id: useAuthStore.getState().user.id,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      {
        onConflict: "runner_id",
      }
    );

    if (error) {
      console.error("Error updating live location", error);
      return;
    }
  },
}));
