import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface Order {
  id: number;
  remarks: string;
  payment: number;
  runner: Runner;
  customer: Customer;
  orderType: OrderType;
  pickup: Location;
  dropoff: Location;
  createdAt: Date;
  orderStatus: OrderStatus;
}

export const ORDER_STATUS = {
  OPEN: "OPEN",
  ON_GOING: "ON_GOING",
  PICKED_UP: "PICKED_UP",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
} as const;

// For type annotations
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export interface OrderType {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
}

export interface Location {
  id: number;
  address: string;
  latitude: string;
  longitude: string;
}

export interface Customer {
  id: number;
  user: User;
}

export interface Runner {
  id: number;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo: string;
  type: string;
  createdAt: Date;
}

interface OrderStore {
  orders: Order[];
  errors: any;
  getOrders: () => Promise<void>;
  startOrder: (orderId: number, runnerId: number) => Promise<void>;
  initialize: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  errors: null,
  getOrders: async () => {
    console.log("Fetching orders...");
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders", error);
      return;
    }

    if (data) {
      const sortedOrders = (data as any[]).sort((a, b) => {
        // First priority: ON_GOING status
        if (
          a.orderStatus === ORDER_STATUS.ON_GOING &&
          b.orderStatus !== ORDER_STATUS.ON_GOING
        )
          return -1;
        if (
          b.orderStatus === ORDER_STATUS.ON_GOING &&
          a.orderStatus !== ORDER_STATUS.ON_GOING
        )
          return 1;

        // Second priority: created_at date
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      set({ orders: sortedOrders, errors: error });
      console.log("Orders fetched and sorted");
    }
  },
  startOrder: async (orderId, runnerId) => {
    console.log("Starting order", orderId);
    const { data, error } = await supabase
      .from("Order")
      .update({ order_status: ORDER_STATUS.ON_GOING, runner_id: runnerId })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error starting order", error);
      return;
    }

    if (data) {
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? { ...order, orderStatus: ORDER_STATUS.ON_GOING }
            : order
        ),
      }));
    }
  },
  initialize: () => {
    console.log("Order channel initialized...");
    supabase
      .channel("subscription")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Order" },
        (payload) => {
          const updatedOrder = payload.new as any;
          console.log("Order updated: ", updatedOrder);
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === updatedOrder.id
                ? ({
                    ...order,
                    orderStatus: updatedOrder.order_status,
                    remarks: updatedOrder.remarks,
                  } as Order)
                : order
            ),
          }));
        }
      )
      .subscribe();
  },
}));

// Initialize subscription immediately
useOrderStore.getState().initialize();
