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
import { Stack, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Linking, Platform, StyleSheet } from "react-native";
import { Bike, Navigation, Phone } from "@tamagui/lucide-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useOnGoingStore } from "store/on-going.store";
import { useFocusEffect } from "@react-navigation/native";

const OnGoingPage = () => {
  const id = useLocalSearchParams<{ id: string }>().id;
  const selectedOrder = useOnGoingStore((state) => state.ongoingOrder);
  const getOngoing = useOnGoingStore((state) => state.getOngoing);
  const userLocation = useOnGoingStore((state) => state.userLiveLocation);
  const getLiveLocation = useOnGoingStore((state) => state.getUserLiveLocation);

  const pickupColor = "$green11Light";
  const dropoffColor = "$red11Light";

  const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const snapPoints = useMemo(() => ["45%"], []);

  const [initialRegion, setInitialRegion] = useState({
    latitude: 3.0700939853725044,
    longitude: 101.49932443650975,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });

  const pickup = {
    latitude: Number(selectedOrder?.pickup.latitude)!,
    longitude: Number(selectedOrder?.pickup.longitude)!,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const dropoff = {
    latitude: Number(selectedOrder?.dropoff.latitude)!,
    longitude: Number(selectedOrder?.dropoff.longitude)!,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const renderFooter = useCallback(
    (props) => (
      <BottomSheetFooter
        {...props}
        style={{ backgroundColor: theme.background.val, paddingBottom: 32 }}
      >
        <View px="$4">
          <Button size="$4" width="100%" theme={"green"} variant="outlined">
            Arrived
          </Button>
        </View>
      </BottomSheetFooter>
    ),
    []
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

  // Replace useEffect with useFocusEffect
  useFocusEffect(
    useCallback(() => {
      getOngoing(Number(id));
      getLiveLocation();
    }, [getOngoing, getLiveLocation, id])
  );

  useEffect(() => {
    setInitialRegion({
      latitude: 3.0767948948878945,
      longitude: 101.50092601247685,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  }, []);

  useEffect(() => {}, []);

  const theme = useTheme();

  // Update loading check
  if (!userLocation) {
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
            customMapStyle={mapStyle}
          >
            {/* Add key prop to force re-render */}
            <MapViewDirections
              origin={{
                latitude:
                  userLocation?.coords.latitude ?? initialRegion.latitude,
                longitude:
                  userLocation?.coords.longitude ?? initialRegion.longitude,
              }}
              destination={{
                latitude: pickup.latitude,
                longitude: pickup.longitude,
              }}
              apikey={GOOGLE_MAPS_APIKEY!}
              strokeWidth={4}
              strokeColor={theme.green10.val}
              optimizeWaypoints={true}
              onReady={(result) => {
                mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    right: 30,
                    left: 30,
                    top: 100,
                    bottom: 200,
                  },
                });
              }}
            />
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              title="Your Location"
            />

            <Marker
              coordinate={{
                latitude:
                  userLocation?.coords.latitude ?? initialRegion.latitude,
                longitude:
                  userLocation?.coords.longitude ?? initialRegion.longitude,
              }}
            ></Marker>
            <Marker
              coordinate={{
                latitude: pickup.latitude,
                longitude: pickup.longitude,
              }}
              title={"Dropoff"}
              description={selectedOrder?.dropoff.address}
            ></Marker>
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
                  <SizableText fontWeight={800} color={"$green10"}>
                    Collect Order
                  </SizableText>
                  <SizableText>{selectedOrder?.orderType.name}</SizableText>
                </YStack>
                <XStack flex={1} justifyContent="flex-end" alignItems="center">
                  {/* Navigate Icon */}
                  <YStack ai={"center"}>
                    <Button
                      circular
                      size={"$4"}
                      flex={1}
                      jc={"center"}
                      ai={"center"}
                      onPress={() =>
                        openMap({
                          lat: selectedOrder?.pickup.latitude!,
                          lng: selectedOrder?.pickup.longitude!,
                          label: selectedOrder?.pickup.address!,
                        })
                      }
                    >
                      <Navigation size={"$1"} />
                    </Button>
                    <SizableText>Navigate</SizableText>
                  </YStack>
                </XStack>
              </XStack>
              <YStack p={"$4"}>
                <XStack justifyContent="center" alignItems="center">
                  <Circle
                    size={"$8"}
                    backgroundColor={pickupColor}
                    justifyContent={"center"}
                  >
                    <Bike size={"$4"} />
                  </Circle>
                </XStack>
                <YStack gap={"$2"}>
                  <SizableText fontWeight={800} textAlign="center">
                    Pickup
                  </SizableText>
                  <SizableText textAlign="center">
                    {selectedOrder?.pickup.address}
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
                    {/* <Button
                      flexDirection="column"
                      padding={0}
                      size={"$6"}
                      chromeless
                    >
                      <Phone size={16} />
                      <SizableText>Call</SizableText>
                    </Button> */}
                  </XGroup.Item>
                </XGroup>
                <YStack>
                  <SizableText
                    textAlign="right"
                    fontWeight={800}
                    color={"$green10"}
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

// Add this constant outside the component
const mapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#242f3e",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#746855",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#242f3e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#38414e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#212a37",
      },
    ],
  },
];

export default OnGoingPage;
