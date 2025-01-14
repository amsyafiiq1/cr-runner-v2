import { Button, SizableText, YStack } from "tamagui";
import { supabase } from "lib/supabase";
import { useAuthStore } from "store/auth.store";
import { useEffect, useState } from "react";
import { router } from "expo-router";

const index = () => {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <YStack flex={1} gap={"$4"} alignItems="center" justifyContent="center">
      <SizableText fontSize={"$8"} lineHeight={"$8"} fontWeight={800}>
        Welcome {user?.name}
      </SizableText>
      <Button size={"$6"} onPress={() => signOut()}>
        Sign Out
      </Button>
    </YStack>
  );
};

export default index;
