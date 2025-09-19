const { body } = require('express-validator');

const miningValidationRules = () => {
    return [
        body('OreGradePercent')
            .isFloat({ gt: 0, lte: 100 })
            .withMessage('OreGradePercent must be a number greater than 0 and less than or equal to 100'),
        body('DieselUseLitersPerTonneOre')
            .isFloat({ min: 0 })
            .withMessage('DieselUseLitersPerTonneOre must be a non-negative number'),
        body('ElectricityUseKilowattHoursPerTonneOre')
            .isFloat({ min: 0 })
            .withMessage('ElectricityUseKilowattHoursPerTonneOre must be a non-negative number'),
        body('ReagentsKilogramsPerTonneOre')
            .isFloat({ min: 0 })
            .withMessage('ReagentsKilogramsPerTonneOre must be a non-negative number'),
        body('WaterWithdrawalCubicMetersPerTonneOre')
            .isFloat({ min: 0 })
            .withMessage('WaterWithdrawalCubicMetersPerTonneOre must be a non-negative number'),
        body('TransportDistanceKilometersToConcentrator')
            .isFloat({ min: 0 })
            .withMessage('TransportDistanceKilometersToConcentrator must be a non-negative number'),
    ];
};

module.exports = {
    miningValidationRules,
};
