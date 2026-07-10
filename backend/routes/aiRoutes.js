const express = require('express');
const router = express.Router();
const { askAssistant } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Protect and authorize AI routes for Managers only
router.post('/chat', protect, authorize('Manager'), askAssistant);

module.exports = router;
