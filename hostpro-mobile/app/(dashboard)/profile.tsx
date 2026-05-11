import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

const COLORS = { coral: "#FF5A5F", dark: "#222222", gray: "#717171", border: "#DDDDDD", bg: "#F7F7F7", white: "#FFFFFF" };

function MenuRow({ icon, label, onPress, danger = false }: { icon: any; label: string; onPress?: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={18} color={danger ? "#EF4444" : COLORS.gray} />
      <Text style={[styles.menuLabel, danger && { color: "#EF4444" }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={COLORS.border} style={{ marginLeft: "auto" }} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const initials = (name?: string | null) =>
    name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initials(user?.full_name)}</Text>
          </View>
          <Text style={styles.name}>{user?.full_name ?? "Utilisateur"}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.planBadge}>
            <Ionicons name="diamond" size={12} color={COLORS.coral} />
            <Text style={styles.planText}>Plan Enterprise</Text>
          </View>
        </View>

        {/* Section Compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon compte</Text>
          <View style={styles.menuCard}>
            <MenuRow icon="person-outline"   label="Informations personnelles" />
            <MenuRow icon="lock-closed-outline" label="Sécurité et mot de passe" />
            <MenuRow icon="notifications-outline" label="Notifications push" />
          </View>
        </View>

        {/* Section Application */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <View style={styles.menuCard}>
            <MenuRow icon="language-outline"  label="Langue : Français" />
            <MenuRow icon="moon-outline"      label="Thème : Clair" />
            <MenuRow icon="shield-checkmark-outline" label="Politique de confidentialité" />
          </View>
        </View>

        {/* Section Danger */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuRow icon="log-out-outline" label="Déconnexion" onPress={handleLogout} danger />
          </View>
        </View>

        <Text style={styles.version}>HOST PRO v1.0.0 · © 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bg },
  header:       { alignItems: "center", paddingVertical: 32, paddingHorizontal: 20 },
  avatarLarge:  { width: 72, height: 72, backgroundColor: `${COLORS.coral}20`, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText:   { color: COLORS.coral, fontWeight: "900", fontSize: 26 },
  name:         { fontSize: 20, fontWeight: "800", color: COLORS.dark },
  email:        { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  planBadge:    { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: `${COLORS.coral}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  planText:     { fontSize: 12, fontWeight: "700", color: COLORS.coral },
  section:      { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: COLORS.gray, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, paddingLeft: 4 },
  menuCard:     { backgroundColor: COLORS.white, borderRadius: 16, overflow: "hidden" },
  menuRow:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.bg },
  menuLabel:    { fontSize: 14, color: COLORS.dark, fontWeight: "500", flex: 1 },
  version:      { textAlign: "center", fontSize: 11, color: COLORS.border, paddingBottom: 24, marginTop: 8 },
});
