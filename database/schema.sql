-- ScholarSync Relational Database Schema
-- Azure SQL Database / Microsoft SQL Server Compatible
-- Implements the 9 Core Entities adhering to 3NF

-- Drop tables in reverse order of foreign key dependencies if re-running
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NOT NULL DROP TABLE dbo.AuditLogs;
IF OBJECT_ID('dbo.ApplicationStatusHistory', 'U') IS NOT NULL DROP TABLE dbo.ApplicationStatusHistory;
IF OBJECT_ID('dbo.Verifications', 'U') IS NOT NULL DROP TABLE dbo.Verifications;
IF OBJECT_ID('dbo.Documents', 'U') IS NOT NULL DROP TABLE dbo.Documents;
IF OBJECT_ID('dbo.Applications', 'U') IS NOT NULL DROP TABLE dbo.Applications;
IF OBJECT_ID('dbo.EligibilityCriteria', 'U') IS NOT NULL DROP TABLE dbo.EligibilityCriteria;
IF OBJECT_ID('dbo.Scholarships', 'U') IS NOT NULL DROP TABLE dbo.Scholarships;
IF OBJECT_ID('dbo.Students', 'U') IS NOT NULL DROP TABLE dbo.Students;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;

-- 1. Users Entity
CREATE TABLE dbo.Users (
    user_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    full_name NVARCHAR(150) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    last_login_at DATETIME2(7) NULL,
    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (user_id),
    CONSTRAINT UQ_Users_Email UNIQUE (email),
    CONSTRAINT CK_Users_Role CHECK (role IN ('STUDENT', 'VERIFIER', 'SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN')),
    CONSTRAINT CK_Users_Status CHECK (account_status IN ('ACTIVE', 'DISABLED', 'PENDING'))
);

-- 2. Students Profile Entity
CREATE TABLE dbo.Students (
    student_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    student_number NVARCHAR(50) NULL,
    department NVARCHAR(100) NOT NULL,
    program NVARCHAR(100) NOT NULL,
    study_year INT NOT NULL,
    cgpa DECIMAL(4, 2) NOT NULL,
    annual_family_income DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    domicile_state NVARCHAR(100) NOT NULL,
    category NVARCHAR(50) NOT NULL DEFAULT 'General',
    created_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Students PRIMARY KEY CLUSTERED (student_id),
    CONSTRAINT UQ_Students_UserId UNIQUE (user_id),
    CONSTRAINT FK_Students_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    CONSTRAINT CK_Students_CGPA CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    CONSTRAINT CK_Students_StudyYear CHECK (study_year BETWEEN 1 AND 6),
    CONSTRAINT CK_Students_Income CHECK (annual_family_income >= 0.00)
);

-- 3. Scholarships Entity
CREATE TABLE dbo.Scholarships (
    scholarship_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    title NVARCHAR(200) NOT NULL,
    provider NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    award_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    category NVARCHAR(50) NOT NULL DEFAULT 'Merit-cum-Means',
    application_start_at DATETIME2(7) NOT NULL,
    deadline_at DATETIME2(7) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by_user_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Scholarships PRIMARY KEY CLUSTERED (scholarship_id),
    CONSTRAINT FK_Scholarships_Creator FOREIGN KEY (created_by_user_id) REFERENCES dbo.Users(user_id),
    CONSTRAINT CK_Scholarships_Status CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED')),
    CONSTRAINT CK_Scholarships_Dates CHECK (deadline_at > application_start_at),
    CONSTRAINT CK_Scholarships_Award CHECK (award_amount >= 0.00)
);

-- 4. EligibilityCriteria Entity
CREATE TABLE dbo.EligibilityCriteria (
    criterion_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    scholarship_id UNIQUEIDENTIFIER NOT NULL,
    field_key VARCHAR(50) NOT NULL,
    operator VARCHAR(20) NOT NULL,
    expected_value NVARCHAR(255) NOT NULL,
    upper_value NVARCHAR(255) NULL,
    is_mandatory BIT NOT NULL DEFAULT 1,
    display_reason NVARCHAR(255) NOT NULL,
    created_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_EligibilityCriteria PRIMARY KEY CLUSTERED (criterion_id),
    CONSTRAINT FK_EligibilityCriteria_Scholarship FOREIGN KEY (scholarship_id) REFERENCES dbo.Scholarships(scholarship_id) ON DELETE CASCADE,
    CONSTRAINT CK_Criteria_FieldKey CHECK (field_key IN ('cgpa', 'annual_family_income', 'department', 'study_year', 'domicile_state', 'category')),
    CONSTRAINT CK_Criteria_Operator CHECK (operator IN ('EQ', 'NE', 'GT', 'GTE', 'LT', 'LTE', 'IN', 'BETWEEN'))
);

-- 5. Applications Entity
CREATE TABLE dbo.Applications (
    application_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    student_id UNIQUEIDENTIFIER NOT NULL,
    scholarship_id UNIQUEIDENTIFIER NOT NULL,
    assigned_verifier_user_id UNIQUEIDENTIFIER NULL,
    status VARCHAR(35) NOT NULL DEFAULT 'DRAFT',
    submission_notes NVARCHAR(MAX) NULL,
    submitted_at DATETIME2(7) NULL,
    decision_at DATETIME2(7) NULL,
    decision_by_user_id UNIQUEIDENTIFIER NULL,
    decision_reason NVARCHAR(MAX) NULL,
    created_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Applications PRIMARY KEY CLUSTERED (application_id),
    CONSTRAINT UQ_Applications_Student_Scholarship UNIQUE (student_id, scholarship_id),
    CONSTRAINT FK_Applications_Student FOREIGN KEY (student_id) REFERENCES dbo.Students(student_id),
    CONSTRAINT FK_Applications_Scholarship FOREIGN KEY (scholarship_id) REFERENCES dbo.Scholarships(scholarship_id),
    CONSTRAINT FK_Applications_Verifier FOREIGN KEY (assigned_verifier_user_id) REFERENCES dbo.Users(user_id),
    CONSTRAINT FK_Applications_DecisionMaker FOREIGN KEY (decision_by_user_id) REFERENCES dbo.Users(user_id),
    CONSTRAINT CK_Applications_Status CHECK (status IN (
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'CLARIFICATION_REQUESTED',
        'RESUBMITTED',
        'VERIFIED',
        'RECOMMENDED_FOR_APPROVAL',
        'RECOMMENDED_FOR_REJECTION',
        'APPROVED',
        'REJECTED',
        'WITHDRAWN'
    ))
);

-- 6. Documents Entity (Metadata only; file bytes reside in Blob Storage)
CREATE TABLE dbo.Documents (
    document_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    application_id UNIQUEIDENTIFIER NOT NULL,
    uploaded_by_user_id UNIQUEIDENTIFIER NOT NULL,
    document_type NVARCHAR(50) NOT NULL,
    blob_name NVARCHAR(255) NOT NULL,
    original_file_name NVARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NULL,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    verification_comments NVARCHAR(500) NULL,
    uploaded_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Documents PRIMARY KEY CLUSTERED (document_id),
    CONSTRAINT UQ_Documents_BlobName UNIQUE (blob_name),
    CONSTRAINT FK_Documents_Application FOREIGN KEY (application_id) REFERENCES dbo.Applications(application_id) ON DELETE CASCADE,
    CONSTRAINT FK_Documents_Uploader FOREIGN KEY (uploaded_by_user_id) REFERENCES dbo.Users(user_id),
    CONSTRAINT CK_Documents_VerificationStatus CHECK (verification_status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'REPLACED')),
    CONSTRAINT CK_Documents_SizeBytes CHECK (size_bytes > 0 AND size_bytes <= 10485760) -- Max 10MB
);

-- 7. Verifications Entity
CREATE TABLE dbo.Verifications (
    verification_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    application_id UNIQUEIDENTIFIER NOT NULL,
    verifier_user_id UNIQUEIDENTIFIER NOT NULL,
    action VARCHAR(40) NOT NULL,
    comments NVARCHAR(MAX) NOT NULL,
    action_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Verifications PRIMARY KEY CLUSTERED (verification_id),
    CONSTRAINT FK_Verifications_Application FOREIGN KEY (application_id) REFERENCES dbo.Applications(application_id),
    CONSTRAINT FK_Verifications_Verifier FOREIGN KEY (verifier_user_id) REFERENCES dbo.Users(user_id),
    CONSTRAINT CK_Verifications_Action CHECK (action IN (
        'REVIEW_STARTED',
        'DOCUMENTS_VERIFIED',
        'CLARIFICATION_REQUESTED',
        'RECOMMEND_APPROVAL',
        'RECOMMEND_REJECTION'
    ))
);

-- 8. ApplicationStatusHistory Entity
CREATE TABLE dbo.ApplicationStatusHistory (
    history_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    application_id UNIQUEIDENTIFIER NOT NULL,
    changed_by_user_id UNIQUEIDENTIFIER NULL,
    old_status VARCHAR(35) NOT NULL,
    new_status VARCHAR(35) NOT NULL,
    change_reason NVARCHAR(1000) NULL,
    correlation_id VARCHAR(64) NULL,
    changed_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_ApplicationStatusHistory PRIMARY KEY CLUSTERED (history_id),
    CONSTRAINT FK_StatusHistory_Application FOREIGN KEY (application_id) REFERENCES dbo.Applications(application_id) ON DELETE CASCADE,
    CONSTRAINT FK_StatusHistory_Actor FOREIGN KEY (changed_by_user_id) REFERENCES dbo.Users(user_id)
);

-- 9. AuditLogs Entity
CREATE TABLE dbo.AuditLogs (
    audit_id BIGINT IDENTITY(1,1) NOT NULL,
    actor_user_id UNIQUEIDENTIFIER NULL,
    action VARCHAR(60) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id NVARCHAR(100) NOT NULL,
    outcome VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    correlation_id VARCHAR(64) NULL,
    ip_address VARCHAR(45) NULL,
    metadata_json NVARCHAR(MAX) NULL,
    event_time DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_AuditLogs PRIMARY KEY CLUSTERED (audit_id),
    CONSTRAINT FK_AuditLogs_Actor FOREIGN KEY (actor_user_id) REFERENCES dbo.Users(user_id)
);

-- Performance Indexes
CREATE NONCLUSTERED INDEX IX_Applications_Student ON dbo.Applications (student_id);
CREATE NONCLUSTERED INDEX IX_Applications_Scholarship_Status ON dbo.Applications (scholarship_id, status);
CREATE NONCLUSTERED INDEX IX_Applications_Verifier_Status ON dbo.Applications (assigned_verifier_user_id, status);
CREATE NONCLUSTERED INDEX IX_Scholarships_Status_Deadline ON dbo.Scholarships (status, deadline_at);
CREATE NONCLUSTERED INDEX IX_Documents_Application ON dbo.Documents (application_id);
CREATE NONCLUSTERED INDEX IX_StatusHistory_Application ON dbo.ApplicationStatusHistory (application_id, changed_at DESC);
CREATE NONCLUSTERED INDEX IX_AuditLogs_EventTime ON dbo.AuditLogs (event_time DESC);
