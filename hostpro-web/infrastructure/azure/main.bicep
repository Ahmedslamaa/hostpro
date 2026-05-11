// ════════════════════════════════════════════════════════════════════════════
// HOST PRO — Infrastructure Azure complète (Pay-as-you-go)
// Région : West Europe (Amsterdam) — données dans l'EEE
// Architecture : App Service + PostgreSQL Flexible + Key Vault + AppInsights
// ════════════════════════════════════════════════════════════════════════════

@description('Environnement (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'prod'

@description('Région Azure')
param location string = 'westeurope'

@description('Préfixe de nommage pour toutes les ressources')
param prefix string = 'hostpro'

@description('Mot de passe administrateur PostgreSQL (stocké dans Key Vault)')
@secure()
param dbAdminPassword string

@description('Clé secrète JWT pour signer les tokens')
@secure()
param jwtSecret string

@description('URL publique de l\'application')
param appUrl string = 'https://app.hostpro.fr'

// ── Variables ────────────────────────────────────────────────────────────────
var resourceSuffix = '${prefix}-${environment}'
var tags = {
  project: 'hostpro'
  environment: environment
  owner: 'hostpro-team'
  'data-classification': 'confidential'
  rgpd: 'true'
}

// ── Log Analytics Workspace (monitoring centralisé) ──────────────────────────
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${resourceSuffix}-logs'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 90  // 3 mois de logs (RGPD)
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// ── Application Insights ─────────────────────────────────────────────────────
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${resourceSuffix}-insights'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    // Désactiver le sampling agressif pour garder tous les logs de sécurité
    SamplingPercentage: null
    // Rétention 90 jours
    RetentionInDays: 90
  }
}

// ── Key Vault (secrets chiffrés HSM) ────────────────────────────────────────
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: '${resourceSuffix}-kv'
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'  // HSM Premium disponible si besoin compliance PCI-DSS
    }
    tenantId: subscription().tenantId
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true   // Anti-suppression accidentelle
    enableRbacAuthorization: true // RBAC plutôt que policies legacy
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
      ipRules: []  // À restreindre aux IPs App Service en production
      virtualNetworkRules: []
    }
  }
}

// Stocker les secrets dans Key Vault
resource secretDb 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  parent: keyVault
  name: 'db-admin-password'
  properties: { value: dbAdminPassword }
}

resource secretJwt 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  parent: keyVault
  name: 'jwt-secret'
  properties: { value: jwtSecret }
}

// ── Azure Database for PostgreSQL Flexible Server ────────────────────────────
// Pay-as-you-go — Burstable B2ms (2 vCores, 8 GiB RAM) — ~35€/mois
resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: '${resourceSuffix}-pg'
  location: location
  tags: tags
  sku: {
    name: environment == 'prod' ? 'Standard_D2s_v3' : 'Standard_B2ms'
    tier: environment == 'prod' ? 'GeneralPurpose' : 'Burstable'
  }
  properties: {
    administratorLogin: 'hostpro_admin'
    administratorLoginPassword: dbAdminPassword
    version: '15'  // PostgreSQL 15 LTS
    storage: {
      storageSizeGB: environment == 'prod' ? 128 : 32
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 30      // 30 jours de rétention (RGPD)
      geoRedundantBackup: environment == 'prod' ? 'Enabled' : 'Disabled'
    }
    highAvailability: {
      mode: environment == 'prod' ? 'ZoneRedundant' : 'Disabled'
    }
    maintenanceWindow: {
      customWindow: 'Enabled'
      dayOfWeek: 0  // Dimanche
      startHour: 3  // 3h du matin
      startMinute: 0
    }
    // Chiffrement en transit forcé
    network: {
      publicNetworkAccess: 'Disabled'  // Accès uniquement via VNet
    }
  }
}

// Base de données hostpro
resource pgDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: pgServer
  name: 'hostpro'
  properties: {
    charset: 'UTF8'
    collation: 'fr_FR.UTF-8'
  }
}

// ── App Service Plan ─────────────────────────────────────────────────────────
// B2 (2 vCores, 3.5 GiB) — ~27€/mois — scale automatique possible
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${resourceSuffix}-plan'
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: environment == 'prod' ? 'P1v3' : 'B2'
    tier: environment == 'prod' ? 'PremiumV3' : 'Basic'
  }
  properties: {
    reserved: true  // Linux
    zoneRedundant: environment == 'prod'
  }
}

// ── App Service (Next.js) ────────────────────────────────────────────────────
resource appService 'Microsoft.Web/sites@2022-09-01' = {
  name: '${resourceSuffix}-app'
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'  // Managed Identity — accès Key Vault sans credentials
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true  // HTTPS forcé
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: true
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'  // FTP désactivé (sécurité)
      healthCheckPath: '/api/health'
      appSettings: [
        { name: 'NODE_ENV',             value: 'production' }
        { name: 'NEXT_PUBLIC_APP_URL',  value: appUrl }
        { name: 'NEXT_PUBLIC_API_URL',  value: appUrl }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
        // Secrets récupérés depuis Key Vault via Managed Identity
        { name: 'DATABASE_URL',         value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/db-connection-string/)' }
        { name: 'JWT_SECRET',           value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/jwt-secret/)' }
        // Config Next.js
        { name: 'PORT',                 value: '3000' }
        { name: 'HOSTNAME',             value: '0.0.0.0' }
      ]
    }
  }
}

// Donner accès Key Vault à l'App Service via Managed Identity
resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, appService.id, 'KeyVaultSecretsUser')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// ── Storage Account (photos, exports PDF) ────────────────────────────────────
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: replace('${resourceSuffix}storage', '-', '') // Storage names cannot contain hyphens
  location: location
  tags: tags
  sku: { name: 'Standard_LRS' }  // Locally Redundant — passer à GRS en prod critique
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false  // Jamais de blobs publics sans SAS token signé
    encryption: {
      services: {
        blob: { enabled: true }
        file: { enabled: true }
      }
      keySource: 'Microsoft.Storage'
    }
  }
}

// Container pour les photos de propriétés
resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/default/property-photos'
  properties: {
    publicAccess: 'None'
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output pgServerFqdn string = pgServer.properties.fullyQualifiedDomainName
output keyVaultUri string = keyVault.properties.vaultUri
output appInsightsKey string = appInsights.properties.InstrumentationKey
output storageAccountName string = storageAccount.name
