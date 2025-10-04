const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); 
const profileRoutes = require('./routes/profileRoutes'); 
const explainReportRoutes = require('./routes/explainReportRoutes'); 
const { checkAndSendReminders } = require('./checkAndSendReminder');
const { connectDB } = require('./config/db'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://medvault19.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/upload', uploadRoutes); 
app.use('/api/profile', profileRoutes);
app.use('/api', explainReportRoutes);

// Cron endpoint for manual testing
app.get('/api/cron/trigger-reminders', async (req, res) => {
  console.log('🔔 Manual cron trigger called at', new Date().toISOString());
  try {
    const result = await checkAndSendReminders();
    res.status(200).json({ 
      success: true, 
      message: 'Reminders checked successfully',
      ...result 
    });
  } catch (error) {
    console.error('❌ Cron job error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for debugging
app.get('/api/test-reminder-now', async (req, res) => {
  console.log('🧪 Test endpoint called at', new Date().toISOString());
  try {
    const result = await checkAndSendReminders();
    res.status(200).json({ 
      success: true, 
      message: 'Test completed - check server logs',
      ...result 
    });
  } catch (error) {
    console.error('❌ Test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'MedVault server is running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MedVault API Server',
    endpoints: [
      'GET /api/health - Health check',
      'POST /api/users/register - Register user',
      'POST /api/users/login - Login user',
      'GET /api/reminders - Get reminders',
      'POST /api/reminders - Create reminder',
      'GET /api/upload/folders - Get folders', // ADDED
      'POST /api/upload - Upload file', // ADDED
      'GET /api/profile/me - Get profile', // ADDED
      'PUT /api/profile/update - Update profile', // ADDED
      'GET /api/cron/trigger-reminders - Trigger notifications manually',
      'GET /api/test-reminder-now - Test notifications'
    ]
  });
});


// Database connection
connectDB().then(() => {
  console.log('🚀 Server starting...');
}).catch(err => {
  console.error('❌ Database connection failed:', err);
});



// Start server
app.listen(PORT, () => {
  console.log(`🌟 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test notifications: http://localhost:${PORT}/api/test-reminder-now`);
  console.log(`⏰ Manual cron: http://localhost:${PORT}/api/cron/trigger-reminders`);
  
  // 🔔 NEW: Auto-run notification checker every minute
  console.log('⏰ Starting automatic reminder checker...');
  setInterval(async () => {
    try {
      console.log('🔄 Auto-checking reminders...');
      await checkAndSendReminders();
    } catch (error) {
      console.error('❌ Scheduled notification check failed:', error.message);
    }
  }, 60000); // 60000ms = 1 minute
  
  console.log('✅ Automatic reminder scheduler started - checks every minute');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});