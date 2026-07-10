const express = require('express');
const router = express.Router();
const {
  createReport,
  getMyReports,
  getAllReports,
  updateReport,
  deleteReport,
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

// PUT /api/reports/:id - Accessible to Team Members to update their own report
router.put('/:id', authorize('Team Member'), updateReport);

// DELETE /api/reports/:id - Accessible to Team Members to delete their own report
router.delete('/:id', authorize('Team Member'), deleteReport);

module.exports = router;
