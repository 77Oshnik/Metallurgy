const express = require('express');
const router = express.Router();
const { handlePostFabricationStage, handleGetFabricationStage } = require('../controllers/fabricationController');
const { fabricationValidationRules } = require('../utils/validationRules');

router.post('/:ProjectIdentifier', fabricationValidationRules(), handlePostFabricationStage);
router.get('/:ProjectIdentifier', handleGetFabricationStage);

module.exports = router;