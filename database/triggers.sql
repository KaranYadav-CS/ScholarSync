-- ScholarSync Database Triggers
-- Demonstrates RDBMS audit & timestamp enforcement

IF OBJECT_ID('dbo.trg_Users_UpdateTimestamp', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_Users_UpdateTimestamp;
IF OBJECT_ID('dbo.trg_Applications_PreventStatusTampering', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_Applications_PreventStatusTampering;
GO

-- 1. Automatic Timestamp Update Trigger
CREATE TRIGGER dbo.trg_Users_UpdateTimestamp
ON dbo.Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(full_name) OR UPDATE(role) OR UPDATE(account_status)
    BEGIN
        UPDATE u
        SET updated_at = SYSUTCDATETIME()
        FROM dbo.Users u
        INNER JOIN inserted i ON u.user_id = i.user_id;
    END
END;
GO

-- 2. Prevent Direct Tampering with Approved / Rejected Applications
CREATE TRIGGER dbo.trg_Applications_PreventStatusTampering
ON dbo.Applications
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    -- If an application was already APPROVED or REJECTED, prevent direct modification unless through authorized procedure
    IF EXISTS (
        SELECT 1 
        FROM deleted d
        INNER JOIN inserted i ON d.application_id = i.application_id
        WHERE d.status IN ('APPROVED', 'REJECTED') AND i.status <> d.status
    )
    BEGIN
        RAISERROR ('Final scholarship decisions (APPROVED or REJECTED) are immutable and cannot be rolled back directly.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO
