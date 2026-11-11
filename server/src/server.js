const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(` ScholarSync API Server running on port ${config.port}`);
  console.log(` Environment : ${config.env}`);
  console.log(` Mode        : ${config.demoMode ? 'DEMO MODE (Local sample data)' : 'AZURE CLOUD MODE'}`);
  console.log(` Health check: http://localhost:${config.port}/api/health`);
  console.log(`====================================================`);
});
