const express = require('express');
const router = express.Router();
const { chatbotQuery } = require('../controllers/chatbotController');

// POST /api/chatbot - handle user queries to chatbot
router.post('/chatbot', chatbotQuery);

module.exports = router;
