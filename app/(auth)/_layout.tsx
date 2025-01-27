import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="singup"
        options={{
          title: "Sign Up",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="create"
        options={{
          title: "Create",
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default _layout;
