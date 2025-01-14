import { supabase } from "lib/supabase";
import { Alert } from "react-native";
import { create } from "zustand";

interface AuthStore {
  user: any;
  userSupabase: any;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  loadUser: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  subscribeChanges: (email: string) => void;
  updateOnDuty: (isOnDuty: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userSupabase: null,
  loading: false,
  signInWithEmail: async (email, password) => {
    const { data, error } = await supabase
      .from("User")
      .select(
        `
           *,
            Runner!inner(status, isOnDuty)
          `
      )
      .eq("email", email)
      .eq("type", "Runner")
      .single();

    if (error) {
      console.log(error);

      Alert.alert("No runner registered with this email");
    } else {
      set({ user: data });
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        Alert.alert(error.message);
        return;
      }

      if (data.Runner.status !== "Verified") {
        Alert.alert("Your account is either not verified or suspended");
        await supabase.auth.signOut();
        return;
      }
    }
  },
  signUpWithEmail: async (email, password) => {
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
  },
  loadUser: async (email) => {
    const { data, error } = await supabase
      .from("User")
      .select(
        `
            *,
            Runner!inner(status, isOnDuty)
          `
      )
      .eq("email", email)
      .eq("type", "Runner")
      .single();

    if (error) {
      console.log(error);
      return;
    }
    console.log("User loaded:", data.id);
    useAuthStore.getState().subscribeChanges(data.id);

    set({ user: data });
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      set({ user: null });
    }
  },
  subscribeChanges: (id) => {
    console.log("Subscribing to changes for", id);
    supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Runner",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updatedRunner = payload.new as any;
          set((state) => {
            return {
              user: {
                ...state.user,
                Runner: {
                  ...state.user.Runner,
                  status: updatedRunner.status,
                  isOnDuty: updatedRunner.isOnDuty,
                },
              },
            };
          });
        }
      )
      .subscribe();
  },
  updateOnDuty: async (isOnDuty) => {
    const user = useAuthStore.getState().user;

    const { data, error } = await supabase
      .from("Runner")
      .update({ isOnDuty: isOnDuty })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      console.log(error);
    }

    if (data) {
      set({ user: { ...user, Runner: { isOnDuty: isOnDuty } } });
    }
  },
}));
