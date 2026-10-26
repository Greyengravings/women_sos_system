const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initSocket } = require('./socket');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const sosRoutes = require('./routes/sosRoutes');
const safeZoneRoutes = require('./routes/safeZoneRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Database Connection with Fallback
const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/women-sos';
mongoose.connect(dbUri)
  .then(() => console.log('Connected to MongoDB Atlas successfully!'))
  .catch((err) => {
    console.error('MongoDB Atlas connection error:', err.message);
    console.log('Attempting connection to Local MongoDB...');
    mongoose.connect('mongodb://127.0.0.1:27017/women-sos')
      .then(() => console.log('Connected to Local MongoDB fallback!'))
      .catch((fallbackErr) => console.error('Local MongoDB connection error:', fallbackErr.message));
  });

// 1. CORS Configuration - Handle Preflight early
app.use(cors({
  origin: true,
  credentials: true
}));
app.options(/.*/, cors());

// 2. Security HTTP Headers
app.use(helmet());

// 3. Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting: Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// 5. Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// 6. Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/safe-zones', safeZoneRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('Women SOS API is running');
});

// 9. Global Error Handling Middleware (Catch-all for undefined routes)
app.all(/.*/, (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// 10. Global Error Processing Middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server and WebSocket server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
