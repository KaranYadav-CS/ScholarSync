const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const sqlServerHost = process.env.AZURE_SQL_SERVER || process.env.SQL_SERVER_HOST || process.env.MSSQL_HOST;
const sqlDatabase = process.env.AZURE_SQL_DATABASE || process.env.SQL_SERVER_DATABASE || process.env.MSSQL_DATABASE;
const sqlUser = process.env.AZURE_SQL_USER || process.env.SQL_SERVER_USER || process.env.MSSQL_USER;
const sqlPassword = process.env.AZURE_SQL_PASSWORD || process.env.SQL_SERVER_PASSWORD || process.env.MSSQL_PASSWORD;

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'scholarsync_super_secret_jwt_key_academic_demo_mode_32chars',
  cookieSecret: process.env.COOKIE_SECRET || 'scholarsync_cookie_secret_key_academic_demo',
  tokenExpiration: process.env.TOKEN_EXPIRATION || '7d',

  // Demo mode defaults to true if SQL Server credentials are absent, or explicitly set
  demoMode: process.env.DEMO_MODE === 'true' || !sqlServerHost,

  sqlServer: {
    server: sqlServerHost,
    database: sqlDatabase || 'scholarsync-db',
    user: sqlUser,
    password: sqlPassword,
    port: parseInt(process.env.AZURE_SQL_PORT || process.env.SQL_SERVER_PORT || '1433', 10),
    encrypt: process.env.AZURE_SQL_ENCRYPT === 'true' || (sqlServerHost && sqlServerHost.includes('database.windows.net')),
    trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT === 'true' || !sqlServerHost?.includes('database.windows.net'),
  },

  azureBlob: {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'scholarship-documents',
    accessKey: process.env.AZURE_STORAGE_ACCESS_KEY,
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  },

  uploadDir: path.resolve(__dirname, '../../data/uploads'),
  localDbPath: path.resolve(__dirname, '../../data/local-db.json'),
};

module.exports = config;
