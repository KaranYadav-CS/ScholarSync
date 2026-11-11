-- ScholarSync Database Views
-- Includes ApplicationSummaryView and Power BI Aggregation Views

-- Drop existing views if present
IF OBJECT_ID('dbo.vw_PowerBI_DepartmentMetrics', 'V') IS NOT NULL DROP VIEW dbo.vw_PowerBI_DepartmentMetrics;
IF OBJECT_ID('dbo.vw_PowerBI_ScholarshipMetrics', 'V') IS NOT NULL DROP VIEW dbo.vw_PowerBI_ScholarshipMetrics;
IF OBJECT_ID('dbo.vw_PowerBI_ApplicationMetrics', 'V') IS NOT NULL DROP VIEW dbo.vw_PowerBI_ApplicationMetrics;
IF OBJECT_ID('dbo.ApplicationSummaryView', 'V') IS NOT NULL DROP VIEW dbo.ApplicationSummaryView;
GO

-- 1. Operational Administrative Summary View
CREATE VIEW dbo.ApplicationSummaryView AS
SELECT 
    a.application_id,
    a.status AS application_status,
    a.submitted_at,
    a.decision_at,
    a.decision_reason,
    s.scholarship_id,
    s.title AS scholarship_title,
    s.provider AS scholarship_provider,
    s.award_amount,
    st.student_id,
    u_student.full_name AS student_name,
    u_student.email AS student_email,
    st.department,
    st.program,
    st.study_year,
    st.cgpa,
    st.annual_family_income,
    a.assigned_verifier_user_id,
    u_verifier.full_name AS verifier_name,
    u_decider.full_name AS decision_by_name,
    (SELECT COUNT(1) FROM dbo.Documents d WHERE d.application_id = a.application_id) AS document_count,
    (SELECT COUNT(1) FROM dbo.Verifications v WHERE v.application_id = a.application_id) AS verification_count
FROM dbo.Applications a
INNER JOIN dbo.Scholarships s ON a.scholarship_id = s.scholarship_id
INNER JOIN dbo.Students st ON a.student_id = st.student_id
INNER JOIN dbo.Users u_student ON st.user_id = u_student.user_id
LEFT JOIN dbo.Users u_verifier ON a.assigned_verifier_user_id = u_verifier.user_id
LEFT JOIN dbo.Users u_decider ON a.decision_by_user_id = u_decider.user_id;
GO

-- 2. Power BI Minimized Aggregation Metrics View (Anonymized, no PII)
CREATE VIEW dbo.vw_PowerBI_ApplicationMetrics AS
SELECT 
    a.application_id,
    s.scholarship_id,
    s.title AS scholarship_title,
    s.category AS scholarship_category,
    s.award_amount,
    st.department,
    st.study_year,
    a.status AS application_status,
    CAST(a.created_at AS DATE) AS application_date,
    CAST(a.submitted_at AS DATE) AS submission_date,
    CAST(a.decision_at AS DATE) AS decision_date,
    CASE WHEN a.status = 'APPROVED' THEN 1 ELSE 0 END AS is_approved,
    CASE WHEN a.status = 'REJECTED' THEN 1 ELSE 0 END AS is_rejected,
    CASE WHEN a.status = 'SUBMITTED' THEN 1 ELSE 0 END AS is_submitted,
    CASE WHEN a.status IN ('UNDER_REVIEW', 'CLARIFICATION_REQUESTED', 'RESUBMITTED', 'VERIFIED', 'RECOMMENDED_FOR_APPROVAL', 'RECOMMENDED_FOR_REJECTION') THEN 1 ELSE 0 END AS is_pending
FROM dbo.Applications a
INNER JOIN dbo.Scholarships s ON a.scholarship_id = s.scholarship_id
INNER JOIN dbo.Students st ON a.student_id = st.student_id;
GO

-- 3. Power BI Department Rollup Metrics
CREATE VIEW dbo.vw_PowerBI_DepartmentMetrics AS
SELECT 
    st.department,
    COUNT(a.application_id) AS total_applications,
    SUM(CASE WHEN a.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_applications,
    SUM(CASE WHEN a.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_applications,
    SUM(CASE WHEN a.status NOT IN ('APPROVED', 'REJECTED', 'DRAFT') THEN 1 ELSE 0 END) AS in_review_applications,
    AVG(st.cgpa) AS avg_applicant_cgpa
FROM dbo.Applications a
INNER JOIN dbo.Students st ON a.student_id = st.student_id
GROUP BY st.department;
GO

-- 4. Power BI Scholarship Summary Metrics
CREATE VIEW dbo.vw_PowerBI_ScholarshipMetrics AS
SELECT 
    s.scholarship_id,
    s.title AS scholarship_title,
    s.provider,
    s.award_amount,
    s.status AS scholarship_status,
    COUNT(a.application_id) AS total_applications,
    SUM(CASE WHEN a.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_count,
    SUM(CASE WHEN a.status = 'APPROVED' THEN s.award_amount ELSE 0 END) AS total_disbursed_amount
FROM dbo.Scholarships s
LEFT JOIN dbo.Applications a ON s.scholarship_id = a.scholarship_id
GROUP BY s.scholarship_id, s.title, s.provider, s.award_amount, s.status;
GO
