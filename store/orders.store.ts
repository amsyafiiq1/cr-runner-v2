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
  orderStatus: "Open" | "On Going" | "Completed" | "Cancelled";
}

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
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  errors: null,
  getOrders: async () => {
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
      set({ orders: data as any, errors: error });
    }

    const subscription = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Order" },
        (payload) => {
          const updatedOrder = payload.new as any;
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
