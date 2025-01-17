import { useColorScheme } from "react-native";
import { TamaguiProvider, type TamaguiProviderProps } from "tamagui";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { config } from "../tamagui.config";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { useOnGoingStore } from "store/on-going.store";

export function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, "config">) {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider
      config={config}
      defaultTheme={colorScheme === "dark" ? "dark" : "light"}
      {...rest}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProvider
          swipeDirection="horizontal"
          duration={6000}
          native={
            [
              /* uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go */
              // 'mobile'
            ]
          }
        >
          {children}
          <ToastViewport top="$8" left={0} right={0} />
        </ToastProvider>
      </GestureHandlerRootView>
    </TamaguiProvider>
  );
}
