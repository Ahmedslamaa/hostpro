# 🗺️ HOST PRO — ROADMAP vers 100% fonctionnel

> Dernière mise à jour : Mai 2026  
> Avancement global : **~75%**

---

## 📁 STRUCTURE DU PROJET

```
C:\Users\ahmed\hostpro\
│
├── hostpro.code-workspace     ← Ouvrir ce fichier dans VS Code
├── start.ps1                  ← Démarrer tout en un clic (dev local)
├── deploy-azure.ps1           ← Déploiement Azure en un clic (production)
├── ROADMAP.md                 ← Ce fichier
├── SETUP.md                   ← Guide d'installation
│
├── infra/                     ← Infrastructure Azure as Code
│   ├── main.bicep             ← Toutes les ressources Azure (Bicep)
│   ├── parameters.prod.json   ← Paramètres production
│   ├── parameters.dev.json    ← Paramètres développement
│   └── deploy.sh              ← Script de déploiement Bash
│
├── .github/
│   └── workflows/
│       └── deploy-azure.yml   ← Pipeline CI/CD GitHub Actions → Azure
│
├── hostpro-api/               ← BACKEND Python/FastAPI
│   ├── Dockerfile             ← Image Docker multi-stage (production)
│   ├── startup.sh             ← Migrations + démarrage uvicorn
│   ├── docker-compose.yml     ← Stack locale (PostgreSQL + Redis + API + Web)
│   ├── .env.azure.example     ← Variables d'environnement Azure
│   └── app/
│       ├── api/v1/            ← Endpoints HTTP
│       │   ├── auth.py        ✅ Login, Register, /me, Refresh
│       │   ├── properties.py  ✅ CRUD Biens + Owners + Photos
│       │   ├── reservations.py✅ CRUD Réservations + Guests
│       │   ├── tasks.py       ✅ CRUD Tâches
│       │   ├── calendar.py    ✅ Calendrier + iCal sync bidirectionnel
│       │   ├── messages.py    ✅ Messagerie + Templates
│       │   ├── compliance.py  ✅ Conformité loi Le Meur
│       │   ├── dashboard.py   ✅ Stats & KPIs
│       │   ├── uploads.py     ✅ Upload photos → Azure Blob Storage
│       │   └── team.py        ✅ Gestion équipe + rôles
│       ├── models/            ✅ Tables SQLAlchemy (10 modèles)
│       ├── schemas/           ✅ Validation Pydantic
│       ├── services/
│       │   └── ical_sync.py   ✅ Sync iCal automatique (15 min)
│       └── core/              ✅ Auth JWT, RBAC, Config Azure
│
└── hostpro-web/               ← FRONTEND Next.js 14
    ├── Dockerfile             ← Image Docker standalone (production)
    └── app/
        ├── page.tsx           ✅ Landing page complète
        ├── (auth)/
        │   ├── login/         ✅ Page connexion
        │   ├── register/      ✅ Page inscription
        │   └── onboarding/    ✅ Wizard post-inscription (4 étapes)
        └── (dashboard)/
            ├── channel-manager/ ✅ Channel Manager natif
            ├── properties/      ✅ Biens + photos
            ├── reservations/    ✅ Réservations
            ├── calendar/        ✅ Calendrier unifié
            ├── integrations/    ✅ iCal sync plateformes
            ├── pricing/         ✅ Tarification IA
            ├── messages/        ✅ Messages
            ├── compliance/      ✅ Conformité
            ├── analytics/       ✅ Analytics
            ├── team/            ✅ Équipe
            └── settings/        ✅ Paramètres
```

---

## ✅ CE QUI FONCTIONNE DÉJÀ (75%)

| Module | Statut | Détail |
|--------|--------|--------|
| Base de données | ✅ 100% | SQLite local → PostgreSQL Azure prod |
| API Auth | ✅ 100% | Register, Login, JWT, Refresh, /me |
| API Properties | ✅ 100% | CRUD + Owners + Photos Azure Blob |
| API Reservations | ✅ 100% | CRUD + Guests + CalendarEvent auto |
| API Tasks | ✅ 100% | CRUD + Complete + Delete |
| API Calendar + iCal | ✅ 100% | Sync bidirectionnel Airbnb/Booking/Abritel |
| API Messages | ✅ 100% | Conversations + Templates |
| API Compliance | ✅ 100% | Nuitées + Déclarations loi Le Meur |
| API Dashboard | ✅ 100% | KPIs + Stats + Alertes |
| API Team | ✅ 100% | Membres + Rôles RBAC |
| Upload Photos | ✅ 100% | Azure Blob Storage |
| Landing Page | ✅ 100% | Design complet responsive |
| UI Login/Register | ✅ 100% | Formulaires complets |
| UI Onboarding | ✅ 100% | Wizard 4 étapes post-inscription |
| UI Dashboard | ✅ 100% | Layout + toutes les pages |
| Channel Manager | ✅ 100% | Matrice dispo + tarifs + CSV import |
| Intégrations iCal | ✅ 100% | Connecter Airbnb, Booking, Abritel |
| Infrastructure Azure | ✅ 100% | Bicep + Container Apps + CI/CD |
| RBAC Permissions | ✅ 100% | 5 rôles configurés |

---

## 🔴 ÉTAPE 1 — Stripe Billing
**Priorité : HAUTE | Durée estimée : 2-3 jours**

### 1.1 Plans d'abonnement
- [ ] 3 plans (Starter 49€, Pro 99€, Business 179€)
- [ ] Intégration Stripe Checkout
- [ ] Webhook Stripe → activation/désactivation compte
- [ ] Page billing dans les paramètres

### 1.2 Période d'essai
- [ ] 14 jours automatiques après inscription
- [ ] Email de rappel J-3 avant expiration
- [ ] Downgrade automatique si pas d'abonnement

---

## 🟠 ÉTAPE 2 — Notifications Email
**Priorité : HAUTE | Durée estimée : 1-2 jours**

### 2.1 Emails transactionnels (Resend)
- [ ] Email confirmation inscription
- [ ] Email nouvelle réservation
- [ ] Email invitation membre équipe
- [ ] Alerte conformité (nuitées loi Le Meur)
- [ ] Rapport hebdomadaire KPIs

---

## 🟡 ÉTAPE 3 — Intégrations Plateformes (APIs natives)
**Priorité : MOYENNE | Durée estimée : 5-7 jours**

> ⚠️ Les iCal feeds sont déjà en production. Les APIs natives apportent des données supplémentaires (avis, messages, tarifs dynamiques).

### 3.1 Airbnb API
- [ ] Demander accès API Airbnb (programme partenaire)
- [ ] Sync tarifs et disponibilités en temps réel
- [ ] Récupération des avis voyageurs

### 3.2 Booking.com API
- [ ] Compte partenaire Booking.com
- [ ] Channel Manager API (tarifs + disponibilités)
- [ ] Sync réservations en temps réel

---

## 🔵 ÉTAPE 4 — Application Mobile
**Priorité : FUTURE | Durée estimée : 2-3 semaines**

### 4.1 App React Native (Expo)
- [ ] Nouveau dossier `hostpro-mobile/`
- [ ] Réutiliser la même API backend Azure
- [ ] Écrans : Dashboard, Réservations, Tâches, Messages
- [ ] Push notifications (Expo Notifications)
- [ ] Publication Play Store + App Store

---

## 📊 TABLEAU DE BORD D'AVANCEMENT

```
Backend API          ████████████████████  100% ✅
Base de données      ████████████████████  100% ✅
Infrastructure Azure ████████████████████  100% ✅
CI/CD GitHub Actions ████████████████████  100% ✅
Landing Page         ████████████████████  100% ✅
Auth Frontend        ████████████████████  100% ✅
Onboarding           ████████████████████  100% ✅
Dashboard Frontend   ████████████████████  100% ✅
Channel Manager      ████████████████████  100% ✅
iCal / Intégrations  ████████████████████  100% ✅
Upload Photos Azure  ████████████████████  100% ✅
Stripe Billing       ░░░░░░░░░░░░░░░░░░░░    0% ❌
Email Notifications  ░░░░░░░░░░░░░░░░░░░░    0% ❌
Airbnb/Booking API   ░░░░░░░░░░░░░░░░░░░░    0% ❌
App Mobile           ░░░░░░░░░░░░░░░░░░░░    0% ❌

TOTAL                ████████████████░░░░   75%
```

---

## ⚡ PROCHAINE ACTION IMMÉDIATE

**Déployer en production sur Azure**

```powershell
# 1. Activer un abonnement Azure sur https://azure.microsoft.com/fr-fr/free
# 2. Lancer le script de déploiement
.\deploy-azure.ps1
```

Résultat attendu :
```
API  → https://hostpro-prod-api.azurecontainerapps.io
Web  → https://hostpro-prod-web.azurecontainerapps.io
Docs → https://hostpro-prod-api.azurecontainerapps.io/docs
```

---

## 💰 BUDGET AZURE (production)

| Service Azure | SKU | Coût estimé |
|---------------|-----|-------------|
| Container Apps (API) | 1 replica, 1 vCPU | ~15€/mois |
| Container Apps (Web) | 1 replica, 0.5 vCPU | ~8€/mois |
| Azure Database for PostgreSQL | B1ms Burstable | ~14€/mois |
| Azure Cache for Redis | C0 Basic | ~14€/mois |
| Azure Blob Storage | Standard LRS | ~1€/mois |
| Azure Container Registry | Basic | ~5€/mois |
| Application Insights | Pay-per-use | ~2€/mois |
| **TOTAL estimé** | | **~59€/mois** |

> 💡 Avec le crédit gratuit Azure (200$), les 3 premiers mois sont couverts.  
> En dev/staging, les Container Apps scalent à 0 → coût ≈ 0€ hors heures d'utilisation.

---

*Généré automatiquement — HOST PRO Platform Roadmap*
