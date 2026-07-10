const express = require('express');
const router = express.Router();
const {
  createReport,
  getMyReports,
  getAllReports,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All report routes require authentication
router.use(protect);

// GET /api/reports - Accessible to Managers to view all reports across the team
router.get('/', authorize('Manager'), getAllReports);

// POST /api/reports - Accessible to Team Members to submit a new report
router.post('/', authorize('Team Member'), createReport);

// GET /api/reports/my-reports - Accessible to Team Members to view their own reports
router.get('/my-reports', authorize('Team Member'), getMyReports);

module.exports = router;
