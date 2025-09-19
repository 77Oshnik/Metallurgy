const express = require('express');
const router = express.Router();
const { handlePostSmeltingStage, handleGetSmeltingStage } = require('../controllers/smeltingController');
const { smeltingValidationRules } = require('../utils/validationRules');

router.post('/:ProjectIdentifier', smeltingValidationRules(), handlePostSmeltingStage);
router.get('/:ProjectIdentifier', handleGetSmeltingStage);

module.exports = router;