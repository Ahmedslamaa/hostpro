# HOST PRO Mobile — Guide de déploiement en test

## Prérequis

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login

# Configurer le projet (première fois)
eas build:configure
```

## Distribution interne (sans publier sur les stores)

### Android — APK direct

```bash
# Construire l'APK
npm run build:android
# → Génère un lien de téléchargement APK
# → Partager le lien aux testeurs par email / QR code
# → Installer directement sur le téléphone (autoriser sources inconnues)
```

### iOS — TestFlight (invitation directe)

```bash
# Prérequis : Compte Apple Developer (99€/an)
# Construire l'IPA
npm run build:ios

# Soumettre à TestFlight
eas submit --platform ios

# → Dans App Store Connect : ajouter les testeurs par email
# → Les testeurs reçoivent une invitation TestFlight
# → Installation via l'app TestFlight (pas l'App Store public)
```

## Tester en local avec Expo Go

```bash
# Démarrer le serveur de développement
npm start

# Scanner le QR code avec :
# - Expo Go (iPhone / Android)
# OU
# - Appareil photo iPhone (iOS 16+)
```

## Structure de l'app

```
hostpro-mobile/
├── app/
│   ├── (auth)/
│   │   └── login.tsx          # Écran de connexion
│   ├── (dashboard)/
│   │   ├── _layout.tsx        # Navigation par onglets
│   │   ├── index.tsx          # Dashboard (KPIs, alertes, arrivées)
│   │   ├── reservations.tsx   # Liste des réservations
│   │   ├── properties.tsx     # Liste des propriétés
│   │   ├── tasks.tsx          # Tâches Kanban
│   │   └── profile.tsx        # Profil & déconnexion
│   ├── _layout.tsx            # Root layout
│   └── index.tsx              # Redirection auth
├── stores/
│   └── authStore.ts           # Zustand + SecureStore (Keychain iOS / Keystore Android)
├── lib/
│   └── api.ts                 # Axios + refresh automatique
├── app.json                   # Config Expo
└── eas.json                   # Config builds (dev / preview / production)
```

## Sécurité mobile

- **Tokens** : stockés dans `expo-secure-store` (Keychain iOS, Keystore Android) — jamais en AsyncStorage
- **Refresh automatique** : rotation silencieuse des tokens expirés
- **Biométrie** : peut être ajoutée via `expo-local-authentication`
- **SSL Pinning** : à configurer en production avec `react-native-ssl-pinning`
- **Root/Jailbreak detection** : à ajouter via `react-native-device-info`
