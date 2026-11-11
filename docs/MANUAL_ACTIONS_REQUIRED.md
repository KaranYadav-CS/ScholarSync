# ScholarSync — Manual Actions Required Checklist

This document details the exact manual steps required for GitHub repository management, local demonstrations, Power BI reporting, and future Azure deployment.

---

## 1. Local Demonstration & Presentation Checklist

- [x] **Install Dependencies**: Execute `npm.cmd run install:all` to ensure all packages are ready.
- [x] **Seed Database**: Execute `npm.cmd run seed` to load demo scholarships and accounts.
- [x] **Verify Test Suite**: Run `npm.cmd test` to confirm 21/21 tests pass.
- [x] **Start Application**: Run `npm.cmd run build` followed by `npm.cmd start`. Open `http://localhost:5000`.
- [ ] **Demonstrate User Journeys**:
  - Sign in as Student (`student@scholarsync.edu`) &rarr; Check Explainable Eligibility Center &rarr; Submit draft &rarr; Upload certificate.
  - Sign in as Faculty Verifier (`verifier@scholarsync.edu`) &rarr; Review assigned case &rarr; Request clarification or submit recommendation.
  - Sign in as Scholarship Admin (`admin@scholarsync.edu`) &rarr; Assign verifier &rarr; Review recommendation &rarr; Commit final Approval/Rejection with mandatory reason.
  - Sign in as System Admin (`sysadmin@scholarsync.edu`) &rarr; Manage user roles & inspect Security Audit Trail.

---

## 2. Power BI Desktop Presentation Checklist

- [ ] Install **Microsoft Power BI Desktop** (free download from Microsoft Store or official website).
- [ ] Connect Power BI to Azure SQL Database or local SQL Server using credentials from `.env`.
- [ ] Import views: `vw_PowerBI_ApplicationMetrics`, `vw_PowerBI_DepartmentMetrics`, `vw_PowerBI_ScholarshipMetrics`.
- [ ] Paste DAX measures defined in `docs/POWER_BI_SETUP.md`.
- [ ] Display KPI cards and charts in local Power BI Desktop during presentation/viva.
- [!] **Caution**: Do **not** click "Publish to web" (prohibited for confidential student information).

---

## 3. Future Azure Cloud Deployment Checklist (When Ready)

*Do NOT execute these steps during the local development phase.*

1. **Azure for Students Subscription Check**:
   - Sign in to [portal.azure.com](https://portal.azure.com).
   - Verify remaining credit balance under **Cost Management + Billing**.
   - Set a Budget Alert at \$25 and \$50 to monitor consumption.
2. **Resource Group Creation**:
   - Create resource group `rg-scholarsync-prod` in your preferred region (e.g. `East US`).
3. **Deploy Bicep Infrastructure**:
   - Run `az deployment group create --resource-group rg-scholarsync-prod --template-file infra/bicep/main.bicep --parameters sqlAdminPassword='<YOUR_PASSWORD>'`.
4. **Execute SQL Schema**:
   - In Azure Portal Query Editor, run `database/schema.sql`, `database/views.sql`, `database/procedures.sql`, and `database/triggers.sql`.
5. **Configure GitHub Actions Secrets**:
   - In GitHub repository &rarr; **Settings** &rarr; **Secrets and variables** &rarr; **Actions**:
     - Variable: `AZURE_WEBAPP_NAME`
     - Secret: `AZURE_WEBAPP_PUBLISH_PROFILE` (downloaded from App Service)
6. **Trigger Deployment**:
   - Go to GitHub **Actions** &rarr; Select **Deploy ScholarSync to Azure App Service** &rarr; Click **Run workflow**.
7. **Smoke Test Production URL**:
   - Navigate to `https://<your-app-name>.azurewebsites.net/api/health` to confirm `status: healthy` and `mode: AZURE_PRODUCTION`.
