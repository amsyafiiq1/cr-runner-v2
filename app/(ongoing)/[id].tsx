import {
  Button,
  Card,
  Circle,
  SizableText,
  Spinner,
  View,
  XGroup,
  XStack,
  YStack,
  useTheme,
} from "tamagui";
import { router, Stack, useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Linking, Platform, StyleSheet } from "react-native";
import {
  Bike,
  MapPin,
  MapPinCheck,
  Navigation,
  Phone,
} from "@tamagui/lucide-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { startTracking, useOnGoingStore } from "store/on-going.store";
import { ORDER_STATUS } from "store/orders.store";
import { useFocusEffect } from "@react-navigation/native";
const OnGoingPage = () => {
  const id = useLocalSearchParams<{ id: string }>().id;
  const selectedOrder = useOnGoingStore((state) => state.ongoingOrder);
  const userLocation = useOnGoingStore((state) => state.userLiveLocation);
  const getOngoing = useOnGoingStore((state) => state.getOngoing);
  const changeStatus = useOnGoingStore((state) => state.changeStatus);
  const [buttonText, setButtonText] = useState("Arrived at Pickup");

  const theme = useTheme();

  const pickupColor = theme.blue10Light.val;
  const dropoffColor = theme.yellow10Light.val;
  const completedColor = theme.green10Light.val;

  const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const snapPoints = useMemo(() => ["45%"], []);

  const [initialRegion, setInitialRegion] = useState({
    latitude: 3.0700939853725044,
    longitude: 101.49932443650975,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });

  const [naviation, setNavigation] = useState<{
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
  }>();

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  useFocusEffect(
    useCallback(() => {
      getOngoing(Number(id));
      startTracking();
    }, [getOngoing, startTracking, id])
  );

  useEffect(() => {
    setInitialRegion({
      latitude: 3.0767948948878945,
      longitude: 101.50092601247685,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  }, []);

  useEffect(() => {
    if (!userLocation || !selectedOrder) {
      console.log("Waiting for user location or order data...");
      return;
    }

    console.log("Updating navigation with new location/order data");

    if (selectedOrder.orderStatus === ORDER_STATUS.ON_GOING) {
      console.log("Setting navigation to pickup location");
      setButtonText("Arrived at Pickup");
      setNavigation({
        origin: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        destination: {
          latitude: Number(selectedOrder.pickup.latitude),
          longitude: Number(selectedOrder.pickup.longitude),
        },
      });
    } else if (selectedOrder.orderStatus === ORDER_STATUS.PICKED_UP) {
      console.log("Setting navigation to dropoff location");
      setButtonText("Arrived at Dropoff");
      setNavigation({
        origin: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        destination: {
          latitude: Number(selectedOrder.dropoff.latitude),
          longitude: Number(selectedOrder.dropoff.longitude),
        },
      });
    } else if (selectedOrder.orderStatus === ORDER_STATUS.COMPLETED) {
      console.log("Order completed");
      setButtonText("Order Completed");
    } else {
      console.log("Invalid order status");
      console.log(selectedOrder.orderStatus);
    }
  }, [userLocation, selectedOrder]); // Add dependencies that should trigger updates

  const renderFooter = useCallback(
    (props) => (
      <BottomSheetFooter
        {...props}
        style={{ backgroundColor: theme.background.val, paddingBottom: 32 }}
      >
        <View px="$4">
          <Button
            size="$4"
            width="100%"
            theme={
              selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING
                ? "blue"
                : selectedOrder?.orderStatus === ORDER_STATUS.PICKED_UP
                ? "yellow"
                : selectedOrder?.orderStatus === ORDER_STATUS.COMPLETED
                ? "green"
                : "blue"
            }
            variant="outlined"
            borderRadius={"$12"}
            onPress={() => {
              if (selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING) {
                changeStatus(Number(id), ORDER_STATUS.PICKED_UP);
              } else if (
                selectedOrder?.orderStatus === ORDER_STATUS.PICKED_UP
              ) {
                changeStatus(Number(id), ORDER_STATUS.COMPLETED);
              } else if (
                selectedOrder?.orderStatus === ORDER_STATUS.COMPLETED
              ) {
                router.navigate("/(tabs)/home");
              }
            }}
          >
            {buttonText}
          </Button>
        </View>
      </BottomSheetFooter>
    ),
    [selectedOrder, buttonText, id, changeStatus, theme.background.val] // Add all dependencies]
  );

  type OpenMapArgs = {
    lat: string | number;
    lng: string | number;
    label: string;
  };

  const openMap = ({ lat, lng, label }: OpenMapArgs) => {
    const scheme = Platform.select({
      ios: `maps://?q=${label}&ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
    });

    if (scheme) {
      Linking.openURL(scheme).catch((err) =>
        console.error("Error opening map: ", err)
      );
    }
  };

  // Update loading check
  if (!selectedOrder || !naviation) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "On Going",
            headerShown: false,
            freezeOnBlur: false,
          }}
        />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Spinner size="large" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "On Going",
          headerShown: false,
          freezeOnBlur: false,
        }}
      />

      <GestureHandlerRootView style={styles.container}>
        <View
          zIndex={0}
          flex={1}
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="65%"
        >
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {/* Add key prop to force re-render */}
            <MapViewDirections
              origin={userLocation}
              destination={{
                latitude: naviation?.destination?.latitude!,
                longitude: naviation?.destination?.longitude!,
              }}
              apikey={GOOGLE_MAPS_APIKEY!}
              strokeWidth={5}
              strokeColor={
                selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING
                  ? theme.blue10.val
                  : selectedOrder?.orderStatus === ORDER_STATUS.PICKED_UP
                  ? theme.yellow11.val
                  : selectedOrder?.orderStatus === ORDER_STATUS.COMPLETED
                  ? theme.yellow11.val
                  : theme.green10.val
              }
              optimizeWaypoints={true}
              onReady={(result) => {
                mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    right: 30,
                    left: 30,
                    top: 100,
                    bottom: 100,
                  },
                });
              }}
            />
            <Marker
              title="Pickup Location"
              coordinate={{
                latitude: selectedOrder.pickup.latitude!,
                longitude: selectedOrder.pickup.longitude!,
              }}
            >
              <View>
                <MapPin size={"$4"} color={pickupColor} borderWidth={"$1"} />
              </View>
            </Marker>

            <Marker
              coordinate={{
                latitude: selectedOrder.dropoff.latitude!,
                longitude: selectedOrder.dropoff.longitude!,
              }}
              title="Dropoff Location"
            >
              <View>
                <MapPin size={"$4"} color={dropoffColor} borderWidth={"$1"} />
              </View>
            </Marker>
          </MapView>
        </View>
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          onChange={handleSheetChanges}
          snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor: theme.background.val }}
          style={{
            padding: 0,
            margin: 0,
          }}
          handleStyle={{
            display: "none",
          }}
          footerComponent={renderFooter}
        >
          <BottomSheetView style={styles.contentContainer}>
            <YStack my={"$2"} mb={"$4"} gap={"$4"}>
              <XStack
                justifyContent="space-between"
                alignItems="center"
                height={"$8"}
                borderBottomWidth={"$1"}
                px={"$4"}
                borderBottomColor={"$gray5"}
              >
                <XStack flex={1}></XStack>

                {/* Order Type */}
                <YStack flex={1} justifyContent="center" alignItems="center">
                  <SizableText
                    fontWeight={800}
                    color={
                      selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING
                        ? pickupColor
                        : selectedOrder?.orderStatus === ORDER_STATUS.PICKED_UP
                        ? dropoffColor
                        : selectedOrder?.orderStatus === ORDER_STATUS.COMPLETED
                        ? completedColor
                        : pickupColor
                    }
                  >
                    {selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING
                      ? "Collecting Order"
                      : selectedOrder?.orderStatus === ORDER_STATUS.PICKED_UP
                      ? "Delivering Order"
                      : selectedOrder?.orderStatus === ORDER_STATUS.COMPLETED
                      ? "Order Complete"
                      : null}
                  </SizableText>
                  <SizableText>{selectedOrder?.orderType.name}</SizableText>
                </YStack>
                <XStack flex={1} justifyContent="flex-end" alignItems="center">
                  {/* Navigate Icon */}
                  {selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING ||
                  selectedOrder?.orderStatus === ORDER_STATUS.PICKED_UP ? (
                    <YStack ai={"center"}>
                      <Button
                        circular
                        size={"$4"}
                        flex={1}
                        jc={"center"}
                        ai={"center"}
                        onPress={() => {
                          if (
                            selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING
                          ) {
                            openMap({
                              lat: naviation.origin.latitude,
                              lng: naviation.origin.longitude,
                              label: selectedOrder.pickup.address,
                            });
                          } else if (
                            selectedOrder?.orderStatus ===
                            ORDER_STATUS.PICKED_UP
                          ) {
                            openMap({
                              lat: naviation.destination.latitude,
                              lng: naviation.destination.longitude,
                              label: selectedOrder.dropoff.address,
                            });
                          }
                        }}
                      >
                        <Navigation size={"$1"} />
                      </Button>
                      <SizableText>Navigate</SizableText>
                    </YStack>
                  ) : null}
                </XStack>
              </XStack>
              <YStack p={"$4"}>
                <XStack justifyContent="center" alignItems="center">
                  <Circle
                    size={"$8"}
                    backgroundColor={
                      selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING
                        ? pickupColor
                        : selectedOrder?.orderStatus === ORDER_STATUS.PICKED_UP
                        ? dropoffColor
                        : selectedOrder?.orderStatus === ORDER_STATUS.COMPLETED
                        ? completedColor
                        : pickupColor
                    }
                    justifyContent={"center"}
                  >
                    {selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING ? (
                      <Bike size={"$4"} />
                    ) : selectedOrder?.orderStatus ===
                      ORDER_STATUS.PICKED_UP ? (
                      <Bike size={"$4"} />
                    ) : selectedOrder?.orderStatus ===
                      ORDER_STATUS.COMPLETED ? (
                      <MapPinCheck size={"$4"} />
                    ) : (
                      <Bike size={"$4"} />
                    )}
                  </Circle>
                </XStack>
                <YStack gap={"$2"} minHeight={"$8"}>
                  <SizableText fontWeight={800} textAlign="center">
                    {selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING
                      ? "Pickup Location"
                      : selectedOrder?.orderStatus === ORDER_STATUS.PICKED_UP
                      ? "Dropoff Location"
                      : selectedOrder?.orderStatus === ORDER_STATUS.COMPLETED
                      ? "Completed"
                      : null}
                  </SizableText>
                  <SizableText textAlign="center">
                    {selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING
                      ? selectedOrder?.pickup.address
                      : selectedOrder?.orderStatus === ORDER_STATUS.PICKED_UP
                      ? selectedOrder?.dropoff.address
                      : selectedOrder?.orderStatus === ORDER_STATUS.COMPLETED
                      ? null
                      : null}
                  </SizableText>
                </YStack>
              </YStack>
            </YStack>
            <Card gap={"$4"} mb={30} mx={"$4"}>
              <XStack
                justifyContent="space-between"
                alignItems="center"
                padding={"$4"}
              >
                <XGroup gap={"$4"}>
                  <XGroup.Item>
                    <Button
                      flexDirection="column"
                      padding={0}
                      size={"$6"}
                      chromeless
                      onPress={() => {
                        Linking.openURL(
                          `tel:${selectedOrder?.customer.user.phone}`
                        );
                      }}
                    >
                      <Phone size={16} />
                      <SizableText>Call Customer</SizableText>
                    </Button>
                  </XGroup.Item>
                </XGroup>
                <YStack>
                  <SizableText
                    textAlign="right"
                    fontWeight={800}
                    color={
                      selectedOrder?.orderStatus === ORDER_STATUS.ON_GOING
                        ? pickupColor
                        : selectedOrder?.orderStatus === ORDER_STATUS.PICKED_UP
                        ? dropoffColor
                        : selectedOrder?.orderStatus === ORDER_STATUS.COMPLETED
                        ? completedColor
                        : pickupColor
                    }
                  >
                    {selectedOrder?.customer.user.name}
                  </SizableText>
                  <SizableText textAlign="right" size={"$2"}>
                    {selectedOrder?.customer.user.phone}
                  </SizableText>
                </YStack>
              </XStack>
            </Card>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
    zIndex: 1,
  },
  contentContainer: {
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default OnGoingPage;
