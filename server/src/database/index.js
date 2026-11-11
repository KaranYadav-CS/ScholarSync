const config = require('../config');
const demoDb = require('./demoDb');

let mssqlPool = null;
let mssqlLib = null;

if (!config.demoMode && config.sqlServer.server) {
  try {
    mssqlLib = require('mssql');
    const sqlConfig = {
      user: config.sqlServer.user,
      password: config.sqlServer.password,
      server: config.sqlServer.server,
      database: config.sqlServer.database,
      port: config.sqlServer.port,
      options: {
        encrypt: config.sqlServer.encrypt,
        trustServerCertificate: config.sqlServer.trustServerCertificate,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    mssqlPool = new mssqlLib.ConnectionPool(sqlConfig);
    mssqlPool
      .connect()
      .then(() => {
        console.log(`[Database] Successfully connected to SQL Server / Azure SQL: ${config.sqlServer.database}`);
      })
      .catch((err) => {
        console.warn(`[Database] SQL Server unreachable (${err.message}). Using local isolated demo repository.`);
        mssqlPool = null;
      });
  } catch (err) {
    console.warn('[Database] mssql driver initialization warning:', err.message);
  }
}

/**
 * Execute parameterized query when connected to SQL Server
 */
async function query(sqlText, params = {}) {
  if (mssqlPool) {
    const request = mssqlPool.request();
    for (const [key, val] of Object.entries(params)) {
      request.input(key, val);
    }
    return await request.query(sqlText);
  }
  throw new Error('Direct SQL execution requires active SQL Server connection.');
}

module.exports = {
  isDemoMode: () => config.demoMode || !mssqlPool,
  db: demoDb,
  mssqlPool,
  query,
};
