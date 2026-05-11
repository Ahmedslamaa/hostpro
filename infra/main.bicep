// ═══════════════════════════════════════════════════════════════════════════
// SLAMA RIVIERA / HOST PRO — Infrastructure Azure (App Service Stack)
// Architecture : App Service Linux + PostgreSQL Flexible + Key Vault
//                + Blob Storage + Application Insights
// Région par défaut : francecentral (données dans l'EEE / RGPD)
// ═══════════════════════════════════════════════════════════════════════════

@description('Environnement : dev | staging | prod')
@allowed(['dev', 'staging', 'prod'])
param env string = 'prod'

@description('Région Azure')
param location string = resourceGroup().location

@description('Préfixe de nommage')
param prefix string = 'hostpro'

@description('Login admin PostgreSQL')
param dbAdminUser string = 'hostproadmin'

@secure()
@description('Mot de passe admin PostgreSQL')
param dbAdminPassword string

@secure()
@description('JWT access token secret (min 64 chars)')
param jwtSecret string

@secure()
@description('JWT refresh token secret (min 64 chars)')
param jwtRefreshSecret string

@secure()
@description('Anthropic API key')
param anthropicApiKey string

@secure()
@description('Resend API key')
param resendApiKey string

@secure()
@description('Stripe secret key')
param stripeSecretKey string

@secure()
@description('Stripe webhook secret')
param stripeWebhookSecret string

@description('Stripe price ID — Starter plan')
param stripePriceStarter string = ''

@description('Stripe price ID — Pro plan')
param stripePricePro string = ''

@description('Stripe price ID — Enterprise plan')
param stripePriceEnterprise string = ''

@secure()
@description('VAPID private key')
param vapidPrivateKey string

@description('VAPID public key')
param vapidPublicKey string

@description('VAPID contact email')
param vapidEmail string = 'mailto:contact@hostpro.fr'

@description('URL publique de l\'application')
param appUrl string = 'https://app.hostpro.fr'

// ── Variables ─────────────────────────────────────────────────────────────────
var suffix = '${prefix}-${env}'
var tags = {
  project: 'hostpro'
  client: 'SLAMA Riviera'
  environment: env
  managedBy: 'bicep'
  rgpd: 'true'
}
var isProd = env == 'prod'
var dbName = 'hostpro'

// ═══════════════════════════════════════════════════════════════════════════
// 1. Log Analytics Workspace
// ═══════════════════════════════════════════════════════════════════════════
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${suffix}-logs'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 90
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Application Insights
// ═══════════════════════════════════════════════════════════════════════════
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${suffix}-ai'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    RetentionInDays: 90
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Azure Key Vault (secrets chiffrés, accès via Managed Identity)
// ═══════════════════════════════════════════════════════════════════════════
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: '${suffix}-kv'
  location: location
  tags: tags
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    enableRbacAuthorization: true
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Azure Database for PostgreSQL Flexible Server
// ═══════════════════════════════════════════════════════════════════════════
resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: '${suffix}-pg'
  location: location
  tags: tags
  sku: {
    name: isProd ? 'Standard_D2s_v3' : 'Standard_B1ms'
    tier: isProd ? 'GeneralPurpose' : 'Burstable'
  }
  properties: {
    administratorLogin: dbAdminUser
    administratorLoginPassword: dbAdminPassword
    version: '15'
    storage: { storageSizeGB: isProd ? 128 : 32, autoGrow: 'Enabled' }
    backup: {
      backupRetentionDays: isProd ? 30 : 7
      geoRedundantBackup: isProd ? 'Enabled' : 'Disabled'
    }
    highAvailability: { mode: isProd ? 'ZoneRedundant' : 'Disabled' }
    maintenanceWindow: {
      customWindow: 'Enabled'
      dayOfWeek: 0  // Dimanche
      startHour: 3
      startMinute: 0
    }
    authConfig: { activeDirectoryAuth: 'Disabled', passwordAuth: 'Enabled' }
    // publicNetworkAccess est géré par les règles de firewall
  }
}

resource postgresDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgres
  name: dbName
  properties: { charset: 'UTF8', collation: 'en_US.utf8' }
}

// Autoriser les services Azure (App Service → PostgreSQL)
resource pgFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgres
  name: 'AllowAzureServices'
  properties: { startIpAddress: '0.0.0.0', endIpAddress: '0.0.0.0' }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. Azure Storage Account (photos propriétés via API Next.js)
// ═══════════════════════════════════════════════════════════════════════════
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: replace('${prefix}st${env}', '-', '')
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: { name: 'Standard_LRS' }  // LRS suffit pour Azure for Students
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false  // Accès via SAS tokens uniquement
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storage
  name: 'default'
}

resource photoContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'property-photos'
  properties: { publicAccess: 'None' }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. App Service Plan (Linux, Node 20)
// ═══════════════════════════════════════════════════════════════════════════
resource appPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${suffix}-plan'
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: isProd ? 'B2' : 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true  // Linux
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. App Service — Next.js full-stack (frontend + API routes)
// ═══════════════════════════════════════════════════════════════════════════
var dbConnectionString = 'postgresql://${dbAdminUser}:${dbAdminPassword}@${postgres.properties.fullyQualifiedDomainName}:5432/${dbName}?sslmode=require'

resource appService 'Microsoft.Web/sites@2022-09-01' = {
  name: '${suffix}-app'
  location: location
  tags: tags
  identity: { type: 'SystemAssigned' }  // Managed Identity → Key Vault
  properties: {
    serverFarmId: appPlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: true
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      healthCheckPath: '/api/health'
      nodeVersion: '20-lts'
      appSettings: [
        { name: 'NODE_ENV',                                value: 'production' }
        { name: 'NEXT_PUBLIC_APP_URL',                     value: appUrl }
        { name: 'PORT',                                    value: '3000' }
        { name: 'HOSTNAME',                                value: '0.0.0.0' }
        { name: 'DATABASE_URL',                            value: dbConnectionString }
        { name: 'JWT_SECRET',                              value: jwtSecret }
        { name: 'JWT_REFRESH_SECRET',                      value: jwtRefreshSecret }
        { name: 'ANTHROPIC_API_KEY',                       value: anthropicApiKey }
        { name: 'RESEND_API_KEY',                          value: resendApiKey }
        { name: 'EMAIL_FROM',                              value: 'HostPro <noreply@hostpro.fr>' }
        { name: 'STRIPE_SECRET_KEY',                       value: stripeSecretKey }
        { name: 'STRIPE_WEBHOOK_SECRET',                   value: stripeWebhookSecret }
        { name: 'STRIPE_PRICE_STARTER',                    value: stripePriceStarter }
        { name: 'STRIPE_PRICE_PRO',                        value: stripePricePro }
        { name: 'STRIPE_PRICE_ENTERPRISE',                 value: stripePriceEnterprise }
        { name: 'VAPID_PUBLIC_KEY',                        value: vapidPublicKey }
        { name: 'VAPID_PRIVATE_KEY',                       value: vapidPrivateKey }
        { name: 'VAPID_EMAIL',                             value: vapidEmail }
        { name: 'AZURE_STORAGE_CONNECTION_STRING',         value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value};EndpointSuffix=core.windows.net' }
        { name: 'AZURE_STORAGE_CONTAINER',                 value: 'property-photos' }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING',   value: appInsights.properties.ConnectionString }
        { name: 'SCM_DO_BUILD_DURING_DEPLOYMENT',          value: 'false' }
        { name: 'WEBSITE_RUN_FROM_PACKAGE',                value: '1' }
        { name: 'NEXT_TELEMETRY_DISABLED',                 value: '1' }
      ]
    }
  }
}

// Donner à App Service l'accès Key Vault en lecture (Managed Identity)
resource kvSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, appService.id, 'Key Vault Secrets User')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Outputs
// ═══════════════════════════════════════════════════════════════════════════
output appUrl             string = 'https://${appService.properties.defaultHostName}'
output appServiceName     string = appService.name
output postgresHost       string = postgres.properties.fullyQualifiedDomainName
output keyVaultUri        string = keyVault.properties.vaultUri
output storageAccountName string = storage.name
output appInsightsKey     string = appInsights.properties.InstrumentationKey
output managedIdentityId  string = appService.identity.principalId
