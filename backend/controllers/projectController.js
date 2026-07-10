const Project = require('../models/Project');

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Private (Authenticated users)
 */
const getProjects = async (req, res) => {
  try {
    // Fetch all projects, sorting by newest first
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error in getProjects:', error.message);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Manager only)
 */
const createProject = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    // Check for duplicates
    const projectExists = await Project.findOne({ name });
    if (projectExists) {
      return res.status(400).json({ message: 'Project already exists' });
    }

    const project = await Project.create({ name });
    res.status(201).json(project);
  } catch (error) {
    console.error('Error in createProject:', error.message);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private (Manager only)
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();
    res.status(200).json({ message: 'Project removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: Could not delete project' });
  }
};

module.exports = {
  getProjects,
  createProject,
  deleteProject,
};
