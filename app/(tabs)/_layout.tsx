import { Tabs } from "expo-router";
import { Bell, Bike, ReceiptText, Settings } from "@tamagui/lucide-icons";
import { Button, Label, Switch, XStack } from "tamagui";
import { useAuthStore } from "store/auth.store";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const _layout = () => {
  const user = useAuthStore((state) => state.user);
  const updateOnDuty = useAuthStore((state) => state.updateOnDuty);
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: "Order",
          headerShown: true,
          headerTitleStyle: { opacity: 0 },
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <Bike size={24} color={color} />,
          // unmountOnBlur: true,
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
      <Tabs.Screen
        name="record"
        options={{
          tabBarIcon: ({ color }) => <ReceiptText size={24} color={color} />,
          title: "Record",
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          title: "Settings",
          unmountOnBlur: true,
        }}
      />
    </Tabs>
  );
};

export default _layout;
