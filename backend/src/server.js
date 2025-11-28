import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import sequelize, { testConnection, syncDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import urenRoutes from './routes/uren.js';
import hrRoutes from './routes/hr.js';
import notificatiesRoutes from './routes/notificaties.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Te veel verzoeken, probeer het over een minuut opnieuw'
});

app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Overuren API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/uren', urenRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/notificaties', notificatiesRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🔄 Starting Overuren API Server...\n');

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Sync database models
    await syncDatabase({ alter: true }); // Use alter in development, force: false in production

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n✅ Server Configuration:');
      console.log(`   Port: ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`   API Docs: http://localhost:${PORT}/api/health\n`);
      console.log('📡 Server is accessible on your local network');
      console.log('   Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)');
      console.log('   Others can access via: http://[your-ip]:' + PORT + '\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received. Closing server gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT received. Closing server gracefully...');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
