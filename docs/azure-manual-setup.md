# ScholarSync — Azure Manual Setup Checklist & Portal Guide

This document guides step-by-step manual setup in the **Azure Portal** (ideal for Azure for Students).

## Step 1: Resource Group & Budget
1. Go to **Azure Portal** ([portal.azure.com](https://portal.azure.com)).
2. In the search bar, type **Resource groups** and click **Create**.
3. Select your **Azure for Students** subscription.
4. Name: `rg-scholarsync-prod`. Region: `East US` (or your nearest region).
5. Click **Review + Create**.
6. Set a **Budget Alert** under **Cost Management + Billing** (e.g., alert at \$20, \$50, \$80).

## Step 2: Azure SQL Database
1. Search for **SQL databases** and click **Create**.
2. Select resource group `rg-scholarsync-prod`.
3. Database name: `scholarsync-db`.
4. Server: Click **Create new**.
   - Server name: `sql-scholarsync-<yourname>`
   - Location: `East US`
   - Authentication: Use **SQL authentication** (or Microsoft Entra only). Set admin username `scholarsyncadmin` and a strong password.
5. Compute + Storage: Click **Configure database** and choose **Basic** (5 DTUs, 2 GB storage, approx \$5/month, well within student credits).
6. Networking: Set **Allow Azure services and resources to access this server** to **Yes**. Add your client IP for local testing.
7. Click **Review + create**.
8. After deployment, open **Query editor** in the database blade and execute the contents of `database/schema.sql`, `database/views.sql`, `database/procedures.sql`, and `database/triggers.sql`.

## Step 3: Azure Blob Storage
1. Search for **Storage accounts** and click **Create**.
2. Name: `stscholarsync<unique>` (lowercase alphanumeric, 3-24 chars).
3. Performance: **Standard**. Redundancy: **Locally-redundant storage (LRS)**.
4. Advanced tab: Ensure **Allow public access on containers** is unchecked (**Disabled**).
5. Click **Review + create**.
6. Once created, go to **Containers** under **Data storage** and click **+ Container**.
   - Name: `scholarship-documents`
   - Public access level: **Private (no anonymous access)**.

## Step 4: Azure App Service
1. Search for **App Services** and click **Create** > **Web App**.
2. Name: `scholarsync-app-<unique>`.
3. Publish: **Code**.
4. Runtime stack: **Node 20 LTS**.
5. Operating System: **Linux**.
6. Pricing plan: **Basic B1** (or Free F1 for initial test).
7. Click **Review + create**.

## Step 5: Environment Variables / Configuration
In your App Service blade, navigate to **Settings** > **Environment variables**:
- `NODE_ENV` = `production`
- `PORT` = `8080`
- `AZURE_SQL_SERVER` = `<your-sql-server>.database.windows.net`
- `AZURE_SQL_DATABASE` = `scholarsync-db`
- `AZURE_SQL_USER` = `scholarsyncadmin`
- `AZURE_SQL_PASSWORD` = `<your-password>`
- `AZURE_STORAGE_ACCOUNT_NAME` = `<your-storage-account-name>`
- `AZURE_STORAGE_CONTAINER_NAME` = `scholarship-documents`
- `AZURE_STORAGE_ACCESS_KEY` = `<storage-account-key>` (from Storage Account > Access Keys)
- `JWT_SECRET` = `<generate-a-strong-random-64-char-string>`
- `DEMO_MODE` = `false`

Click **Apply** and restart the Web App.
Navigate to your URL: `https://<your-app-name>.azurewebsites.net`.
