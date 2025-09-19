const express = require('express');
const router = express.Router();
const { createProject } = require('../controllers/projectController');

router.post('/create', createProject);

module.exports = router;
