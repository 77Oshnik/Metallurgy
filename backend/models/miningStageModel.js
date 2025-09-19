const mongoose = require('mongoose');

const miningStageSchema = new mongoose.Schema({
    ProjectIdentifier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    Inputs: {
        // Mandatory fields (always required from user)
        OreGradePercent: { 
            type: Number, 
            required: true,
            min: [0.01, 'Ore grade must be at least 0.01%'],
            max: [100, 'Ore grade cannot exceed 100%']
        },
        DieselUseLitersPerTonneOre: { 
            type: Number, 
            required: true,
            min: [0, 'Diesel use cannot be negative']
        },
        ElectricityUseKilowattHoursPerTonneOre: { 
            type: Number, 
            required: true,
            min: [0, 'Electricity use cannot be negative']
        },
        
        // Optional fields (can be AI-predicted if missing)
        ReagentsKilogramsPerTonneOre: { 
            type: Number, 
            required: false,
            min: [0, 'Reagents use cannot be negative']
        },
        WaterWithdrawalCubicMetersPerTonneOre: { 
            type: Number, 
            required: false,
            min: [0, 'Water withdrawal cannot be negative']
        },
        TransportDistanceKilometersToConcentrator: { 
            type: Number, 
            required: false,
            min: [0, 'Transport distance cannot be negative']
        },
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
    },
    
    // AI Prediction Metadata
    PredictionMetadata: {
        predictedFields: {
            type: [String],
            default: []
        },
        predictionTimestamp: {
            type: Date
        },
        predictionModel: {
            type: String,
            default: 'gemini-pro'
        },
        predictionPrompt: {
            type: String
        },
        predictionReasoning: {
            type: String
        },
        predictionConfidence: {
            type: Object,
            default: {}
        }
    },
    
    // Field Sources Tracking
    FieldSources: {
        type: Map,
        of: String, // 'user' or 'ai-predicted'
        default: new Map()
    }
}, {
    timestamps: { createdAt: 'CreatedAtUtc', updatedAt: 'UpdatedAtUtc' },
    collection: 'mining_stage'
});

// Static method to get field configuration
miningStageSchema.statics.getFieldConfig = function() {
    return {
        mandatory: [
            'OreGradePercent',
            'DieselUseLitersPerTonneOre', 
            'ElectricityUseKilowattHoursPerTonneOre'
        ],
        optional: [
            'ReagentsKilogramsPerTonneOre',
            'WaterWithdrawalCubicMetersPerTonneOre',
            'TransportDistanceKilometersToConcentrator'
        ],
        constraints: {
            OreGradePercent: { min: 0.01, max: 100, type: 'number' },
            DieselUseLitersPerTonneOre: { min: 0, max: 1000, type: 'number' },
            ElectricityUseKilowattHoursPerTonneOre: { min: 0, max: 500, type: 'number' },
            ReagentsKilogramsPerTonneOre: { min: 0, max: 100, type: 'number' },
            WaterWithdrawalCubicMetersPerTonneOre: { min: 0, max: 50, type: 'number' },
            TransportDistanceKilometersToConcentrator: { min: 0, max: 1000, type: 'number' }
        }
    };
};

module.exports = mongoose.model('MiningStage', miningStageSchema);
