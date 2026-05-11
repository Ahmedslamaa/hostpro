import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { reservationsApi } from "@/lib/api";

const COLORS = { coral: "#FF5A5F", dark: "#222222", gray: "#717171", border: "#DDDDDD", bg: "#F7F7F7", white: "#FFFFFF" };

const MOCK = [
  { id: "r1", guest_name: "Sophie Martin",    property_name: "Villa Azur",    check_in: "2026-05-15", check_out: "2026-05-19", nights: 4, total_price: 936,  status: "confirmed", source: "airbnb" },
  { id: "r2", guest_name: "Jean-Pierre Dupont",property_name: "Apt. Bellevue", check_in: "2026-05-17", check_out: "2026-05-24", nights: 7, total_price: 1540, status: "confirmed", source: "booking" },
  { id: "r3", guest_name: "Maria Garcia",     property_name: "Studio Monaco", check_in: "2026-05-20", check_out: "2026-05-23", nights: 3, total_price: 810,  status: "pending",   source: "manual" },
  { id: "r4", guest_name: "Thomas Klein",     property_name: "Mas Provençal", check_in: "2026-05-22", check_out: "2026-05-29", nights: 7, total_price: 1890, status: "confirmed", source: "airbnb" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: "Confirmée", color: "#16A34A", bg: "#DCFCE7" },
  pending:   { label: "En attente", color: "#D97706", bg: "#FEF3C7" },
  cancelled: { label: "Annulée",   color: "#DC2626", bg: "#FEE2E2" },
  completed: { label: "Terminée",  color: "#717171", bg: "#F7F7F7" },
};

function ReservationCard({ item }: { item: any }) {
  const s = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.guestAvatar}>
          <Text style={styles.guestAvatarText}>{item.guest_name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.guestName}>{item.guest_name}</Text>
          <Text style={styles.propName}>{item.property_name}</Text>
        </View>
        <Text style={styles.amount}>{item.total_price.toLocaleString("fr-FR")}€</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.dates}>
          {new Date(item.check_in).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} →{" "}
          {new Date(item.check_out).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} · {item.nights} nuits
        </Text>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState(MOCK);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all");

  const load = async () => {
    try {
      const res = await reservationsApi.list();
      if (res.data?.length) setReservations(res.data);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? reservations : reservations.filter(r => r.status === filter);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Réservations</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        {(["all", "confirmed", "pending"] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "Toutes" : f === "confirmed" ? "Confirmées" : "En attente"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <ReservationCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.coral} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: COLORS.bg },
  header:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title:           { fontSize: 22, fontWeight: "800", color: COLORS.dark },
  addBtn:          { width: 36, height: 36, backgroundColor: COLORS.coral, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  filters:         { flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterBtn:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  filterBtnActive: { backgroundColor: COLORS.dark, borderColor: COLORS.dark },
  filterText:      { fontSize: 13, color: COLORS.gray, fontWeight: "600" },
  filterTextActive:{ color: COLORS.white },
  list:            { paddingHorizontal: 20, paddingBottom: 24 },
  card:            { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  guestAvatar:     { width: 38, height: 38, backgroundColor: `${COLORS.coral}15`, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  guestAvatarText: { color: COLORS.coral, fontWeight: "800", fontSize: 15 },
  guestName:       { fontSize: 14, fontWeight: "700", color: COLORS.dark },
  propName:        { fontSize: 12, color: COLORS.gray, marginTop: 1 },
  amount:          { fontSize: 15, fontWeight: "800", color: COLORS.dark },
  cardFooter:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dates:           { fontSize: 12, color: COLORS.gray },
  badge:           { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:       { fontSize: 11, fontWeight: "700" },
});
