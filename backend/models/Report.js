const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
    },
    weekEndDate: {
      type: Date,
      required: [true, 'Week end date is required'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    tasksCompleted: {
      type: String,
      required: [true, 'Completed tasks description is required'],
    },
    tasksPlanned: {
      type: String,
      required: [true, 'Planned tasks description is required'],
    },
    blockers: {
      type: String,
      required: [true, 'Blockers description is required. Use "None" if no blockers.'],
    },
    hoursWorked: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Late'],
      default: 'Draft',
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Report', reportSchema);
