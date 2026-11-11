# ScholarSync — Azure Cloud Deployment Guide (Future Phase)

> **IMPORTANT NOTICE:**  
> During the current development and verification phase, **Azure Cloud deployment is deliberately disabled**.  
> No paid or billable cloud resources should be provisioned until local testing and academic evaluations are complete.  
> This guide documents the exact architecture and steps to execute when ready to deploy in the future.

---

## 1. Cloud Architecture Overview

```text
               ┌────────────────────────────────────────────────────────┐
               │         Internet Users (HTTPS: port 443)              │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │    Azure App Service (Linux B1)       │
                      │  Node.js 20 LTS Modular Monolith      │
                      │  - Serves React static build (/)      │
                      │  - Exposes REST API (/api/*)          │
                      │  - System-Assigned Managed Identity   │
                      └───────────────┬───────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
              ▼ (Encrypted TLS, Port 1433)                    ▼ (Blob REST API)
┌───────────────────────────┐                   ┌───────────────────────────┐
│  Azure SQL Database       │                   │  Azure Blob Storage       │
│  - Basic tier (5 DTU)     │                   │  - Private container      │
│  - 3NF Normalized Schema  │                   │  - Anonymous disabled     │
│  - Analytical Views       │                   │  - Opaque UUID blob keys  │
└───────────────────────────┘                   └───────────────────────────┘
```

---

## 2. Infrastructure as Code (Bicep)

The template at `infra/bicep/main.bicep` provisions the entire stack in one command:

```bash
# 1. Login to Azure CLI
az login

# 2. Select subscription (e.g., Azure for Students)
az account set --subscription "<SUBSCRIPTION_ID_OR_NAME>"

# 3. Create Resource Group
az group create --name rg-scholarsync-prod --location eastus

# 4. Deploy Infrastructure (Replace <SECURE_PASSWORD>)
az deployment group create \
  --resource-group rg-scholarsync-prod \
  --template-file infra/bicep/main.bicep \
  --parameters sqlAdminPassword='<YOUR_SECURE_PASSWORD>'
```

---

## 3. Post-Deployment Database Initialization

Once the Azure SQL logical server is provisioned:
1. Open **Azure Portal** &rarr; Navigate to your SQL Database (`scholarsync-db`).
2. Open **Query editor (preview)** in the left sidebar.
3. Log in using `scholarsyncadmin` and the password set in Bicep.
4. Execute the following scripts in sequence:
   - `database/schema.sql` (Creates 9 entities and indexes)
   - `database/views.sql` (Creates operational and Power BI views)
   - `database/procedures.sql` (Creates atomic stored procedures)
   - `database/triggers.sql` (Creates timestamp & audit triggers)
   - (Optional) `database/seed-demo.sql` (Initial demo data)

---

## 4. App Service Configuration / Environment Settings

In your Azure App Service blade, navigate to **Configuration** &rarr; **Application settings** and verify:
- `NODE_ENV`: `production`
- `DEMO_MODE`: `false`
- `AZURE_SQL_SERVER`: `<your-server>.database.windows.net`
- `AZURE_SQL_DATABASE`: `scholarsync-db`
- `AZURE_SQL_USER`: `scholarsyncadmin`
- `AZURE_SQL_PASSWORD`: `<your-sql-password>`
- `AZURE_STORAGE_ACCOUNT_NAME`: `<your-storage-account-name>`
- `AZURE_STORAGE_CONTAINER_NAME`: `scholarship-documents`
- `AZURE_STORAGE_ACCESS_KEY`: `<your-storage-access-key>`
- `JWT_SECRET`: `<64-character-cryptographic-random-string>`
- `PORT`: `8080`

---

## 5. Deployment via GitHub Actions (Future On-Demand Trigger)

When ready to deploy:
1. In your GitHub repository settings, add secrets:
   - `AZURE_WEBAPP_NAME`: Name of your App Service.
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Downloaded from App Service blade &rarr; **Get publish profile**.
2. Go to GitHub **Actions** &rarr; **Deploy ScholarSync to Azure App Service** &rarr; Click **Run workflow**.
3. Verify live URL: `https://<your-app-name>.azurewebsites.net/api/health`.
