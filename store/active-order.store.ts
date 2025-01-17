import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Order, ORDER_STATUS } from "./orders.store";

interface ActiveOrderStore {
  activeOrders: Order[];
  ongoingOrder: Order | null;
  getAll: () => Promise<void>;
  getOngoing: (orderId: number) => Promise<void>;
  subscribeChanges: () => void;
  startOrder: (orderId: number, runnerId: number) => Promise<void>;
}

export const useActiveOrderStore = create<ActiveOrderStore>((set) => ({
  activeOrders: [],
  ongoingOrder: null,
  getAll: async () => {
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
      .eq("order_status", ORDER_STATUS.OPEN)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders", error);
      return;
    }

    useActiveOrderStore.getState().subscribeChanges();

    if (data) {
      set({ activeOrders: data as any });
    }
  },
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
  subscribeChanges: () => {
    console.log("Subscribing to active order changes");
    supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Order" },
        async (payload) => {
          console.log("Payload received:", payload);

          if (payload.eventType === "INSERT") {
            // Fetch the new order with all related details
            const { data } = await supabase
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
              .eq("id", payload.new.id)
              .single();

            const newOrderWithDetails = data;

            set((state) => ({
              activeOrders: [...state.activeOrders, newOrderWithDetails].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              ),
            }));
          } else if (payload.eventType === "UPDATE") {
            const updatedOrder = payload.new as any;

            if (updatedOrder.order_status === ORDER_STATUS.OPEN) {
              const { data: orderWithDetails } = await supabase
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
                .eq("id", updatedOrder.id)
                .single();

              set((state) => ({
                activeOrders: [...state.activeOrders, orderWithDetails]
                  .filter(
                    (order, index, self) =>
                      self.findIndex((o) => o.id === order.id) === index
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  ),
              }));
            } else {
              set((state) => ({
                activeOrders: state.activeOrders
                  .filter((order) => order.id !== updatedOrder.id)
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  ),
              }));
            }
          } else {
            const updatedOrder = payload.new as any;

            set((state) => ({
              activeOrders: state.activeOrders
                .map((order) =>
                  order.id === updatedOrder.id
                    ? ({
                        ...order,
                        orderStatus: updatedOrder.order_status,
                        remarks: updatedOrder.remarks,
                      } as Order)
                    : order
                )
                .filter((order) => order.orderStatus === ORDER_STATUS.OPEN)
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                ),
            }));
          }
        }
      )
      .subscribe();
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
        activeOrders: state.activeOrders.map((order) =>
          order.id === orderId
            ? { ...order, orderStatus: ORDER_STATUS.ON_GOING }
            : order
        ),
      }));
    }
  },
}));
