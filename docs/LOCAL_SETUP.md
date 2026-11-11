# ScholarSync — Local Setup & Development Guide

Follow this guide to run, test, and develop ScholarSync on your local development machine.

---

## 1. Prerequisites

- **Node.js**: Version 18.x, 20.x LTS, or newer (`node -v`).
- **npm**: Version 9.x or newer (`npm -v` / `npm.cmd -v` on Windows).
- **Git**: Installed and configured (`git --version`).
- **OS**: Windows, macOS, or Linux.

---

## 2. Quick Setup (3 Steps)

### Step 1: Install Dependencies
From the repository root directory (`C:\Desktop\collage project`):
```bash
# On Windows PowerShell:
npm.cmd run install:all

# On macOS/Linux:
npm run install:all
```
*This installs dependencies for the root, Express backend (`server/`), and React client (`client/`).*

### Step 2: Seed Sample Data
```bash
# On Windows PowerShell:
npm.cmd run seed

# On macOS/Linux:
npm run seed
```
*This resets and seeds realistic fictional scholarships, student profiles, criteria, and test applications.*

### Step 3: Run Automated Tests
```bash
# On Windows PowerShell:
npm.cmd test

# On macOS/Linux:
npm test
```
*Verifies all 21 unit, API, database, file, and workflow state machine tests pass.*

---

## 3. Starting the Application

### Option A: Production Mode (Recommended — Runs Full Stack on Port 5000)
1. Build the React frontend:
   ```bash
   npm.cmd run build
   ```
2. Start the Express server:
   ```bash
   npm.cmd start
   ```
3. Open **`http://localhost:5000`** in your browser.
   *(Express serves the built React frontend and all `/api/*` routes from the same origin)*.

### Option B: Concurrent Development Mode (Hot Reloading)
- **Terminal 1** (Backend API with auto-reload):
  ```bash
  npm.cmd run dev:server
  ```
- **Terminal 2** (Vite Frontend with Fast Refresh):
  ```bash
  npm.cmd run dev:client
  ```
- Open **`http://localhost:3000`** (Vite proxies all `/api/*` calls to port 5000 automatically).

---

## 4. Demo Login Accounts

All demo accounts share the password: **`Password123!`**  
*(You can also use the one-click quick switch buttons on the top Demo Banner)*

| Role | Email Address | Password | Capabilities |
|---|---|---|---|
| **Student** | `student@scholarsync.edu` | `Password123!` | Check eligibility, upload documents, submit applications, respond to verifiers |
| **Faculty Verifier** | `verifier@scholarsync.edu` | `Password123!` | Review assigned cases, verify marksheets, request clarification, recommend outcomes |
| **Scholarship Admin** | `admin@scholarsync.edu` | `Password123!` | Create opportunities with rule builder, assign verifiers, commit final approval/rejection |
| **System Admin** | `sysadmin@scholarsync.edu` | `Password123!` | Manage user roles, toggle account active status, inspect security audit trail |

---

## 5. Environment Variables (`.env`)

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key variables:
- `DEMO_MODE=true`: Enables local JSON database and local uploads without requiring Azure credentials.
- `PORT=5000`: Port for the Express server.
- `JWT_SECRET`: Secret key for signing session tokens.
- `AZURE_SQL_SERVER`: (Optional) Hostname for live SQL Server / Azure SQL.
- `AZURE_STORAGE_ACCOUNT_NAME`: (Optional) Storage account for live Azure Blob Storage.
