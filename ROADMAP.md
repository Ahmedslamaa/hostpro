# 🗺️ HOST PRO — ROADMAP vers 100% fonctionnel

> Dernière mise à jour : Mai 2026  
> Avancement global : **~45%**

---

## 📁 STRUCTURE DU PROJET

```
C:\Users\ahmed\hostpro\
│
├── hostpro.code-workspace     ← Ouvrir ce fichier dans VS Code
├── start.ps1                  ← Démarrer tout en un clic
├── ROADMAP.md                 ← Ce fichier
├── SETUP.md                   ← Guide d'installation
│
├── hostpro-api/               ← BACKEND Python/FastAPI
│   ├── app/
│   │   ├── api/v1/            ← Endpoints HTTP
│   │   │   ├── auth.py        ✅ Login, Register, /me, Refresh
│   │   │   ├── properties.py  ✅ CRUD Biens + Owners
│   │   │   ├── reservations.py✅ CRUD Réservations + Guests
│   │   │   ├── tasks.py       ✅ CRUD Tâches
│   │   │   ├── calendar.py    ✅ Calendrier événements
│   │   │   ├── messages.py    ✅ Messagerie
│   │   │   ├── compliance.py  ✅ Conformité loi Le Meur
│   │   │   ├── dashboard.py   ✅ Stats & KPIs
│   │   │   └── router.py      ✅ Routes enregistrées
│   │   ├── models/            ✅ Tables SQLAlchemy (8 modèles)
│   │   ├── schemas/           ✅ Validation Pydantic
│   │   └── core/              ✅ Auth JWT, RBAC, Config
│   └── hostpro.db             ✅ Base de données SQLite locale
│
└── hostpro-web/               ← FRONTEND Next.js 14
    ├── app/
    │   ├── page.tsx           ✅ Landing page complète
    │   ├── (auth)/
    │   │   ├── login/         ✅ Page connexion (UI faite)
    │   │   └── register/      ✅ Page inscription (UI faite)
    │   └── (dashboard)/
    │       ├── page.tsx       ⚠️  Dashboard (UI faite, API partielle)
    │       ├── properties/    ⚠️  Biens (UI faite, API partielle)
    │       ├── reservations/  ⚠️  Réservations (UI faite, API partielle)
    │       ├── calendar/      ⚠️  Calendrier (UI faite, non connectée)
    │       ├── tasks/         ⚠️  Tâches (UI faite, non connectée)
    │       ├── messages/      ⚠️  Messages (UI faite, non connectée)
    │       ├── compliance/    ⚠️  Conformité (UI faite, non connectée)
    │       ├── settings/      ⚠️  Paramètres (UI faite, non connectée)
    │       └── team/          ⚠️  Équipe (UI faite, non connectée)
    ├── lib/                   ← Utilitaires (API client à créer)
    ├── stores/                ← Zustand state management
    ├── hooks/                 ← Custom React hooks
    └── components/            ← Composants réutilisables
```

---

## ✅ CE QUI FONCTIONNE DÉJÀ (45%)

| Module | Statut | Détail |
|--------|--------|--------|
| Base de données | ✅ 100% | SQLite local, 8 tables |
| API Auth | ✅ 100% | Register, Login, JWT, Refresh, /me |
| API Properties | ✅ 100% | CRUD + Owners + Slugs |
| API Reservations | ✅ 100% | CRUD + Guests + CalendarEvent auto |
| API Tasks | ✅ 100% | CRUD + Complete + Delete |
| API Calendar | ✅ 100% | Événements + iCal |
| API Messages | ✅ 100% | Conversations + envoi |
| API Compliance | ✅ 100% | Nuitées + Déclarations |
| API Dashboard | ✅ 100% | KPIs + Stats |
| Landing Page | ✅ 100% | Design complet responsive |
| UI Login/Register | ✅ 100% | Formulaires complets |
| UI Dashboard | ✅ 80% | Layout + toutes les pages |
| RBAC Permissions | ✅ 100% | 5 rôles configurés |

---

## 🔴 ÉTAPE 1 — Connecter le Frontend au Backend
**Priorité : CRITIQUE | Durée estimée : 2-3 jours**

### 1.1 Créer le client API centralisé
- [ ] `hostpro-web/lib/api.ts` — Axios/fetch avec token auto
- [ ] `hostpro-web/lib/auth.ts` — Gestion JWT (save/read/refresh)
- [ ] `hostpro-web/stores/auth.ts` — Store Zustand pour l'utilisateur

### 1.2 Page Login / Register → API
- [ ] POST `/auth/register` — Création compte
- [ ] POST `/auth/login` — Connexion + save token
- [ ] Redirection vers dashboard après login
- [ ] Déconnexion (clear token)

### 1.3 Middleware de protection des routes
- [ ] `hostpro-web/middleware.ts` — Redirection si non connecté
- [ ] Vérifier token valide à chaque navigation

### 1.4 Dashboard → API
- [ ] GET `/dashboard/stats` — KPIs (revenus, taux occupation, nb réservations)
- [ ] Afficher les vraies données

### 1.5 Properties → API
- [ ] GET `/properties` — Liste des biens
- [ ] POST `/properties` — Créer un bien
- [ ] PATCH `/properties/{id}` — Modifier
- [ ] Formulaire de création complet

### 1.6 Reservations → API
- [ ] GET `/reservations` — Liste avec filtres
- [ ] POST `/reservations` — Nouvelle réservation
- [ ] PATCH `/reservations/{id}/checkin` — Check-in
- [ ] PATCH `/reservations/{id}/checkout` — Check-out

### 1.7 Tasks → API
- [ ] GET `/tasks` — Liste par propriété/statut
- [ ] POST `/tasks` — Créer une tâche
- [ ] POST `/tasks/{id}/complete` — Marquer terminée

### 1.8 Calendar → API
- [ ] GET `/calendar/events` — Charger les événements
- [ ] Afficher dans la vue calendrier

### 1.9 Messages → API
- [ ] GET `/messages` — Conversations
- [ ] POST `/messages/{thread}/reply` — Répondre

### 1.10 Compliance → API
- [ ] GET `/compliance` — Statut par bien
- [ ] Afficher alertes nuitées

---

## 🟠 ÉTAPE 2 — Fonctionnalités Manquantes
**Priorité : HAUTE | Durée estimée : 3-4 jours**

### 2.1 Upload Photos des Biens
- [ ] Backend : endpoint POST `/properties/{id}/photos` (multipart)
- [ ] Stockage fichiers : dossier `uploads/` local (dev) → S3 (prod)
- [ ] Frontend : composant drag & drop photos

### 2.2 Gestion de l'Équipe
- [ ] Backend : endpoint POST `/team/invite` — Inviter un membre
- [ ] Backend : GET `/team` — Lister les membres
- [ ] Backend : PATCH `/team/{id}/role` — Changer le rôle
- [ ] Frontend : page Team connectée

### 2.3 Paramètres du Compte
- [ ] Backend : PATCH `/auth/profile` — Modifier nom/email
- [ ] Backend : POST `/auth/change-password`
- [ ] Frontend : formulaire paramètres fonctionnel

### 2.4 Sync iCal (Airbnb/Booking)
- [ ] Backend : POST `/calendar/import-ical` — Importer URL iCal
- [ ] Backend : GET `/calendar/export/{property_id}.ics` — Exporter
- [ ] Frontend : formulaire d'ajout URL iCal par bien

### 2.5 Notifications Email
- [ ] Intégrer Resend.com ou SendGrid
- [ ] Email confirmation inscription
- [ ] Email nouvelle réservation
- [ ] Alerte nuitées (loi Le Meur)

---

## 🟡 ÉTAPE 3 — Passer en Production
**Priorité : MOYENNE | Durée estimée : 1-2 jours**

### 3.1 Base de données PostgreSQL
- [ ] Créer un compte Railway.app
- [ ] Créer une DB PostgreSQL sur Railway
- [ ] Modifier `database.py` : SQLite → PostgreSQL
- [ ] Variables d'env : `DATABASE_URL=postgresql://...`
- [ ] Migration Alembic initiale

### 3.2 Déployer le Backend (Railway)
- [ ] Créer `Procfile` : `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Créer `railway.toml`
- [ ] Push sur GitHub → Deploy Railway
- [ ] Configurer variables d'environnement (SECRET_KEY, DATABASE_URL)
- [ ] URL Backend : `https://hostpro-api.railway.app`

### 3.3 Déployer le Frontend (Vercel)
- [ ] Push hostpro-web sur GitHub
- [ ] Connecter Vercel à GitHub
- [ ] Variable : `NEXT_PUBLIC_API_URL=https://hostpro-api.railway.app`
- [ ] URL Frontend : `https://hostpro.vercel.app`

### 3.4 Nom de Domaine
- [ ] Acheter `hostpro.fr` (OVH ~10€/an)
- [ ] DNS : `hostpro.fr` → Vercel
- [ ] DNS : `api.hostpro.fr` → Railway
- [ ] Certificat SSL automatique (Let's Encrypt)

---

## 🔵 ÉTAPE 4 — Intégrations Plateformes
**Priorité : IMPORTANTE | Durée estimée : 5-7 jours**

### 4.1 Airbnb API
- [ ] Demander accès API Airbnb (programme partenaire)
- [ ] Synchronisation calendriers bidirectionnelle
- [ ] Sync tarifs et disponibilités
- [ ] Récupération des avis

### 4.2 Booking.com API
- [ ] Compte partenaire Booking.com
- [ ] Channel Manager API
- [ ] Sync réservations en temps réel

### 4.3 Stripe (Facturation SaaS)
- [ ] Créer compte Stripe
- [ ] 3 plans (Starter 49€, Pro 99€, Business 179€)
- [ ] Webhook Stripe → activation/désactivation compte
- [ ] Page billing dans les paramètres
- [ ] Période d'essai 14 jours automatique

---

## 🟢 ÉTAPE 5 — Application Mobile
**Priorité : FUTURE | Durée estimée : 2-3 semaines**

### 5.1 App React Native (Expo)
- [ ] Nouveau dossier `hostpro-mobile/`
- [ ] Réutiliser la même API backend
- [ ] Écrans : Dashboard, Réservations, Tâches, Messages
- [ ] Push notifications (Expo Notifications)
- [ ] Publication Play Store + App Store
- [ ] Coût : Compte développeur Google (25$ une fois) + Apple (99$/an)

---

## 📊 TABLEAU DE BORD D'AVANCEMENT

```
Backend API          ████████████████████  100% ✅
Base de données      ████████████████████  100% ✅
Landing Page         ████████████████████  100% ✅
Auth Frontend        ████████████████████  100% ✅
Dashboard Frontend   ████████████████████  100% ✅
Properties + Forms   ████████████████████  100% ✅
Reservations         ████████████████████  100% ✅
Tasks                ████████████████████  100% ✅
Calendar             ████████████████████  100% ✅
Messages             ████████████████████  100% ✅
Compliance           ████████████████████  100% ✅
Team Management      ████████████████████  100% ✅
Settings + Profil    ████████████████████  100% ✅
Upload Photos        ░░░░░░░░░░░░░░░░░░░░    0% ❌
Email Notifications  ░░░░░░░░░░░░░░░░░░░░    0% ❌
Production Deploy    ░░░░░░░░░░░░░░░░░░░░    0% ❌
Stripe Billing       ░░░░░░░░░░░░░░░░░░░░    0% ❌
Airbnb/Booking API   ░░░░░░░░░░░░░░░░░░░░    0% ❌
App Mobile           ░░░░░░░░░░░░░░░░░░░░    0% ❌

TOTAL                ████████████████░░░░   75%
```

---

## ⚡ PROCHAINE ACTION IMMÉDIATE

**Commencer par l'Étape 1.1 — Client API centralisé**

```bash
# Fichier à créer : hostpro-web/lib/api.ts
# C'est la fondation de tout le reste
```

Une fois ce fichier créé, toutes les pages se connectent au backend en cascade.

---

## 💰 BUDGET POUR ALLER EN PRODUCTION

| Service | Coût | Fréquence |
|---------|------|-----------|
| Railway (Backend + DB) | 5€ | /mois |
| Vercel (Frontend) | Gratuit | — |
| Domaine hostpro.fr | 10€ | /an |
| Resend (emails) | Gratuit | jusqu'à 3000/mois |
| Stripe | 1.5% + 0.25€ | par transaction |
| **TOTAL démarrage** | **~15€/mois** | — |

---

*Généré automatiquement — HOST PRO Platform Roadmap*
