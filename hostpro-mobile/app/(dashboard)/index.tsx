import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/authStore";
import { dashboardApi } from "@/lib/api";

const COLORS = { coral: "#FF5A5F", dark: "#222222", gray: "#717171", border: "#DDDDDD", bg: "#F7F7F7", white: "#FFFFFF" };

// Mock data fallback
const MOCK_KPIS = { occupancy_rate: 78, total_revenue: 19480, adr: 196, active_properties: 4, total_reservations: 47 };
const MOCK_UPCOMING = [
  { id: "1", guest_name: "Sophie Martin",    property_name: "Villa Azur",    check_in: "2026-05-15", nights: 4 },
  { id: "2", guest_name: "Jean Dupont",      property_name: "Apt. Bellevue", check_in: "2026-05-17", nights: 7 },
  { id: "3", guest_name: "Maria Garcia",     property_name: "Studio Monaco", check_in: "2026-05-20", nights: 3 },
];
const MOCK_ALERTS = [
  { property_name: "Studio Monaco", message: "N° d'enregistrement manquant", severity: "critical" },
  { property_name: "Mas Provençal", message: "DPE classe E — mise à niveau recommandée", severity: "warning" },
];

function KPICard({ label, value, icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <View style={[styles.kpiCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [kpis, setKpis] = useState(MOCK_KPIS);
  const [upcoming, setUpcoming] = useState(MOCK_UPCOMING);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [k, u, a] = await Promise.all([
        dashboardApi.kpis(),
        dashboardApi.upcoming(14),
        dashboardApi.alerts(),
      ]);
      if (k.data) setKpis(k.data);
      if (u.data) setUpcoming(u.data);
      if (a.data) setAlerts(a.data);
    } catch {
      // Utiliser les données mock
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { setLoading(true); load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const initials = (name?: string | null) =>
    name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.coral} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.name}>{user?.full_name?.split(" ")[0] ?? "Ahmed"} 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user?.full_name)}</Text>
          </View>
        </View>

        {/* Alertes */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            {alerts.map((a, i) => (
              <View key={i} style={[styles.alertCard, { borderLeftColor: a.severity === "critical" ? "#EF4444" : "#F59E0B" }]}>
                <Ionicons name="warning" size={14} color={a.severity === "critical" ? "#EF4444" : "#F59E0B"} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertProp}>{a.property_name}</Text>
                  <Text style={styles.alertMsg}>{a.message}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* KPIs */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.coral} />
          </View>
        ) : (
          <View style={styles.kpiGrid}>
            <KPICard label="Taux d'occupation" value={`${kpis.occupancy_rate}%`} icon="trending-up" color={COLORS.coral} />
            <KPICard label="Revenus du mois" value={`${kpis.total_revenue.toLocaleString("fr-FR")}€`} icon="cash" color="#10B981" />
            <KPICard label="Prix moy. / nuit" value={`${kpis.adr}€`} icon="bed" color="#6366F1" />
            <KPICard label="Biens actifs" value={String(kpis.active_properties)} icon="home" color="#F59E0B" />
          </View>
        )}

        {/* Prochaines arrivées */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prochaines arrivées</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>

          {upcoming.map((r) => (
            <View key={r.id} style={styles.arrivalCard}>
              <View style={styles.arrivalAvatar}>
                <Text style={styles.arrivalAvatarText}>{r.guest_name[0]}</Text>
              </View>
              <View style={styles.arrivalInfo}>
                <Text style={styles.arrivalName}>{r.guest_name}</Text>
                <Text style={styles.arrivalProp}>{(r as any).property_name}</Text>
              </View>
              <View style={styles.arrivalDates}>
                <Text style={styles.arrivalDate}>{new Date(r.check_in).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</Text>
                <Text style={styles.arrivalNights}>{r.nights} nuits</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: COLORS.bg },
  scroll:            { flex: 1 },
  header:            { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  greeting:          { fontSize: 14, color: COLORS.gray },
  name:              { fontSize: 22, fontWeight: "800", color: COLORS.dark },
  avatar:            { width: 40, height: 40, backgroundColor: `${COLORS.coral}20`, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText:        { color: COLORS.coral, fontWeight: "800", fontSize: 14 },
  section:           { paddingHorizontal: 20, marginBottom: 16 },
  sectionHeader:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle:      { fontSize: 16, fontWeight: "700", color: COLORS.dark },
  seeAll:            { fontSize: 13, color: COLORS.coral, fontWeight: "600" },
  alertCard:         { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: COLORS.white, borderRadius: 12, borderLeftWidth: 4, padding: 12, marginBottom: 8 },
  alertProp:         { fontSize: 12, fontWeight: "700", color: COLORS.dark },
  alertMsg:          { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  kpiGrid:           { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  kpiCard:           { width: "47%", backgroundColor: COLORS.white, borderRadius: 16, padding: 16, gap: 6, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  kpiValue:          { fontSize: 22, fontWeight: "800", color: COLORS.dark },
  kpiLabel:          { fontSize: 11, color: COLORS.gray },
  loadingContainer:  { height: 160, alignItems: "center", justifyContent: "center" },
  arrivalCard:       { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 8, gap: 12 },
  arrivalAvatar:     { width: 40, height: 40, backgroundColor: `${COLORS.coral}15`, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  arrivalAvatarText: { fontSize: 16, fontWeight: "800", color: COLORS.coral },
  arrivalInfo:       { flex: 1 },
  arrivalName:       { fontSize: 14, fontWeight: "700", color: COLORS.dark },
  arrivalProp:       { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  arrivalDates:      { alignItems: "flex-end" },
  arrivalDate:       { fontSize: 13, fontWeight: "700", color: COLORS.dark },
  arrivalNights:     { fontSize: 11, color: COLORS.gray, marginTop: 2 },
});
