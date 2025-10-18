import { View } from "react-native";
import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

export default function SettingsCard({ children, className = "" }: Props) {
  return (
    <View className={`rounded-2xl bg-card/70 shadow-sm border border-border/60 ${className}`}>
      {children}
    </View>
  );
}
