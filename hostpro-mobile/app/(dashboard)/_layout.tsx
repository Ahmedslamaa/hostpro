import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/authStore";
import { Redirect } from "expo-router";

const COLORS = { coral: "#FF5A5F", dark: "#222222", gray: "#AAAAAA", border: "#EEEEEE", white: "#FFFFFF" };

function TabIcon({ name, focused, label }: { name: any; focused: boolean; label: string }) {
  return (
    <View style={styles.tabIcon}>
      <Ionicons name={name} size={22} color={focused ? COLORS.coral : COLORS.gray} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function DashboardLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? "grid" : "grid-outline"} focused={focused} label="Dashboard" />,
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? "home" : "home-outline"} focused={focused} label="Biens" />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? "calendar" : "calendar-outline"} focused={focused} label="Séjours" />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? "checkmark-circle" : "checkmark-circle-outline"} focused={focused} label="Tâches" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? "person" : "person-outline"} focused={focused} label="Profil" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar:        { backgroundColor: COLORS.white, borderTopColor: COLORS.border, borderTopWidth: 1, height: 80, paddingBottom: 12, paddingTop: 8, elevation: 8, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  tabIcon:       { alignItems: "center", gap: 3 },
  tabLabel:      { fontSize: 10, color: COLORS.gray, fontWeight: "500" },
  tabLabelActive: { color: COLORS.coral, fontWeight: "700" },
});
