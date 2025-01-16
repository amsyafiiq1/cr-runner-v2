import { SizableText, View, XStack, YStack } from "tamagui";
import { Stack, useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";
import { Dot } from "@tamagui/lucide-icons";
import { useActiveOrderStore } from "store/active-order.store";
import { useEffect } from "react";

const OnGoingPage = () => {
  const id = useLocalSearchParams<{ id: string }>().id;
  const selectedOrder = useActiveOrderStore((state) =>
    state.activeOrders.find((order) => order.id.toString() === id)
  );

  const pickupColor = "$green11Light";
  const dropoffColor = "$red11Light";

  const initialRegion = {
    latitude: 3.0718155097395994,
    longitude: 101.50004155925505,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  useEffect(() => {});

  return (
    <>
      <Stack.Screen
        options={{
          title: "On Going",
          headerShown: false,
        }}
      />
      <YStack flex={1}>
        <MapView style={styles.map} initialRegion={initialRegion}>
          {/* marker for pickup */}
          <Marker
            coordinate={{
              latitude: Number(selectedOrder?.pickup.latitude)!,
              longitude: Number(selectedOrder?.pickup.longitude)!,
            }}
            title={selectedOrder?.pickup.address}
          >
            <YStack flex={1} alignItems="center">
              <SizableText
                color={"black"}
                fontWeight={800}
                flexShrink={1}
                maxWidth={200}
                textAlign="center"
              >
                {selectedOrder?.pickup.address}
              </SizableText>
              <View
                borderWidth={3}
                width={24}
                height={24}
                borderRadius={15}
                flex={1}
                alignItems="center"
                justifyContent="center"
                borderColor={pickupColor}
              >
                <View
                  borderWidth={3}
                  width={12}
                  height={12}
                  borderRadius={15}
                  borderColor={pickupColor}
                ></View>
              </View>
            </YStack>
          </Marker>

          {/* marker for delivery */}
          <Marker
            coordinate={{
              latitude: Number(selectedOrder?.dropoff.latitude)!,
              longitude: Number(selectedOrder?.dropoff.longitude)!,
            }}
            title={selectedOrder?.dropoff.address}
          >
            <YStack flex={1} alignItems="center">
              <SizableText
                color={"black"}
                fontWeight={800}
                flexShrink={1}
                maxWidth={200}
                textAlign="center"
              >
                {selectedOrder?.dropoff.address}
              </SizableText>
              <View
                borderWidth={3}
                width={24}
                height={24}
                borderRadius={15}
                flex={1}
                alignItems="center"
                justifyContent="center"
                borderColor={dropoffColor}
              >
                <View
                  borderWidth={3}
                  width={12}
                  height={12}
                  borderRadius={15}
                  borderColor={dropoffColor}
                ></View>
              </View>
            </YStack>
          </Marker>
        </MapView>
      </YStack>
    </>
  );
};

export default OnGoingPage;

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
