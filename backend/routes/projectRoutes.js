const express = require('express');
const router = express.Router();
const { createProject, getProject } = require('../controllers/projectController');

// POST /api/projects - Create a new project
router.post('/', createProject);

// GET /api/projects/:projectId - Get a specific project
router.get('/:projectId', getProject);

module.exports = router;
