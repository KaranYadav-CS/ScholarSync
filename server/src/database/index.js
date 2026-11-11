const config = require('../config');
const demoDb = require('./demoDb');

let mssqlPool = null;

if (!config.demoMode && config.azureSql.server) {
  const sql = require('mssql');
  const sqlConfig = {
    user: config.azureSql.user,
    password: config.azureSql.password,
    server: config.azureSql.server,
    database: config.azureSql.database,
    port: config.azureSql.port,
    options: {
      encrypt: config.azureSql.encrypt,
      trustServerCertificate: false,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  mssqlPool = new sql.ConnectionPool(sqlConfig);
  mssqlPool.connect().then(() => {
    console.log(`[Database] Connected to Azure SQL Database: ${config.azureSql.database}`);
  }).catch((err) => {
    console.error('[Database] Azure SQL connection error, falling back to Demo adapter:', err.message);
    mssqlPool = null;
  });
}

module.exports = {
  isDemoMode: () => config.demoMode || !mssqlPool,
  db: demoDb,
  mssqlPool,
};
