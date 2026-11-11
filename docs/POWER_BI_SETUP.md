# ScholarSync — Power BI Analytics & Reporting Guide

**Scope:** Business Intelligence & Analytical Reporting for Institutional Decision Makers  
**Tool:** Microsoft Power BI Desktop (Free Report Authoring Tool)  
**Database Source:** Microsoft Azure SQL Database / SQL Server Compatible Views  
**PII Protection:** All Power BI views are strictly anonymized and contain zero personal identifiers.  

---

## 1. Architecture & Licensing Clarification

- **Power BI Desktop**: A free Windows application for creating, modeling, and viewing analytical reports locally.
- **Licensing Boundary**: An **Azure for Students** credit is an Azure consumption grant. It does **NOT** include Power BI Pro, Premium Per User (PPU), or paid Power BI Embedded capacity.
- **Security Rule**: Never use Power BI **"Publish to Web"** for student scholarship reports. Publish to Web is completely unauthenticated and public. In-product administrative analytics are served securely through authenticated React charts (`/admin/analytics`).

---

## 2. Power BI Analytical Views (Created in `database/views.sql`)

1. **`dbo.vw_PowerBI_ApplicationMetrics`** (Fact Table):
   - Granularity: One row per scholarship application.
   - Fields: `application_id`, `scholarship_id`, `scholarship_title`, `scholarship_category`, `award_amount`, `department`, `study_year`, `application_status`, `submission_date`, `decision_date`, `is_approved`, `is_rejected`, `is_submitted`, `is_pending`.
2. **`dbo.vw_PowerBI_DepartmentMetrics`** (Dimension Table):
   - Department-level summary of total applications, approval counts, and average CGPA.
3. **`dbo.vw_PowerBI_ScholarshipMetrics`** (Dimension Table):
   - Program-level allocation totals and disbursed grant sums.
4. **`dbo.vw_PowerBI_VerificationPerformance`** (Faculty Performance Dimension):
   - Actions by verifier: verified documents, clarification requests, and recommendation counts.
5. **`dbo.vw_PowerBI_ProcessingTimeMetrics`** (Turnaround Dimension):
   - Elapsed hours and days from initial application submission to final administrative decision.

---

## 3. Recommended Data Model Relationships

In Power BI Desktop **Model View**, set up relationships as follows:
- `vw_PowerBI_ScholarshipMetrics[scholarship_id]` (1) &rarr; `vw_PowerBI_ApplicationMetrics[scholarship_id]` (*)
- `vw_PowerBI_DepartmentMetrics[department]` (1) &rarr; `vw_PowerBI_ApplicationMetrics[department]` (*)
- `vw_PowerBI_ProcessingTimeMetrics[application_id]` (1) &rarr; `vw_PowerBI_ApplicationMetrics[application_id]` (1)

---

## 4. Key DAX Measures

```dax
// 1. Total Applications Submitted
TotalApplications = COUNTROWS(vw_PowerBI_ApplicationMetrics)

// 2. Total Approved Applications
TotalApproved = CALCULATE(
    COUNTROWS(vw_PowerBI_ApplicationMetrics),
    vw_PowerBI_ApplicationMetrics[application_status] = "APPROVED"
)

// 3. Total Rejected Applications
TotalRejected = CALCULATE(
    COUNTROWS(vw_PowerBI_ApplicationMetrics),
    vw_PowerBI_ApplicationMetrics[application_status] = "REJECTED"
)

// 4. Active Applications Under Review
TotalUnderReview = CALCULATE(
    COUNTROWS(vw_PowerBI_ApplicationMetrics),
    vw_PowerBI_ApplicationMetrics[is_pending] = 1
)

// 5. Institutional Approval Rate
ApprovalRate = DIVIDE([TotalApproved], [TotalApplications], 0)

// 6. Total Grant Funds Disbursed (INR ₹)
TotalFundsDisbursed = CALCULATE(
    SUM(vw_PowerBI_ApplicationMetrics[award_amount]),
    vw_PowerBI_ApplicationMetrics[application_status] = "APPROVED"
)

// 7. Average Applicant CGPA
AvgApplicantCGPA = AVERAGE(vw_PowerBI_DepartmentMetrics[avg_applicant_cgpa])

// 8. Average Turnaround Processing Time (Hours)
AvgTurnaroundHours = AVERAGE(vw_PowerBI_ProcessingTimeMetrics[turnaround_hours])
```

---

## 5. Step-by-Step Connection Instructions

1. Download and open **Power BI Desktop** on Windows.
2. Click **Get Data** &rarr; **Azure** &rarr; **Azure SQL database**.
3. In the Connection dialog:
   - **Server:** `<your-azure-sql-server>.database.windows.net` (or `localhost` for local SQL Server).
   - **Database:** `scholarsync-db`.
   - **Data Connectivity mode:** Select **Import**.
4. In **Authentication**, sign in using **Microsoft Entra ID** (preferred) or Database administrator credentials.
5. In the **Navigator** window, check the following views:
   - `dbo.vw_PowerBI_ApplicationMetrics`
   - `dbo.vw_PowerBI_DepartmentMetrics`
   - `dbo.vw_PowerBI_ScholarshipMetrics`
   - `dbo.vw_PowerBI_VerificationPerformance`
   - `dbo.vw_PowerBI_ProcessingTimeMetrics`
6. Click **Load**.
7. In the **Model** tab, verify relationships.
8. Create the DAX measures above in the **Modeling** &rarr; **New Measure** tab.
9. Construct your report visuals (KPI cards, Department bar chart, Status breakdown pie, Turnaround time trend).
10. Save your file locally as `ScholarSync_Analytics.pbix`.
