const mongoose = require('mongoose');

const miningStageSchema = new mongoose.Schema({
    ProjectIdentifier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    Inputs: {
        OreGradePercent: { type: Number, required: true },
        DieselUseLitersPerTonneOre: { type: Number, required: true },
        ElectricityUseKilowattHoursPerTonneOre: { type: Number, required: true },
        ReagentsKilogramsPerTonneOre: { type: Number, required: true },
        WaterWithdrawalCubicMetersPerTonneOre: { type: Number, required: true },
        TransportDistanceKilometersToConcentrator: { type: Number, required: true },
    },
    DerivedHelperVariables: {
        OreGradeFraction: { type: Number },
        OreRequiredTonnesPerFunctionalUnit: { type: Number },
        DieselUseLitersPerFunctionalUnit: { type: Number },
        ElectricityUseKilowattHoursPerFunctionalUnit: { type: Number },
        ReagentsKilogramsPerFunctionalUnit: { type: Number },
        WaterWithdrawalCubicMetersPerFunctionalUnit: { type: Number },
        TransportTonnesKilometersPerFunctionalUnit: { type: Number },
    },
    Outputs: {
        CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForMining: { type: Number },
        EnergyFootprintMegajoulesPerFunctionalUnitForMining: { type: Number },
        WaterFootprintCubicMetersPerFunctionalUnitForMining: { type: Number },
        AirPollutantEmissionsKilogramsPerFunctionalUnitForMining: {
            SulfurDioxide: { type: Number },
            NitrogenOxides: { type: Number },
            ParticulateMatter: { type: Number },
        },
        OreRequiredTonnesPerFunctionalUnit: { type: Number },
    },
    ComputationMetadata: {
        type: Object
    }
}, {
    timestamps: { createdAt: 'CreatedAtUtc', updatedAt: 'UpdatedAtUtc' },
    collection: 'mining_stage'
});

module.exports = mongoose.model('MiningStage', miningStageSchema);
