import { View, Text, useTheme, SizableText, YStack } from "tamagui";
import { useEffect } from "react";
import { useAuthStore } from "store/auth.store";
import { router, Stack } from "expo-router";
import { useColorScheme } from "react-native";

const CreatePage = () => {
  const color = useTheme();
  const theme = useColorScheme();

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      if (user.Runner.status === "Verified") {
        router.replace("/(tabs)/home");
      }
    }
  }, [user]);

  return (
    <>
      <Stack.Screen
        options={{
          title: user?.Runner.status,
          headerShown: true,
          headerStyle: {
            backgroundColor:
              theme === "dark" ? color.background.val : color.gray5Light.val,
          },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      {user ? (
        <View flex={1} padding={"$4"}>
          {user?.Runner.status === "Unverified" ? (
            <YStack gap={"$2"} alignItems={"center"}>
              <SizableText ta={"center"}>
                Your account verification is pending. Please wait for approval.
              </SizableText>
            </YStack>
          ) : user?.Runner.status === "Suspended" ? (
            <YStack gap={"$2"} alignItems={"center"}>
              <Text fontSize={"$6"}>Your account has been suspended</Text>
              <Text fontSize={"$4"} color={"$gray10"}>
                Please contact support for more information
              </Text>
            </YStack>
          ) : (
            <Text>Account status unknown</Text>
          )}
        </View>
      ) : (
        <Text>Account status unknown</Text>
      )}
    </>
  );
};

export default CreatePage;
