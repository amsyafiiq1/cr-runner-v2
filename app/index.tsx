import { useEffect } from "react";
import { Spinner, YStack } from "tamagui";
import { supabase } from "lib/supabase";
import { router } from "expo-router";
import { useAuthStore } from "store/auth.store";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const index = () => {
  const loadUser = useAuthStore((state) => state.loadUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || session === null) {
        router.push("/(auth)/login");
      } else if (event === "SIGNED_IN" || session !== null) {
        router.push("/(tabs)/home");
        loadUser(session.user.email!);
      }
    });
  }, [loadUser]);

  useEffect(() => {}, []);

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" theme={"dark"}>
      <Spinner />
    </YStack>
  );
};

export default index;
