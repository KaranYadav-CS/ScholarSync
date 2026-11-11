const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Module Routes
const authRoutes = require('./modules/auth/authRoutes');
const studentRoutes = require('./modules/students/studentRoutes');
const scholarshipRoutes = require('./modules/scholarships/scholarshipRoutes');
const applicationRoutes = require('./modules/applications/applicationRoutes');
const documentRoutes = require('./modules/documents/documentRoutes');
const verificationRoutes = require('./modules/verifications/verificationRoutes');
const analyticsRoutes = require('./modules/analytics/analyticsRoutes');
const auditRoutes = require('./modules/audit/auditRoutes');
const userRoutes = require('./modules/users/userRoutes');

const app = express();

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows React dev/bundled assets without inline-script blocking
    crossOriginEmbedderPolicy: false,
  })
);

// CORS setup (configured for both dev and single-origin production)
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookieSecret));

// Correlation ID & Request logging middleware
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: config.demoMode ? 'DEMO_MODE' : 'AZURE_PRODUCTION',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
  });
});

// Mode status endpoint
app.get('/api/mode', (req, res) => {
  res.json({
    demoMode: config.demoMode,
    database: config.demoMode ? 'Local Persistent JSON' : 'Azure SQL Database',
    storage: config.demoMode ? 'Local Demo Disk' : 'Azure Blob Storage',
  });
});

// Apply API rate limiting
app.use('/api', apiLimiter);

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/verifier', verificationRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/audit-logs', auditRoutes);
app.use('/api/admin/users', userRoutes);

// Production Static Serving: Serve client dist if built
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // In development when client dist is not built yet
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>ScholarSync API Server</title></head>
          <body style="font-family:sans-serif; text-align:center; padding: 50px;">
            <h2>ScholarSync REST API is running.</h2>
            <p>Mode: <strong>${config.demoMode ? 'DEMO MODE' : 'AZURE MODE'}</strong></p>
            <p>Please start the Vite client with <code>npm run dev:client</code> or build it with <code>npm run build</code>.</p>
          </body>
        </html>
      `);
    }
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
