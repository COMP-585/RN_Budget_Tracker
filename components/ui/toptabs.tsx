import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Tab {
  key: string;
  title: string;
  content: React.ReactNode;
}

interface TopTabsProps {
  tabs: Tab[];
  initialTab?: string;
}

export default function TopTabs({ tabs, initialTab }: TopTabsProps) {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0].key);

  return (
    <View style={{ flex: 1 }}>
      {/* Tab Headers */}
      <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc", }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth: activeTab === tab.key ? 3 : 0,
              borderBottomColor: activeTab === tab.key ? "#007AFF" : "transparent",
            }}
          >
            <Text style={{ color: activeTab === tab.key ? "#007AFF" : "#888", fontWeight: "bold",}}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Tab Content */}
      <View style={{ flex: 1, padding: 20 }}>
        {tabs.find((tab) => tab.key === activeTab)?.content}
      </View>
    </View>
  );
}
