import React from "react";
import { Pressable, View, PressableProps } from "react-native";
import { Text } from "@/components/ui/text";
import { ChevronRight } from "lucide-react-native";

type Props = PressableProps & {
  label: string;
  danger?: boolean;
  leftIcon?: React.ReactNode;
};

export default function SettingsItem({ label, danger, leftIcon, ...pressableProps }: Props) {
  return (
    <Pressable className="px-4 py-3 active:opacity-70" {...pressableProps}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {leftIcon}
          <Text className={`${danger ? "text-destructive" : "text-foreground"} text-base`}>
            {label}
          </Text>
        </View>
        <ChevronRight size={18} />
      </View>
    </Pressable>
  );
}
