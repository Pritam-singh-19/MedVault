const Reminder = require('../models/reminderModel');
const User = require('../models/userModel');

// Create a new reminder
const createReminder = async (req, res) => {
  try {
    const { medicine, time, days } = req.body;
    const userId = req.user.id;

    const reminder = new Reminder({
      user: userId,
      medicine,
      time,
      days: days || 1,
      createdAt: new Date()
    });

    await reminder.save();
    
    console.log(`💊 New reminder created: ${medicine} at ${time} for ${days || 1} day(s) by user ${userId}`);
    res.status(201).json({
      success: true,
      reminder,
      message: 'Reminder created successfully'
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating reminder',
      error: error.message 
    });
  }
};

// Get all reminders for the logged-in user
const getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await Reminder.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      reminders,
      count: reminders.length
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching reminders',
      error: error.message 
    });
  }
};

// Mark a reminder as taken for a specific day
const markMedicineTaken = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { date } = req.body; // Expected format: "YYYY-MM-DD"
    const userId = req.user.id;

    // Find the reminder and ensure it belongs to the user
    const reminder = await Reminder.findOne({ 
      _id: reminderId, 
      user: userId 
    });

    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    // Initialize takenDates array if it doesn't exist
    if (!reminder.takenDates) {
      reminder.takenDates = [];
    }

    // Check if already marked as taken for this date
    const dateStr = date || new Date().toISOString().split('T')[0]; // Use today if no date provided
    const isAlreadyTaken = reminder.takenDates.some(takenDate => 
      takenDate.toISOString().split('T')[0] === dateStr
    );

    if (isAlreadyTaken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Medicine already marked as taken for this date' 
      });
    }

    // Add the date to takenDates
    reminder.takenDates.push(new Date(dateStr));
    await reminder.save();

    console.log(`✅ Medicine marked as taken: ${reminder.medicine} on ${dateStr} by user ${userId}`);
    
    res.status(200).json({
      success: true,
      message: 'Medicine marked as taken',
      reminder,
      takenDate: dateStr
    });
  } catch (error) {
    console.error('Mark medicine taken error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking medicine as taken',
      error: error.message 
    });
  }
};

// Save FCM token for push notifications (UPDATED)
const saveFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Use the helper method from User model (prevents duplicates automatically)
    const tokenAdded = user.addFCMToken(fcmToken);
    await user.save();

    console.log(`📱 FCM token ${tokenAdded ? 'added' : 'already exists'} for user ${user.email || userId} (Total tokens: ${user.fcmTokens.length})`);

    res.status(200).json({
      success: true,
      message: tokenAdded ? 'FCM token saved successfully' : 'FCM token already exists',
      tokenCount: user.fcmTokens.length,
      isNewToken: tokenAdded
    });
  } catch (error) {
    console.error('Save FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving FCM token',
      error: error.message
    });
  }
};

module.exports = {
  createReminder,
  getReminders,
  markMedicineTaken,
  saveFCMToken
};