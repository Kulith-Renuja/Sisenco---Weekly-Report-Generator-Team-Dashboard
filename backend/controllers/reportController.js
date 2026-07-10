const Report = require('../models/Report');

/**
 * @desc    Create a new weekly report
 * @route   POST /api/reports
 * @access  Private (Team Member only)
 */
const createReport = async (req, res) => {
  try {
    const {
      weekStartDate,
      weekEndDate,
      project,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked,
      notes,
      status
    } = req.body;

    // Validate minimum required fields based on our model
    if (!weekStartDate || !weekEndDate || !project || !tasksCompleted || !tasksPlanned || !blockers) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Automatically assign the report to the logged-in user
    const report = await Report.create({
      user: req.user.id,
      weekStartDate,
      weekEndDate,
      project,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked: hoursWorked || 0,
      notes: notes || '',
      status: status || 'Draft',
      // If status is submitted right away, log the time
      submittedAt: status === 'Submitted' ? Date.now() : undefined,
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Error in createReport:', error.message);
    res.status(500).json({ message: 'Server error creating report' });
  }
};

/**
 * @desc    Get reports belonging to the logged-in user
 * @route   GET /api/reports/my-reports
 * @access  Private (Team Member only)
 */
const getMyReports = async (req, res) => {
  try {
    // Fetch reports specifically for req.user.id
    // Populate project name for frontend display
    const reports = await Report.find({ user: req.user.id })
      .populate('project', 'name')
      .sort({ weekStartDate: -1 }); // Newest weeks first
    
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error in getMyReports:', error.message);
    res.status(500).json({ message: 'Server error fetching your reports' });
  }
};

/**
 * @desc    Get all reports across the team
 * @route   GET /api/reports
 * @access  Private (Manager only)
 */
const getAllReports = async (req, res) => {
  try {
    // Fetch all reports, populate the user info and project info
    const reports = await Report.find({})
      .populate('user', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 }); // Newest reports first

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error in getAllReports:', error.message);
    res.status(500).json({ message: 'Server error fetching all reports' });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
};
