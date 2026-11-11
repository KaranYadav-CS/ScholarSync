-- ScholarSync Demo Seed Script
-- Realistic Fictional Data for Local Development and Demonstrations
-- Default Demo Password for all accounts: Password123!
-- (Bcrypt hash: $2a$10$wT2mflzV2kH/yJt6FsqXmOS5lA1uQ8OqO/Q.xZtM6wO8wXG5v4x6.)

-- Fixed deterministic GUIDs for cross-entity reference
DECLARE @AdminUserId UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @SysAdminUserId UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';
DECLARE @VerifierUserId UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333333';
DECLARE @Student1UserId UNIQUEIDENTIFIER = '44444444-4444-4444-4444-444444444444';
DECLARE @Student2UserId UNIQUEIDENTIFIER = '55555555-5555-5555-5555-555555555555';

DECLARE @Student1Id UNIQUEIDENTIFIER = 'A1111111-AAAA-AAAA-AAAA-AAAAAAAAAAAA';
DECLARE @Student2Id UNIQUEIDENTIFIER = 'A2222222-AAAA-AAAA-AAAA-AAAAAAAAAAAA';

DECLARE @Scholarship1Id UNIQUEIDENTIFIER = 'B1111111-BBBB-BBBB-BBBB-BBBBBBBBBBBB';
DECLARE @Scholarship2Id UNIQUEIDENTIFIER = 'B2222222-BBBB-BBBB-BBBB-BBBBBBBBBBBB';
DECLARE @Scholarship3Id UNIQUEIDENTIFIER = 'B3333333-BBBB-BBBB-BBBB-BBBBBBBBBBBB';

DECLARE @Application1Id UNIQUEIDENTIFIER = 'C1111111-CCCC-CCCC-CCCC-CCCCCCCCCCCC';
DECLARE @Application2Id UNIQUEIDENTIFIER = 'C2222222-CCCC-CCCC-CCCC-CCCCCCCCCCCC';

-- Insert Users
INSERT INTO dbo.Users (user_id, full_name, email, password_hash, role, account_status)
VALUES 
(@AdminUserId, 'Dr. Sarah Mitchell', 'admin@scholarsync.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'SCHOLARSHIP_ADMIN', 'ACTIVE'),
(@SysAdminUserId, 'Alex Chen', 'sysadmin@scholarsync.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'SYSTEM_ADMIN', 'ACTIVE'),
(@VerifierUserId, 'Prof. Robert Jenkins', 'verifier@scholarsync.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'VERIFIER', 'ACTIVE'),
(@Student1UserId, 'Aarav Sharma', 'student@scholarsync.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'STUDENT', 'ACTIVE'),
(@Student2UserId, 'Priya Patel', 'priya.patel@scholarsync.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'STUDENT', 'ACTIVE');

-- Insert Students Profiles
INSERT INTO dbo.Students (student_id, user_id, student_number, department, program, study_year, cgpa, annual_family_income, domicile_state, category)
VALUES 
(@Student1Id, @Student1UserId, 'CS-2024-042', 'Computer Science and Engineering', 'B.Tech', 3, 8.85, 320000.00, 'Maharashtra', 'General'),
(@Student2Id, @Student2UserId, 'EE-2024-118', 'Electrical and Electronics Engineering', 'B.Tech', 2, 7.90, 580000.00, 'Karnataka', 'OBC');

-- Insert Scholarships
INSERT INTO dbo.Scholarships (scholarship_id, title, provider, description, award_amount, currency, category, application_start_at, deadline_at, status, created_by_user_id)
VALUES 
(@Scholarship1Id, 'National Excellence STEM Scholarship 2026', 'Ministry of Education & Tech Foundation', 'Prestigious scholarship awarded to high-performing STEM undergraduates with financial need. Covers annual tuition fee and academic resources allowance.', 75000.00, 'INR', 'Merit-cum-Means', DATEADD(DAY, -30, SYSUTCDATETIME()), DATEADD(DAY, 60, SYSUTCDATETIME()), 'PUBLISHED', @AdminUserId),
(@Scholarship2Id, 'Women in Computing & AI Fellowship', 'Global Tech Diversity Initiative', 'Promoting gender diversity in advanced computing, machine learning, and software systems. Open to 2nd to 4th year women engineering students.', 50000.00, 'INR', 'Merit-based', DATEADD(DAY, -15, SYSUTCDATETIME()), DATEADD(DAY, 45, SYSUTCDATETIME()), 'PUBLISHED', @AdminUserId),
(@Scholarship3Id, 'Community Uplift Rural Opportunity Grant', 'Apex Charitable Trust', 'Dedicated financial grant for students from rural backgrounds and lower-income families who maintain solid academic standing.', 40000.00, 'INR', 'Need-based', DATEADD(DAY, -10, SYSUTCDATETIME()), DATEADD(DAY, 90, SYSUTCDATETIME()), 'PUBLISHED', @AdminUserId);

-- Insert Eligibility Criteria for Scholarship 1 (STEM Scholarship)
INSERT INTO dbo.EligibilityCriteria (criterion_id, scholarship_id, field_key, operator, expected_value, upper_value, is_mandatory, display_reason)
VALUES 
(NEWID(), @Scholarship1Id, 'cgpa', 'GTE', '7.5', NULL, 1, 'Minimum CGPA of 7.5 on a 10.0 scale'),
(NEWID(), @Scholarship1Id, 'annual_family_income', 'LTE', '600000', NULL, 1, 'Annual family income must not exceed INR 6,00,000'),
(NEWID(), @Scholarship1Id, 'study_year', 'GTE', '2', NULL, 1, 'Applicant must be in 2nd year or above');

-- Insert Eligibility Criteria for Scholarship 2 (Women in Computing)
INSERT INTO dbo.EligibilityCriteria (criterion_id, scholarship_id, field_key, operator, expected_value, upper_value, is_mandatory, display_reason)
VALUES 
(NEWID(), @Scholarship2Id, 'cgpa', 'GTE', '8.0', NULL, 1, 'Cumulative CGPA of 8.0 or higher'),
(NEWID(), @Scholarship2Id, 'study_year', 'BETWEEN', '2', '4', 1, 'Must be enrolled in 2nd, 3rd, or 4th year of study');

-- Insert Sample Applications
INSERT INTO dbo.Applications (application_id, student_id, scholarship_id, assigned_verifier_user_id, status, submission_notes, submitted_at)
VALUES 
(@Application1Id, @Student1Id, @Scholarship1Id, @VerifierUserId, 'UNDER_REVIEW', 'Passionate about distributed systems. Requesting fee waiver.', DATEADD(DAY, -5, SYSUTCDATETIME())),
(@Application2Id, @Student2Id, @Scholarship3Id, NULL, 'SUBMITTED', 'Applying based on rural domicile and family annual income certificate.', DATEADD(DAY, -2, SYSUTCDATETIME()));

-- Insert Sample Documents for Application 1
INSERT INTO dbo.Documents (document_id, application_id, uploaded_by_user_id, document_type, blob_name, original_file_name, content_type, size_bytes, verification_status)
VALUES 
(NEWID(), @Application1Id, @Student1UserId, 'Income Certificate', 'demo-income-cert-001.pdf', 'Income_Certificate_2025_26.pdf', 'application/pdf', 245120, 'ACCEPTED'),
(NEWID(), @Application1Id, @Student1UserId, 'Academic Transcript', 'demo-transcript-001.pdf', 'Sem5_Official_Transcript.pdf', 'application/pdf', 512300, 'PENDING');

-- Insert Verification record
INSERT INTO dbo.Verifications (verification_id, application_id, verifier_user_id, action, comments, action_at)
VALUES 
(NEWID(), @Application1Id, @VerifierUserId, 'REVIEW_STARTED', 'Initial check of submitted income certificate. Authenticated with tahsildar stamp.', DATEADD(DAY, -3, SYSUTCDATETIME()));

-- Insert Status History
INSERT INTO dbo.ApplicationStatusHistory (history_id, application_id, changed_by_user_id, old_status, new_status, change_reason, changed_at)
VALUES 
(NEWID(), @Application1Id, @Student1UserId, 'DRAFT', 'SUBMITTED', 'Initial student submission', DATEADD(DAY, -5, SYSUTCDATETIME())),
(NEWID(), @Application1Id, @AdminUserId, 'SUBMITTED', 'UNDER_REVIEW', 'Assigned to faculty verifier Prof. Robert Jenkins', DATEADD(DAY, -4, SYSUTCDATETIME()));

-- Insert Audit Logs
INSERT INTO dbo.AuditLogs (actor_user_id, action, entity_type, entity_id, outcome, event_time)
VALUES 
(@Student1UserId, 'APPLICATION_SUBMITTED', 'Application', CAST(@Application1Id AS NVARCHAR(100)), 'SUCCESS', DATEADD(DAY, -5, SYSUTCDATETIME())),
(@AdminUserId, 'VERIFIER_ASSIGNED', 'Application', CAST(@Application1Id AS NVARCHAR(100)), 'SUCCESS', DATEADD(DAY, -4, SYSUTCDATETIME()));
