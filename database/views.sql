-- ScholarSync Database Views
-- Includes ApplicationSummaryView and Comprehensive Power BI Reporting Views

-- Drop existing views if present
IF OBJECT_ID('dbo.vw_PowerBI_ProcessingTimeMetrics', 'V') IS NOT NULL DROP VIEW dbo.vw_PowerBI_ProcessingTimeMetrics;
IF OBJECT_ID('dbo.vw_PowerBI_VerificationPerformance', 'V') IS NOT NULL DROP VIEW dbo.vw_PowerBI_VerificationPerformance;
IF OBJECT_ID('dbo.vw_PowerBI_StudentEligibilityMetrics', 'V') IS NOT NULL DROP VIEW dbo.vw_PowerBI_StudentEligibilityMetrics;
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
    AVG(st.cgpa) AS avg_applicant_cgpa,
    AVG(st.annual_family_income) AS avg_annual_family_income
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
    SUM(CASE WHEN a.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count,
    SUM(CASE WHEN a.status = 'APPROVED' THEN s.award_amount ELSE 0 END) AS total_disbursed_amount
FROM dbo.Scholarships s
LEFT JOIN dbo.Applications a ON s.scholarship_id = a.scholarship_id
GROUP BY s.scholarship_id, s.title, s.provider, s.award_amount, s.status;
GO

-- 5. Power BI Verifier Performance Metrics
CREATE VIEW dbo.vw_PowerBI_VerificationPerformance AS
SELECT 
    v.verifier_user_id,
    u.full_name AS verifier_name,
    COUNT(v.verification_id) AS total_verification_actions,
    SUM(CASE WHEN v.action = 'DOCUMENTS_VERIFIED' THEN 1 ELSE 0 END) AS documents_verified_count,
    SUM(CASE WHEN v.action = 'CLARIFICATION_REQUESTED' THEN 1 ELSE 0 END) AS clarification_requests_count,
    SUM(CASE WHEN v.action = 'RECOMMEND_APPROVAL' THEN 1 ELSE 0 END) AS approval_recommendations_count,
    SUM(CASE WHEN v.action = 'RECOMMEND_REJECTION' THEN 1 ELSE 0 END) AS rejection_recommendations_count
FROM dbo.Verifications v
INNER JOIN dbo.Users u ON v.verifier_user_id = u.user_id
GROUP BY v.verifier_user_id, u.full_name;
GO

-- 6. Power BI Application Processing Time Metrics
CREATE VIEW dbo.vw_PowerBI_ProcessingTimeMetrics AS
SELECT 
    a.application_id,
    s.scholarship_id,
    s.title AS scholarship_title,
    st.department,
    a.status,
    a.submitted_at,
    a.decision_at,
    DATEDIFF(HOUR, a.submitted_at, a.decision_at) AS turnaround_hours,
    DATEDIFF(DAY, a.submitted_at, a.decision_at) AS turnaround_days
FROM dbo.Applications a
INNER JOIN dbo.Scholarships s ON a.scholarship_id = s.scholarship_id
INNER JOIN dbo.Students st ON a.student_id = st.student_id
WHERE a.submitted_at IS NOT NULL AND a.decision_at IS NOT NULL;
GO

-- 7. Power BI Student Eligibility Metrics
CREATE VIEW dbo.vw_PowerBI_StudentEligibilityMetrics AS
SELECT 
    ec.criterion_id,
    ec.scholarship_id,
    s.title AS scholarship_title,
    ec.field_key,
    ec.operator,
    ec.expected_value,
    ec.is_mandatory,
    COUNT(DISTINCT a.student_id) AS total_applicants_evaluated
FROM dbo.EligibilityCriteria ec
INNER JOIN dbo.Scholarships s ON ec.scholarship_id = s.scholarship_id
LEFT JOIN dbo.Applications a ON s.scholarship_id = a.scholarship_id
GROUP BY ec.criterion_id, ec.scholarship_id, s.title, ec.field_key, ec.operator, ec.expected_value, ec.is_mandatory;
GO
