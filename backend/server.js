/**
 * JAFS Voice Ordering System - Main Server
 * Express server with AI-powered conversation handling
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import chatRoutes from './routes/chat.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import transcriptRoutes from './routes/transcripts.js';

// Load environment variables
dotenv.config();

// Debug: Verify environment variables are loaded
console.log('Environment loaded:');
console.log('- GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? 'SET' : 'NOT SET');
console.log('- GITHUB_AI_ENDPOINT:', process.env.GITHUB_AI_ENDPOINT || 'default');
console.log('- GITHUB_AI_MODEL:', process.env.GITHUB_AI_MODEL || 'default');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transcripts', transcriptRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'JAFS Voice Ordering API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Endpoint not found' } });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Try to connect to MongoDB if URI is provided
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/jafs-ordering?retryWrites=true&w=majority') {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas');
    } else {
      console.log('⚠️  Running without MongoDB (using in-memory storage)');
      console.log('   Set MONGODB_URI in .env for persistent storage');
    }

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🍔JAFS Voice Ordering System - Backend Server          ║
║                                                          ║
║   Server running on: http://localhost:${PORT}            ║
║                                                          ║
║   Endpoints:                                             ║
║   • POST /api/chat     - AI conversation                 ║
║   • GET  /api/menu     - Restaurant menu                 ║
║   • GET  /api/orders   - Order management                ║
║   • POST /api/orders   - Create order                    ║
║   • GET  /api/transcripts - Conversation logs            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
