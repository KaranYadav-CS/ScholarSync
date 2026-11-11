# ScholarSync — Entity Relationship Diagram & Data Dictionary

## 1. Mermaid Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o| STUDENTS : "has_profile (1:1)"
    USERS ||--o{ SCHOLARSHIPS : "creates (1:N)"
    USERS ||--o{ APPLICATIONS : "verifies (1:N)"
    USERS ||--o{ APPLICATIONS : "decides (1:N)"
    USERS ||--o{ DOCUMENTS : "uploads (1:N)"
    USERS ||--o{ VERIFICATIONS : "records (1:N)"
    USERS ||--o{ APPLICATION_STATUS_HISTORY : "triggers (1:N)"
    USERS ||--o{ AUDIT_LOGS : "performs (1:N)"

    STUDENTS ||--o{ APPLICATIONS : "submits (1:N)"

    SCHOLARSHIPS ||--o{ ELIGIBILITY_CRITERIA : "defines (1:N)"
    SCHOLARSHIPS ||--o{ APPLICATIONS : "receives (1:N)"

    APPLICATIONS ||--o{ DOCUMENTS : "attaches (1:N)"
    APPLICATIONS ||--o{ VERIFICATIONS : "contains (1:N)"
    APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORY : "tracks (1:N)"

    USERS {
        uniqueidentifier user_id PK
        nvarchar full_name
        nvarchar email UK
        nvarchar password_hash
        varchar role
        varchar account_status
        datetime2 created_at
        datetime2 updated_at
        datetime2 last_login_at
    }

    STUDENTS {
        uniqueidentifier student_id PK
        uniqueidentifier user_id FK,UK
        nvarchar student_number
        nvarchar department
        nvarchar program
        int study_year
        decimal cgpa
        decimal annual_family_income
        nvarchar domicile_state
        nvarchar category
        datetime2 created_at
        datetime2 updated_at
    }

    SCHOLARSHIPS {
        uniqueidentifier scholarship_id PK
        nvarchar title
        nvarchar provider
        nvarchar description
        decimal award_amount
        varchar currency
        nvarchar category
        datetime2 application_start_at
        datetime2 deadline_at
        varchar status
        uniqueidentifier created_by_user_id FK
        datetime2 created_at
        datetime2 updated_at
    }

    ELIGIBILITY_CRITERIA {
        uniqueidentifier criterion_id PK
        uniqueidentifier scholarship_id FK
        varchar field_key
        varchar operator
        nvarchar expected_value
        nvarchar upper_value
        bit is_mandatory
        nvarchar display_reason
        datetime2 created_at
    }

    APPLICATIONS {
        uniqueidentifier application_id PK
        uniqueidentifier student_id FK
        uniqueidentifier scholarship_id FK
        uniqueidentifier assigned_verifier_user_id FK
        varchar status
        nvarchar submission_notes
        datetime2 submitted_at
        datetime2 decision_at
        uniqueidentifier decision_by_user_id FK
        nvarchar decision_reason
        datetime2 created_at
        datetime2 updated_at
    }

    DOCUMENTS {
        uniqueidentifier document_id PK
        uniqueidentifier application_id FK
        uniqueidentifier uploaded_by_user_id FK
        nvarchar document_type
        nvarchar blob_name UK
        nvarchar original_file_name
        varchar content_type
        bigint size_bytes
        varchar sha256_hash
        varchar verification_status
        nvarchar verification_comments
        datetime2 uploaded_at
    }

    VERIFICATIONS {
        uniqueidentifier verification_id PK
        uniqueidentifier application_id FK
        uniqueidentifier verifier_user_id FK
        varchar action
        nvarchar comments
        datetime2 action_at
    }

    APPLICATION_STATUS_HISTORY {
        uniqueidentifier history_id PK
        uniqueidentifier application_id FK
        uniqueidentifier changed_by_user_id FK
        varchar old_status
        varchar new_status
        nvarchar change_reason
        varchar correlation_id
        datetime2 changed_at
    }

    AUDIT_LOGS {
        bigint audit_id PK
        uniqueidentifier actor_user_id FK
        varchar action
        varchar entity_type
        nvarchar entity_id
        varchar outcome
        varchar correlation_id
        varchar ip_address
        nvarchar metadata_json
        datetime2 event_time
    }
```

## 2. Normalization Verification (3NF)
- **1NF**: Every column contains atomic scalar values. No comma-separated criterion strings or document arrays.
- **2NF**: All non-key attributes are fully dependent on the primary key.
- **3NF**: No transitive dependencies. Student attributes reside solely in `Students`; scholarship details in `Scholarships`; applications link them using foreign keys.
