const express = require('express');
const router = express.Router();
const { handlePostMiningStage, handleGetMiningStage } = require('../controllers/miningController');
const { miningValidationRules } = require('../utils/validationRules');

router.post('/:ProjectIdentifier', miningValidationRules(), handlePostMiningStage);
router.get('/:ProjectIdentifier', handleGetMiningStage);

module.exports = router;
