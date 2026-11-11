# ScholarSync — Azure Bicep Infrastructure Deployment

This directory contains Infrastructure as Code (Bicep) for deploying ScholarSync to Microsoft Azure.

## Resources Provisioned
1. **Azure App Service (Linux B1)**: Hosts Express API and React static build with Node.js 20 LTS runtime.
2. **Azure SQL Database (Basic 5 DTU)**: Cost-effective tier for academic evaluation and demonstrations.
3. **Azure Blob Storage (Standard_LRS)**: Private storage container `scholarship-documents` with public anonymous access completely disabled.
4. **System-Assigned Managed Identity**: Enables the App Service to securely authenticate with Azure SQL and Blob Storage without storing plain-text keys.

## Deployment Instructions
1. Install Azure CLI: `az --version`
2. Login to your account:
   ```bash
   az login
   ```
3. Set your active Azure subscription (e.g., Azure for Students):
   ```bash
   az account set --subscription "<YOUR_SUBSCRIPTION_NAME_OR_ID>"
   ```
4. Create a resource group:
   ```bash
   az group create --name rg-scholarsync-prod --location eastus
   ```
5. Deploy the template:
   ```bash
   az deployment group create \
     --resource-group rg-scholarsync-prod \
     --template-file infra/bicep/main.bicep \
     --parameters sqlAdminPassword='<YOUR_SECURE_PASSWORD>'
   ```
6. Obtain deployment outputs (WebApp URL, SQL Server FQDN, Storage Account Name).
7. Apply SQL schema using Azure Portal Query Editor with `database/schema.sql` and `database/views.sql`.
