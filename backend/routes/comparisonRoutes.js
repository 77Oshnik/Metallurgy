const express = require('express');
const router = express.Router();
const { handleComparisonRequest, getComparison } = require('../controllers/comparisonController');

router.post('/projects/:projectId', handleComparisonRequest);

// Delegate GET to controller
router.get('/projects/:projectId', getComparison);


module.exports = router;
