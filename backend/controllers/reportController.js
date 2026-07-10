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

/**
 * @desc    Update a report
 * @route   PUT /api/reports/:id
 * @access  Private (Team Member only)
 */
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Verify ownership
    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this report' });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedReport);
  } catch (error) {
    console.error('Error in updateReport:', error.message);
    res.status(500).json({ message: 'Server error updating report' });
  }
};

/**
 * @desc    Delete a report
 * @route   DELETE /api/reports/:id
 * @access  Private (Team Member only)
 */
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Verify ownership
    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this report' });
    }

    await report.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReport:', error.message);
    res.status(500).json({ message: 'Server error deleting report' });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  updateReport,
  deleteReport,
};
