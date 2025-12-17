import React from "react";
import { Pressable, View, PressableProps, useColorScheme } from "react-native";
import { Text } from "@/components/ui/text";
import { ChevronRight } from "lucide-react-native";
import { THEME } from "@/lib/theme";

type Props = PressableProps & {
  label: string;
  danger?: boolean;
  leftIcon?: React.ReactNode;
};

export default function SettingsItem({ label, danger, leftIcon, ...pressableProps }: Props) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  return (
    <Pressable className="px-4 py-3 active:opacity-70" {...pressableProps}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {leftIcon}
          <Text className={`${danger ? "text-destructive" : "text-foreground"} text-base`}>
            {label}
          </Text>
        </View>
        <ChevronRight size={18} color={theme.foreground}/>
      </View>
    </Pressable>
  );
}
