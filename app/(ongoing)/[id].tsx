import {
  Button,
  Card,
  Circle,
  Separator,
  SizableText,
  View,
  XGroup,
  XStack,
  YStack,
  useTheme,
} from "tamagui";
import { Stack, useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Linking, Platform, StyleSheet } from "react-native";
import { Bike, Dot, Navigation, Phone } from "@tamagui/lucide-icons";
import { useActiveOrderStore } from "store/active-order.store";
import { useCallback, useEffect, useMemo, useRef } from "react";
import BottomSheet, {
  BottomSheetHandle,
  BottomSheetView,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const OnGoingPage = () => {
  const id = useLocalSearchParams<{ id: string }>().id;
  const selectedOrder = useActiveOrderStore((state) => state.ongoingOrder);
  const getOngoing = useActiveOrderStore((state) => state.getOngoing);

  const pickupColor = "$green11Light";
  const dropoffColor = "$red11Light";

  const snapPoints = useMemo(() => ["45%"], []);

  const initialRegion = {
    latitude: 3.0718155097395994,
    longitude: 101.50004155925505,
    latitudeDelta: 0.001,
    longitudeDelta: 0.01,
  };

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

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

  useEffect(() => {
    getOngoing(Number(id));
  }, [getOngoing, id]);

  const theme = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: "On Going",
          headerShown: false,
        }}
      />

      <GestureHandlerRootView style={styles.container}>
        <View zIndex={0} flex={1}>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            provider={PROVIDER_GOOGLE}
            customMapStyle={mapStyle}
          ></MapView>
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
            <Card gap={"$4"} mb={30}>
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
