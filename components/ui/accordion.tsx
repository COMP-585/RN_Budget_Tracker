import React, { ReactNode, useEffect, useState } from "react";
import {
    LayoutAnimation,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    UIManager,
    View,
    ViewStyle,
} from "react-native";

type AccordionProps = {
  title: string | ReactNode;
  children: ReactNode;
  initiallyOpen?: boolean;
  containerStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  /**
   * Optional element on the right side of the header.
   * If not provided, a + / - indicator will be shown.
   */
  rightElement?: ReactNode;
};

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  initiallyOpen = false,
  containerStyle,
  headerStyle,
  titleStyle,
  contentStyle,
  rightElement,
}) => {
  const [open, setOpen] = useState(initiallyOpen);

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable onPress={toggle} style={[styles.header, headerStyle]}>
        <View style={styles.titleWrapper}>
          {typeof title === "string" ? (
            <Text style={[styles.title, titleStyle]} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            title
          )}
        </View>

        <View style={styles.rightWrapper}>
          {rightElement ? (
            rightElement
          ) : (
            <Text style={styles.icon}>{open ? "−" : "+"}</Text>
          )}
        </View>
      </Pressable>

      {open && (
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 6,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleWrapper: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  rightWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
  },
});

export default Accordion;
