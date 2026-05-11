import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const COLORS = {
  coral:  "#FF5A5F",
  dark:   "#222222",
  gray:   "#717171",
  border: "#DDDDDD",
  bg:     "#F7F7F7",
  white:  "#FFFFFF",
};

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Champs requis", "Veuillez renseigner votre email et mot de passe.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(email.trim().toLowerCase(), password);
      const { user, access_token, refresh_token } = res.data;
      await setAuth(user, access_token, refresh_token);
      router.replace("/(dashboard)");
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? "Email ou mot de passe incorrect.";
      Alert.alert("Connexion échouée", msg);
    } finally {
      setLoading(false);
    }
  };

  // Mode démo — accès rapide en dev
  const handleDemo = async () => {
    await setAuth(
      { id: "demo", email: "demo@hostpro.fr", full_name: "Ahmed — Démo", avatar_url: null },
      "demo-token",
      "demo-refresh"
    );
    router.replace("/(dashboard)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoHost}>HOST</Text>
          <View style={styles.logoPro}>
            <Text style={styles.logoProText}>PRO</Text>
          </View>
        </View>
        <Text style={styles.tagline}>Gestion locative IA</Text>

        {/* Card de connexion */}
        <View style={styles.card}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Accédez à votre espace de gestion</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="vous@exemple.fr"
              placeholderTextColor={COLORS.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.gray}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDemo} style={styles.btnDemo} activeOpacity={0.8}>
            <Text style={styles.btnDemoText}>▶  Essayer la démo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          En vous connectant, vous acceptez nos{" "}
          <Text style={styles.footerLink}>Conditions d'utilisation</Text>
          {" "}et notre{" "}
          <Text style={styles.footerLink}>Politique de confidentialité</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  scroll:         { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoContainer:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 },
  logoHost:       { fontSize: 28, fontWeight: "900", color: COLORS.dark, letterSpacing: -0.5 },
  logoPro:        { backgroundColor: COLORS.coral, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  logoProText:    { fontSize: 20, fontWeight: "900", color: COLORS.white, letterSpacing: 0.5 },
  tagline:        { textAlign: "center", color: COLORS.gray, fontSize: 13, marginBottom: 32 },
  card:           { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  title:          { fontSize: 22, fontWeight: "800", color: COLORS.dark, marginBottom: 4 },
  subtitle:       { fontSize: 14, color: COLORS.gray, marginBottom: 24 },
  field:          { marginBottom: 16 },
  label:          { fontSize: 13, fontWeight: "600", color: COLORS.dark, marginBottom: 6 },
  input:          { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.dark, backgroundColor: COLORS.bg },
  btnPrimary:     { backgroundColor: COLORS.coral, paddingVertical: 14, borderRadius: 14, alignItems: "center", marginTop: 8 },
  btnDisabled:    { opacity: 0.6 },
  btnPrimaryText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  btnDemo:        { borderWidth: 1, borderColor: COLORS.border, paddingVertical: 12, borderRadius: 14, alignItems: "center", marginTop: 10 },
  btnDemoText:    { color: COLORS.gray, fontSize: 14, fontWeight: "600" },
  footer:         { textAlign: "center", fontSize: 11, color: COLORS.gray, marginTop: 24, lineHeight: 18 },
  footerLink:     { color: COLORS.coral, fontWeight: "600" },
});
