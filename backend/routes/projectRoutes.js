const express = require('express');
const router = express.Router();
const { getProjects, createProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All project routes require authentication
router.use(protect);

// GET /api/projects - Accessible to all authenticated users (Team Members to select, Managers to view)
router.get('/', getProjects);

// POST /api/projects - Restricted to Managers only
router.post('/', authorize('Manager'), createProject);

module.exports = router;
