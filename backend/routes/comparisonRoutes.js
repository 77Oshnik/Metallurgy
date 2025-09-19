const express = require('express');
const router = express.Router();
const { handleComparisonRequest } = require('../controllers/comparisonController');

router.post('/projects/:projectId', handleComparisonRequest);

module.exports = router;
