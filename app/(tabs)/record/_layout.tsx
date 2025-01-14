import { Stack, Tabs } from "expo-router";

const RecordLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="all-record"
        options={{
          title: "Records",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "View Record",
        }}
      />
    </Stack>
  );
};

export default RecordLayout;
