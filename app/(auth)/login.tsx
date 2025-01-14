import { useEffect, useState } from "react";
import { StyleSheet, View, AppState } from "react-native";
import { supabase } from "../../lib/supabase";
import { Button, Input, SizableText, XStack, YStack } from "tamagui";
import { useAuthStore } from "store/auth.store";
import { router } from "expo-router";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const user = useAuthStore((state) => state.user);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  });

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" mx={20}>
      <XStack flex={"unset"} width={"100%"}>
        <SizableText fontSize={"$10"} lineHeight={"$10"} fontWeight={800}>
          Welcome to Campus Runner Service
        </SizableText>
      </XStack>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          size={"$4"}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          size={"$4"}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          theme="blue_active"
          onPress={() => signInWithEmail(email, password)}
        >
          Sign In
        </Button>
      </View>
      <View style={styles.verticallySpaced}>
        <Button onPress={() => signUpWithEmail(email, password)}>
          Sign Up
        </Button>
      </View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
