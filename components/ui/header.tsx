import { THEME } from "@/lib/theme";
import React from "react";
import { StyleSheet, Text, TextStyle, TouchableOpacity, useColorScheme, View, ViewStyle } from "react-native";

type Props = {
    title: string;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
    rightComponent?: React.ReactNode; // image, icon, or button
    onRightPress?: () => void;        // optional press handler
};

export default function Header({ title, containerStyle, textStyle, rightComponent, onRightPress }: Props) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
    
  return (
    <View style={[styles.container, containerStyle]}>
        <Text style={[styles.primaryText, textStyle, { color: theme.foreground }]}>{title}</Text>

        {/* Right corner slot */}
        {rightComponent && (
            <TouchableOpacity
                style={styles.rightWrapper}
                onPress={onRightPress}
                disabled={!onRightPress}
            >
                {rightComponent}
            </TouchableOpacity>
        )};
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
        marginBottom: 2,
        marginTop: 2,
        //backgroundColor: "red"
    },
    primaryText: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 1
    },
    rightWrapper: {
        position: "absolute",
        right: 10,
    },
});
