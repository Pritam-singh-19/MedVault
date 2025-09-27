const express = require('express');
const router = express.Router();
const { explainReport } = require('../controllers/explainReportController');
const protect = require('../middleware/authMiddleware');

router.post('/explain-report', protect, explainReport);

module.exports = router;
