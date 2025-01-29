import { Spinner, YStack } from "tamagui";
import { supabase } from "lib/supabase";
import { router } from "expo-router";
import { useAuthStore } from "store/auth.store";

const index = () => {
  const loadUser = useAuthStore((state) => state.loadUser);
  const user = useAuthStore((state) => state.user);

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_OUT" || session === null) {
      console.log("Signed out");
      router.replace("/(auth)/login");
    } else if (event === "SIGNED_IN" || session !== null) {
      console.log("Signed in");
      if (session?.user?.email) {
        loadUser(session.user.email, session.user);
      }

      router.replace("/(tabs)/home");
    }
  });

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor={"$gray1"}
    >
      <Spinner />
    </YStack>
  );
};

export default index;
