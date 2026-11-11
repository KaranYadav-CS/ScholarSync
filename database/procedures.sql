-- ScholarSync Stored Procedures
-- Implements atomic application submission and status updates

IF OBJECT_ID('dbo.usp_SubmitApplication', 'P') IS NOT NULL DROP PROCEDURE dbo.usp_SubmitApplication;
IF OBJECT_ID('dbo.usp_ChangeApplicationStatus', 'P') IS NOT NULL DROP PROCEDURE dbo.usp_ChangeApplicationStatus;
GO

-- Stored Procedure: Submit Application atomically
CREATE PROCEDURE dbo.usp_SubmitApplication
    @ApplicationId UNIQUEIDENTIFIER,
    @StudentId UNIQUEIDENTIFIER,
    @SubmissionNotes NVARCHAR(MAX) = NULL,
    @CorrelationId VARCHAR(64) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @CurrentStatus VARCHAR(35);
        DECLARE @UserId UNIQUEIDENTIFIER;

        SELECT @CurrentStatus = a.status, @UserId = s.user_id
        FROM dbo.Applications a
        INNER JOIN dbo.Students s ON a.student_id = s.student_id
        WHERE a.application_id = @ApplicationId AND a.student_id = @StudentId;

        IF @CurrentStatus IS NULL
        BEGIN
            THROW 50001, 'Application not found or does not belong to the student.', 1;
        END

        IF @CurrentStatus <> 'DRAFT'
        BEGIN
            THROW 50002, 'Only applications in DRAFT status can be submitted.', 1;
        END

        -- Check if required documents exist
        DECLARE @DocCount INT;
        SELECT @DocCount = COUNT(1) FROM dbo.Documents WHERE application_id = @ApplicationId;
        IF @DocCount = 0
        BEGIN
            THROW 50003, 'Cannot submit application without uploading required documents.', 1;
        END

        -- Update Application
        UPDATE dbo.Applications
        SET status = 'SUBMITTED',
            submission_notes = @SubmissionNotes,
            submitted_at = SYSUTCDATETIME(),
            updated_at = SYSUTCDATETIME()
        WHERE application_id = @ApplicationId;

        -- Record History
        INSERT INTO dbo.ApplicationStatusHistory (
            history_id, application_id, changed_by_user_id, old_status, new_status, change_reason, correlation_id, changed_at
        ) VALUES (
            NEWID(), @ApplicationId, @UserId, 'DRAFT', 'SUBMITTED', 'Student completed application submission', @CorrelationId, SYSUTCDATETIME()
        );

        -- Audit Log
        INSERT INTO dbo.AuditLogs (
            actor_user_id, action, entity_type, entity_id, outcome, correlation_id, metadata_json, event_time
        ) VALUES (
            @UserId, 'APPLICATION_SUBMITTED', 'Application', CAST(@ApplicationId AS NVARCHAR(100)), 'SUCCESS', @CorrelationId, '{"source": "usp_SubmitApplication"}', SYSUTCDATETIME()
        );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Stored Procedure: Admin Final Decision
CREATE PROCEDURE dbo.usp_ChangeApplicationStatus
    @ApplicationId UNIQUEIDENTIFIER,
    @ActorUserId UNIQUEIDENTIFIER,
    @NewStatus VARCHAR(35),
    @Reason NVARCHAR(1000),
    @CorrelationId VARCHAR(64) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @OldStatus VARCHAR(35);

        SELECT @OldStatus = status
        FROM dbo.Applications
        WHERE application_id = @ApplicationId;

        IF @OldStatus IS NULL
        BEGIN
            THROW 50004, 'Application not found.', 1;
        END

        -- Update status
        UPDATE dbo.Applications
        SET status = @NewStatus,
            decision_at = CASE WHEN @NewStatus IN ('APPROVED', 'REJECTED') THEN SYSUTCDATETIME() ELSE decision_at END,
            decision_by_user_id = CASE WHEN @NewStatus IN ('APPROVED', 'REJECTED') THEN @ActorUserId ELSE decision_by_user_id END,
            decision_reason = CASE WHEN @NewStatus IN ('APPROVED', 'REJECTED') THEN @Reason ELSE decision_reason END,
            updated_at = SYSUTCDATETIME()
        WHERE application_id = @ApplicationId;

        -- Record in history
        INSERT INTO dbo.ApplicationStatusHistory (
            history_id, application_id, changed_by_user_id, old_status, new_status, change_reason, correlation_id, changed_at
        ) VALUES (
            NEWID(), @ApplicationId, @ActorUserId, @OldStatus, @NewStatus, @Reason, @CorrelationId, SYSUTCDATETIME()
        );

        -- Record Audit Log
        INSERT INTO dbo.AuditLogs (
            actor_user_id, action, entity_type, entity_id, outcome, correlation_id, metadata_json, event_time
        ) VALUES (
            @ActorUserId, 'STATUS_CHANGED_' + @NewStatus, 'Application', CAST(@ApplicationId AS NVARCHAR(100)), 'SUCCESS', @CorrelationId, '{"reason": "' + STRING_ESCAPE(@Reason, 'json') + '"}', SYSUTCDATETIME()
        );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
