import { View, Text } from "react-native";
import React from "react";
import { Slot, Stack } from "expo-router";
import { Button, Label, Switch, XStack } from "tamagui";
import { useAuthStore } from "store/auth.store";
import { Bell, Bike } from "@tamagui/lucide-icons";

const _layout = () => {
  const user = useAuthStore((state) => state.user);
  const updateOnDuty = useAuthStore((state) => state.updateOnDuty);
  return (
    <Stack>
      <Stack.Screen
        name="page"
        options={{
          title: "",
          headerShown: true,
          headerTitleAlign: "center",
          headerLeft: () => {
            return (
              <XStack gap={"$2"} marginRight={"$4"} alignItems="center">
                <Switch
                  size={"$3"}
                  unstyled={true}
                  backgroundColor={"lightblue"}
                  onCheckedChange={updateOnDuty}
                  checked={user?.Runner?.isOnDuty}
                >
                  <Switch.Thumb animation={"quicker"} />
                </Switch>
                <Label>{user?.Runner?.isOnDuty ? "Online" : "Offline"}</Label>
              </XStack>
            );
          },
          headerRight: () => {
            return (
              <Button
                size={"$3"}
                circular={true}
                chromeless={true}
                onPress={() => {
                  console.log("pressed");
                }}
              >
                <Bell size={"$1"} />
              </Button>
            );
          },
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "View Order",
          headerShown: true,
        }}
      />
    </Stack>
  );
};

export default _layout;
