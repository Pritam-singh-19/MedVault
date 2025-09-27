const express = require('express');
const { registerUser, loginUser, googleLogin } = require('../controllers/authController');

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Google login route
router.post('/google', googleLogin);

module.exports = router;
