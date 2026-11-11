const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'scholarsync_super_secret_jwt_key_academic_demo_mode_32chars',
  cookieSecret: process.env.COOKIE_SECRET || 'scholarsync_cookie_secret_key_academic_demo',
  tokenExpiration: process.env.TOKEN_EXPIRATION || '7d',
  demoMode: process.env.DEMO_MODE === 'true' || !process.env.AZURE_SQL_SERVER,

  azureSql: {
    server: process.env.AZURE_SQL_SERVER,
    database: process.env.AZURE_SQL_DATABASE,
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    port: parseInt(process.env.AZURE_SQL_PORT || '1433', 10),
    encrypt: process.env.AZURE_SQL_ENCRYPT !== 'false',
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
