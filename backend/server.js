const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');

// Import database config
const { initializeDatabase } = require('./models/sequelize');
const socketManager = require('./config/socket');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const destinationRoutes = require('./routes/destination');
const reviewRoutes = require('./routes/reviews');
const favoriteRoutes = require('./routes/favorites');
const travelPlanRoutes = require('./routes/travelPlans');
const matchingRoutes = require('./routes/matching');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');

// Import error handler
const { handleError } = require('./utils/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Static file serving for uploads with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/travel-plans', travelPlanRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Traveller Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(handleError);

// Initialize database and Redis connections
const initializeConnections = async () => {
  try {
    // Initialize database with Sequelize
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('Failed to initialize database');
      process.exit(1);
    }
    
    // Redis is optional - skip for now
    console.log('⏭️  Redis skipped (not required for basic functionality)');
    
    console.log('✓ All connections initialized successfully');
  } catch (error) {
    console.error('Failed to initialize connections:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await initializeConnections();
  
  // Create HTTP server
  const server = http.createServer(app);
  
  // Initialize Socket.io
  socketManager.initialize(server);
  console.log('✓ Socket.io initialized');
  
  server.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('✓ WebSocket server ready for connections');
  });
};

startServer();