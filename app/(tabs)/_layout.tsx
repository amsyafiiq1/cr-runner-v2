import { Tabs } from "expo-router";
import { Bell, Bike, ReceiptText, Settings } from "@tamagui/lucide-icons";
import { Button, Label, Switch, XStack } from "tamagui";
import { supabase } from "lib/supabase";
import { useAuthStore } from "store/auth.store";

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="delivery"
        options={{
          tabBarIcon: ({ color }) => <Bike size={24} color={color} />,
          headerShown: false,
          unmountOnBlur: true,
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
          title: "Setting",
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
    </Tabs>
  );
};

export default _layout;
