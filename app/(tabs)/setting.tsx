import {
  Avatar,
  Button,
  ListItem,
  SizableText,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import { supabase } from "lib/supabase";
import { useAuthStore } from "store/auth.store";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { ChevronRight, LogOut, User2 } from "@tamagui/lucide-icons";

const index = () => {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const handleSignOut = () => {
    signOut();
  };

  return (
    user && (
      <YStack flex={1} gap={"$4"} p={"$4"}>
        <YStack alignItems="center" my={"$4"} gap={"$2"}>
          <Avatar size={"$12"} circular>
            <Avatar.Image
              accessibilityLabel="User profile picture"
              src={user.photo || ""}
            />
            <Avatar.Fallback backgroundColor="$blue10" />
          </Avatar>
          <YStack gap={"$1"} alignItems="center">
            <SizableText size={"$5"} fontWeight={800}>
              {user.name}
            </SizableText>
            <SizableText size={"$3"} color={"$gray10"}>
              {user.id}
            </SizableText>
          </YStack>
        </YStack>

        <YGroup>
          {/* <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title="Account"
              icon={<User2 />}
              theme={"gray"}
              iconAfter={<ChevronRight />}
            />
          </YGroup.Item> */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title="Sign Out"
              icon={<LogOut />}
              theme={"gray"}
              onPress={handleSignOut}
            />
          </YGroup.Item>
        </YGroup>
      </YStack>
    )
  );
};

export default index;
