import { Card, Circle, ScrollView, SizableText, XStack, YStack } from "tamagui";
import { useActiveOrderStore } from "store/active-order.store";
import { useAuthStore } from "store/auth.store";
import { Link, useNavigation } from "expo-router";
import { MapPin, MessageSquareText } from "@tamagui/lucide-icons";
import { format, sub } from "date-fns";
import { useEffect } from "react";
import { ORDER_STATUS, useOrderStore } from "store/orders.store";
import { BackHandler, RefreshControl } from "react-native";

const DeliveryPage = () => {
  const orders = useOrderStore((state) => state.orders);
  const getAll = useOrderStore((state) => state.getOrders);
  const user = useAuthStore((state) => state.user);

  // Navigation
  const navigation = useNavigation();

  // Effect
  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      console.log("onback");
      BackHandler.exitApp();
      navigation.dispatch(e.data.action);
    });
  }, []);

  useEffect(() => {
    getAll();
  }, [getAll]);

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={getAll} />
        }
      >
        {!user?.Runner?.isOnDuty ? (
          <Card bordered elevate p={"$3"} m={"$3"}>
            <SizableText>
              You are offline. Switch the toggle above to start taking orders.
            </SizableText>
          </Card>
        ) : (
          <YStack gap={"$2"} p={"$2"}>
            {orders.map((order, index) =>
              order.orderStatus === ORDER_STATUS.OPEN ? (
                <Link
                  key={index}
                  href={{
                    pathname: "/(delivery)/[id]",
                    params: { id: order.id.toString() },
                  }}
                  asChild
                >
                  <Card bordered elevate>
                    <Card.Header
                      p={"$2"}
                      px={"$3"}
                      m={0}
                      borderTopLeftRadius={"$2"}
                      borderTopRightRadius={"$2"}
                      borderBottomWidth={"$1"}
                      borderBottomColor={"$gray5"}
                    >
                      <XStack flex={1} justifyContent={"space-between"}>
                        <SizableText size={"$5"}>
                          {order.orderType.name}
                        </SizableText>
                        <SizableText size={"$3"}>
                          {format(
                            new Date(order.createdAt),
                            "dd MMM yyyy HH:mm"
                          )}
                        </SizableText>
                      </XStack>
                    </Card.Header>

                    <YStack flex={1} p={"$3"} py={"$5"} gap={"$2"}>
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
                        #{order.id}
                      </SizableText>

                      <XStack alignItems="center" gap={"$2"}>
                        <Circle
                          size={15}
                          borderColor={"$blue10"}
                          borderWidth={"$1"}
                        />
                        <SizableText>{order.pickup.address}</SizableText>
                      </XStack>
                      <XStack alignItems="center" gap={"$2"}>
                        <MapPin
                          size={15}
                          color={"$green10"}
                          borderWidth={"$1"}
                        />
                        <SizableText>{order.dropoff.address}</SizableText>
                      </XStack>
                      {order.remarks ? (
                        <XStack
                          flex={1}
                          alignItems="center"
                          gap={"$2"}
                          mt={"$2"}
                          p={"$2"}
                          backgroundColor={"$gray5"}
                          borderRadius={"$4"}
                        >
                          <MessageSquareText size={15} />
                          <SizableText
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            flexShrink={1}
                          >
                            {order.remarks}
                          </SizableText>
                        </XStack>
                      ) : null}
                    </YStack>
                    <Card.Footer
                      p={"$2"}
                      px={"$3"}
                      borderTopWidth={"$1"}
                      borderTopColor={"$gray5"}
                    >
                      <XStack flex={1} justifyContent="flex-end">
                        <SizableText size={"$5"}>
                          RM {order.payment.toFixed(2)}
                        </SizableText>
                      </XStack>
                    </Card.Footer>
                  </Card>
                </Link>
              ) : null
            )}
          </YStack>
        )}
      </ScrollView>
    </>
  );
};

export default DeliveryPage;
