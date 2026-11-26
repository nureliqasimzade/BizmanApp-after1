import { palette } from "@/theme/theme";
import { Tabs } from "expo-router";

import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              color={focused ? palette.primary : palette.muted}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="account-group-outline"
              color={focused ? palette.primary : palette.muted}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
