import { User } from "@supabase/supabase-js";
import { supabase } from "lib/supabase";
import { Alert } from "react-native";
import { create } from "zustand";
import { decode } from "base64-arraybuffer";

interface AuthStore {
  user: any;
  userSupabase: User | null;
  loading: boolean;
  error: string | undefined;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    user: any
  ) => Promise<void>;
  loadUser: (email: string, supabaseUser?: User) => Promise<void>;
  signOut: () => Promise<void>;
  subscribeChanges: (email: string) => void;
  updateOnDuty: (isOnDuty: boolean) => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userSupabase: null,
  loading: false,
  error: undefined,
  signInWithEmail: async (email, password) => {
    set({ loading: true, error: undefined });

    const { data: userData, error: userError } = await supabase
      .from("User")
      .select(
        `
          *,
          Runner!inner(status, isOnDuty)
        `
      )
      .eq("email", email)
      .single();

    if (userError) {
      if (userError.details === "The result contains 0 rows")
        set({ error: "No user found", loading: false });
      return;
    }

    if (userData) {
      if (userData.type !== "Runner") {
        set({ error: "No user found", loading: false });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      if (data) {
        set({
          userSupabase: data.user,
          loading: false,
          error: undefined,
          user: userData,
        });
        return;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      return;
    }

    if (data) {
      if (data.user.user_metadata.type === "Runner") {
        set({ userSupabase: data.user });
        return;
      } else {
        supabase.auth.signOut();
        set({ error: "Invalid user type", loading: false });
      }
    }
  },
  signUpWithEmail: async (email, password, user) => {
    set({ loading: true, error: undefined });

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    if (data) {
      const { error: avatarError } = await supabase.storage
        .from("user_profile_picture")
        .upload(
          `${data.user?.id}/profile_${data.user?.id}.jpg`,
          decode(user.avatar.base64Data),
          {
            upsert: true,
            contentType: user.avatar.type,
          }
        );

      if (avatarError) {
        set({ error: avatarError.message, loading: false });
        return;
      }

      const url = supabase.storage
        .from("user_profile_picture")
        .getPublicUrl(`${data.user?.id}/profile_${data.user?.id}.jpg`)
        .data.publicUrl;

      console.log("🚀 ~ signUpWithEmail: ~ url:", url);

      const { data: userData, error: userError } = await supabase
        .from("User")
        .insert({
          id: user.id,
          name: user.name,
          email: email,
          type: "Runner",
          phone: user.phoneNumber,
          photo: url,
          supabase_uuid: data.user?.id,
        })
        .select()
        .single();

      if (userError) {
        console.log("🚀 ~ signUpWithEmail: ~ userError:", userError);
        set({ error: userError.message, loading: false });
        return;
      }

      console.log("🚀 ~ signUpWithEmail: ~ userData:", userData);

      const { data: vehicleId, error: vehicleError } = await supabase
        .from("Vehicle_Details")
        .insert({
          plate_no: user.plateNo,
          type_id: Number(user.vehicleType),
        })
        .select("id")
        .single();

      if (vehicleError) {
        console.log("🚀 ~ signUpWithEmail: ~ vehicleError:", vehicleError);
        set({ error: vehicleError.message, loading: false });
        return;
      }

      console.log("🚀 ~ signUpWithEmail: ~ vehicleId:", vehicleId);

      const { data: runner, error: runnerError } = await supabase
        .from("Runner")
        .insert({
          id: userData.id,
          vehicle_id: vehicleId.id,
        });

      if (runnerError) {
        console.log("🚀 ~ signUpWithEmail: ~ runnerError:", runnerError);
        set({ error: runnerError.message, loading: false });
        return;
      }
      console.log(
        "🚀 ~ const{data:runner,error:runnerError}=awaitsupabase.from ~ runner:",
        runner
      );

      useAuthStore.getState().loadUser(email);

      set({
        loading: false,
        error: undefined,
      });
    }
  },
  loadUser: async (email, supabaseUser?: User) => {
    console.log("🚀 ~ loadUser: ~ email:", email);
    const { data, error } = await supabase
      .from("User")
      .select(
        `
            *,
            Runner!inner(status, isOnDuty)
          `
      )
      .eq("email", email)
      .single();

    if (error) {
      console.log("🚀 ~ loadUser: ~ error:", error);
      return;
    }

    console.log("🚀 ~ loadUser: ~ data:", data);
    useAuthStore.getState().subscribeChanges(data.id);

    set({ user: data, userSupabase: supabaseUser });
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    }
    set({ user: null, userSupabase: null });
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
  },
  reset: () =>
    set({ user: null, userSupabase: null, loading: false, error: undefined }),
}));
