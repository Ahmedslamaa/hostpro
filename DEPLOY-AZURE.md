# 🚀 HOST PRO — Guide de déploiement Azure

## Prérequis accomplis ✅
- Azure CLI installé
- Compte Microsoft connecté : ahmedslamaa@outlook.fr
- Tous les fichiers de déploiement créés

## Étape 1 — Activer l'abonnement Azure (TOI — 3 min)

1. Va sur https://azure.microsoft.com/fr-fr/free
2. Clique "Démarrer gratuitement"
3. Connecte-toi avec ahmedslamaa@outlook.fr
4. Entre une carte bancaire (aucun prélèvement auto)
5. Tu reçois 200$ de crédit gratuit

## Étape 2 — Lancer le déploiement complet (MOI — automatique)

Une fois l'abonnement activé, ouvre PowerShell et tape :

```powershell
cd C:\Users\ahmed\hostpro
.\deploy-azure.ps1
```

Le script fait TOUT automatiquement :
- Crée le Resource Group
- Crée PostgreSQL
- Crée le Blob Storage (photos)
- Build et déploie le backend Docker
- Déploie le frontend Next.js
- Configure toutes les variables d'environnement

## Résultat final

```
Backend  → https://hostpro-api.azurewebsites.net
Frontend → https://hostpro-web.azurestaticapps.net
Docs API → https://hostpro-api.azurewebsites.net/docs
```

## Coût estimé
- App Service B1 : ~13€/mois
- PostgreSQL B1ms : ~14€/mois  
- Static Web Apps : GRATUIT
- Blob Storage : ~1€/mois
- **TOTAL : ~28€/mois**
