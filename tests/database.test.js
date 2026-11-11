const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Database Schema: 9 core entities are defined in schema.sql with 3NF constraints', () => {
  const schemaPath = path.resolve(__dirname, '../database/schema.sql');
  assert.ok(fs.existsSync(schemaPath), 'schema.sql must exist');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const requiredEntities = [
    'CREATE TABLE dbo.Users',
    'CREATE TABLE dbo.Students',
    'CREATE TABLE dbo.Scholarships',
    'CREATE TABLE dbo.EligibilityCriteria',
    'CREATE TABLE dbo.Applications',
    'CREATE TABLE dbo.Documents',
    'CREATE TABLE dbo.Verifications',
    'CREATE TABLE dbo.ApplicationStatusHistory',
    'CREATE TABLE dbo.AuditLogs',
  ];

  requiredEntities.forEach((entity) => {
    assert.ok(sql.includes(entity), `Entity ${entity} must be declared in schema.sql`);
  });

  // Verify constraints
  assert.ok(sql.includes('CONSTRAINT PK_Users PRIMARY KEY'), 'PK_Users constraint defined');
  assert.ok(sql.includes('CONSTRAINT UQ_Users_Email UNIQUE'), 'UQ_Users_Email unique constraint defined');
  assert.ok(sql.includes('CONSTRAINT CK_Users_Role CHECK'), 'CK_Users_Role check constraint defined');
  assert.ok(sql.includes('CONSTRAINT UQ_Applications_Student_Scholarship UNIQUE'), 'One application per student per scholarship constraint defined');
  assert.ok(sql.includes('CONSTRAINT CK_Applications_Status CHECK'), 'Workflow status constraint defined');
  assert.ok(sql.includes('CONSTRAINT CK_Documents_SizeBytes CHECK'), 'Document size constraint defined');
});

test('Database Schema: Stored procedures and triggers are declared for atomic transitions', () => {
  const procPath = path.resolve(__dirname, '../database/procedures.sql');
  const trigPath = path.resolve(__dirname, '../database/triggers.sql');

  assert.ok(fs.existsSync(procPath), 'procedures.sql must exist');
  assert.ok(fs.existsSync(trigPath), 'triggers.sql must exist');

  const procSql = fs.readFileSync(procPath, 'utf8');
  const trigSql = fs.readFileSync(trigPath, 'utf8');

  assert.ok(procSql.includes('usp_SubmitApplication'), 'usp_SubmitApplication must be declared');
  assert.ok(procSql.includes('usp_ChangeApplicationStatus'), 'usp_ChangeApplicationStatus must be declared');
  assert.ok(trigSql.includes('trg_Users_UpdateTimestamp'), 'trg_Users_UpdateTimestamp must be declared');
  assert.ok(trigSql.includes('trg_Applications_PreventStatusTampering'), 'trg_Applications_PreventStatusTampering must be declared');
});

test('Database Views: Required analytical and reporting views are declared', () => {
  const viewsPath = path.resolve(__dirname, '../database/views.sql');
  assert.ok(fs.existsSync(viewsPath), 'views.sql must exist');
  const viewsSql = fs.readFileSync(viewsPath, 'utf8');

  const requiredViews = [
    'CREATE VIEW dbo.ApplicationSummaryView',
    'CREATE VIEW dbo.vw_PowerBI_ApplicationMetrics',
    'CREATE VIEW dbo.vw_PowerBI_DepartmentMetrics',
    'CREATE VIEW dbo.vw_PowerBI_ScholarshipMetrics',
    'CREATE VIEW dbo.vw_PowerBI_VerificationPerformance',
    'CREATE VIEW dbo.vw_PowerBI_ProcessingTimeMetrics',
    'CREATE VIEW dbo.vw_PowerBI_StudentEligibilityMetrics',
  ];

  requiredViews.forEach((view) => {
    assert.ok(viewsSql.includes(view), `View ${view} must be declared in views.sql`);
  });
});
