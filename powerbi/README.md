# ScholarSync — Power BI Analytics Guide

This directory contains the data model definition, DAX measures, and setup instructions for connecting **Microsoft Power BI Desktop** to ScholarSync's Azure SQL reporting views.

## 1. Overview & DP-900 Architecture
ScholarSync separates operational transaction processing (OLTP) from analytical reporting (OLAP). The transactional database writes to normalized 3NF tables, while Power BI queries read-only aggregate views (`vw_PowerBI_ApplicationMetrics`, `vw_PowerBI_DepartmentMetrics`, `vw_PowerBI_ScholarshipMetrics`) ensuring student personally identifiable information (PII) is never exposed to report consumers.

> **Licensing Note**: Power BI Desktop is a free authoring tool. An Azure for Students credit does not include Power BI Pro or paid Power BI Embedded capacity. Never use Power BI "Publish to Web" for private institutional student data.

## 2. Recommended Data Model & Relationships
- **Fact Table**: `vw_PowerBI_ApplicationMetrics`
  - Granularity: One record per scholarship application.
  - Keys: `application_id`, `scholarship_id`, `department`.
- **Dimension 1**: `vw_PowerBI_ScholarshipMetrics` (1 to Many relationship with Fact on `scholarship_id`).
- **Dimension 2**: `vw_PowerBI_DepartmentMetrics` (1 to Many relationship with Fact on `department`).

## 3. Key DAX Measures
Create the following DAX measures in Power BI Desktop:

```dax
// Total Applications Submitted
TotalApplications = COUNTROWS(vw_PowerBI_ApplicationMetrics)

// Total Approved
TotalApproved = CALCULATE(
    COUNTROWS(vw_PowerBI_ApplicationMetrics),
    vw_PowerBI_ApplicationMetrics[application_status] = "APPROVED"
)

// Total Rejected
TotalRejected = CALCULATE(
    COUNTROWS(vw_PowerBI_ApplicationMetrics),
    vw_PowerBI_ApplicationMetrics[application_status] = "REJECTED"
)

// Under Active Review
TotalUnderReview = CALCULATE(
    COUNTROWS(vw_PowerBI_ApplicationMetrics),
    vw_PowerBI_ApplicationMetrics[is_pending] = 1
)

// Approval Ratio
ApprovalRate = DIVIDE([TotalApproved], [TotalApplications], 0)

// Total Funds Disbursed (INR)
TotalFundsDisbursed = CALCULATE(
    SUM(vw_PowerBI_ApplicationMetrics[award_amount]),
    vw_PowerBI_ApplicationMetrics[application_status] = "APPROVED"
)

// Average Applicant CGPA
AvgApplicantCGPA = AVERAGE(vw_PowerBI_DepartmentMetrics[avg_applicant_cgpa])
```

## 4. Power BI Desktop Step-by-Step Connection Instructions
1. Open **Microsoft Power BI Desktop**.
2. Select **Get Data** > **Azure** > **Azure SQL database**.
3. Enter Server Name (e.g., `scholarsync-sql-server.database.windows.net`) and Database Name (e.g., `scholarsync-db`).
4. Select **Data Connectivity mode**: **Import** (recommended for performance) or **DirectQuery**.
5. Authenticate using **Microsoft Entra ID** (preferred) or database credentials.
6. In Navigator, select the three views:
   - `dbo.vw_PowerBI_ApplicationMetrics`
   - `dbo.vw_PowerBI_DepartmentMetrics`
   - `dbo.vw_PowerBI_ScholarshipMetrics`
7. Click **Load**.
8. In the **Model View**, verify relationship: `vw_PowerBI_ScholarshipMetrics[scholarship_id]` (1) -> `vw_PowerBI_ApplicationMetrics[scholarship_id]` (*).
9. Create the DAX measures in the **Modeling** tab.
10. Build visualizations:
    - KPI Cards for `TotalApplications`, `TotalApproved`, `TotalFundsDisbursed`, `ApprovalRate`.
    - Clustered Bar Chart: Applications by Department (`department` on Y-axis, `TotalApplications` on X-axis).
    - Donut Chart: Application Status Breakdown (`application_status` as Legend, `TotalApplications` as Values).
    - Line Chart: Applications Trend over Time (`submission_date` on X-axis, `TotalApplications` on Y-axis).
