// ScholarSync Azure Infrastructure Bicep Template
// Provisions: Azure App Service (Linux, Node.js), Azure SQL Database, and Azure Blob Storage

@description('Environment name prefix (e.g. dev, prod)')
param environmentName string = 'prod'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('App Service SKU tier')
param appServiceSku string = 'B1' // Basic 1 tier suitable for development/demo

@description('Azure SQL administrator username')
param sqlAdminLogin string = 'scholarsyncadmin'

@description('Azure SQL administrator secure password')
@secure()
param sqlAdminPassword string

var appName = 'scholarsync-${environmentName}-${uniqueString(resourceGroup().id)}'
var storageAccountName = 'stscholarsync${uniqueString(resourceGroup().id)}'
var sqlServerName = 'sql-scholarsync-${uniqueString(resourceGroup().id)}'
var sqlDatabaseName = 'scholarsync-db'

// 1. Storage Account for Document Storage (Private Container)
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    accessTier: 'Hot'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource documentsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'scholarship-documents'
  properties: {
    publicAccess: 'None'
  }
}

// 2. Azure SQL Server & Database
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 5
  }
}

// Firewall rule: Allow Azure Services (can be scoped down in production)
resource sqlFirewallAzureServices 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAllWindowsAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// 3. App Service Plan & Web App
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: appServiceSku
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: appName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appCommandLine: 'npm run start'
      alwaysOn: true
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'PORT'
          value: '8080'
        }
        {
          name: 'AZURE_STORAGE_ACCOUNT_NAME'
          value: storageAccount.name
        }
        {
          name: 'AZURE_STORAGE_CONTAINER_NAME'
          value: 'scholarship-documents'
        }
        {
          name: 'AZURE_SQL_SERVER'
          value: '${sqlServer.name}.database.windows.net'
        }
        {
          name: 'AZURE_SQL_DATABASE'
          value: sqlDatabaseName
        }
        {
          name: 'DEMO_MODE'
          value: 'false'
        }
      ]
    }
  }
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output sqlServerFqdn string = '${sqlServer.name}.database.windows.net'
output storageAccountNameOutput string = storageAccount.name
output appServicePrincipalId string = webApp.identity.principalId
