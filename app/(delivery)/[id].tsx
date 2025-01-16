import {
  Button,
  Card,
  Circle,
  ScrollView,
  Separator,
  SizableText,
  XStack,
  YStack,
} from "tamagui";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { MapPin, MessageSquareText, PhoneCall } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import { useActiveOrderStore } from "store/active-order.store";
import { Linking, Platform } from "react-native";

const ViewOrder = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useActiveOrderStore((state) =>
    state.activeOrders.find((order) => order.id.toString() === id)
  );
  const startOrder = useActiveOrderStore((state) => state.startOrder);

  const startNow = () => {
    // startOrder(Number(id));
    router.navigate({ pathname: "/(ongoing)/[id]", params: { id: id } });
  };

  const onPressCallButton = (number) => {
    console.log(`Calling ${number}`);

    let phoneNumber = "";

    if (Platform.OS === "android") {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }

    Linking.openURL(phoneNumber);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: order?.orderStatus as string,
          headerShown: true,
        }}
      />
      <ScrollView>
        <YStack m={"$3"} gap={"$2"}>
          <Card bordered elevate>
            <XStack flex={1} justifyContent="space-between" alignItems="center">
              <YStack flex={1} p={"$3"}>
                <SizableText size={"$5"} fontWeight={800}>
                  Customer
                </SizableText>
                <SizableText size={"$3"}>
                  {order?.customer.user.name}
                </SizableText>
              </YStack>
              <XStack mr={"$2"} gap={"$1"}>
                <Button
                  onPress={() => onPressCallButton(order?.customer.user.phone)}
                  theme={"gray"}
                >
                  <PhoneCall size={"$1"} />
                </Button>
              </XStack>
            </XStack>
          </Card>
          <Card bordered elevate>
            <YStack flex={1} p={"$3"}>
              <SizableText size={"$7"}>
                RM {order?.payment.toFixed(2)}
              </SizableText>
              <SizableText size={"$2"} color={"$gray10"}>
                Earnings
              </SizableText>
            </YStack>
          </Card>
          <Card bordered elevate>
            <Card.Header p={"$2"} px={"$3"} m={0}>
              <XStack flex={1} justifyContent={"space-between"}>
                <SizableText size={"$3"}>{order?.orderType.name}</SizableText>
                <SizableText size={"$3"}>
                  {order?.createdAt
                    ? format(new Date(order.createdAt), "dd MMM yyyy HH:mm")
                    : "N/A"}
                </SizableText>
              </XStack>
            </Card.Header>
            <Separator my={"$1"} />
            <YStack flex={1} p={"$3"} py={"$5"} gap={"$3"}>
              <SizableText
                m={"$2"}
                mx={"$3"}
                position="absolute"
                p={"$2"}
                size={"$2"}
                backgroundColor={"$gray5"}
                borderRadius={"$4"}
                right={0}
              >
                #{order?.id}
              </SizableText>

              <XStack alignItems="center" gap={"$2"}>
                <Circle size={15} borderColor={"$blue10"} borderWidth={"$1"} />
                <SizableText>{order?.pickup.address}</SizableText>
              </XStack>
              <XStack alignItems="center" gap={"$2"}>
                <MapPin size={15} color={"$green10"} borderWidth={"$1"} />
                <SizableText>{order?.dropoff.address}</SizableText>
              </XStack>
            </YStack>
          </Card>
          {order?.remarks ? (
            <Card bordered elevate p={"$3"}>
              <XStack flex={1} alignItems="flex-start" gap={"$2"}>
                <MessageSquareText size={15} mt={5} />
                <SizableText flexShrink={1}>{order.remarks}</SizableText>
              </XStack>
            </Card>
          ) : null}
        </YStack>
      </ScrollView>
      <YStack
        flex={1}
        position="absolute"
        bottom={10}
        p={"$3"}
        gap={"$2"}
        w={"100%"}
      >
        <Button theme={"blue"} onPress={() => startNow()}>
          Start Now
        </Button>
      </YStack>
    </>
  );
};

export default ViewOrder;
