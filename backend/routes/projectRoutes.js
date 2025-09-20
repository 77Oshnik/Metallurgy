const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, getProject, deleteProject } = require('../controllers/projectController');

// POST /api/projects - Create a new project
router.post('/', createProject);

// GET /api/projects - Get all projects
router.get('/', getAllProjects);

// GET /api/projects/:projectId - Get a specific project
router.get('/:projectId', getProject);

// DELETE /api/projects/:projectId - Delete a project (for testing)
router.delete('/:projectId', deleteProject);

module.exports = router;
