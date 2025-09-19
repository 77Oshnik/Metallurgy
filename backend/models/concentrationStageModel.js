const mongoose = require('mongoose');

const concentrationStageSchema = new mongoose.Schema({
    ProjectIdentifier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    Inputs: {
        // Mandatory fields (always required from user)
        RecoveryYieldPercent: { 
            type: Number, 
            required: true,
            min: [0, 'Recovery yield cannot be negative'],
            max: [100, 'Recovery yield cannot exceed 100%']
        },
        GrindingEnergyKilowattHoursPerTonneConcentrate: {
            type: Number,
            required: true,
            min: [0, 'Grinding energy cannot be negative']
        },
        TailingsVolumeTonnesPerTonneConcentrate: {
            type: Number,
            required: true,
            min: [0, 'Tailings volume cannot be negative']
        },
        
        // Optional fields (can be AI-predicted if missing)
        ConcentrationReagentsKilogramsPerTonneConcentrate: {
            type: Number,
            required: false,
            min: [0, 'Concentration reagents cannot be negative']
        },
        ConcentrationWaterCubicMetersPerTonneConcentrate: {
            type: Number,
            required: false,
            min: [0, 'Concentration water cannot be negative']
        },
        WaterRecycleRatePercent: {
            type: Number,
            required: false,
            min: [0, 'Water recycle rate cannot be negative'],
            max: [100, 'Water recycle rate cannot exceed 100%']
        }
    },
    
    DerivedHelperVariables: {
        RecoveryFractionFromConcentration: { type: Number },
        ConcentrateMassTonnesPerFunctionalUnit: { type: Number },
        GrindingEnergyKilowattHoursPerFunctionalUnit: { type: Number },
        ConcentrationReagentsKilogramsPerFunctionalUnit: { type: Number },
        ConcentrationWaterCubicMetersPerFunctionalUnitNet: { type: Number },
        TailingsMassTonnesPerFunctionalUnit: { type: Number }
    },
    
    Outputs: {
        CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForConcentration: { type: Number },
        EnergyFootprintMegajoulesPerFunctionalUnitForConcentration: { type: Number },
        WaterFootprintCubicMetersPerFunctionalUnitForConcentration: { type: Number },
        TailingsMassTonnesPerFunctionalUnit: { type: Number },
        StageRecoveryFractionFromOreToConcentrate: { type: Number }
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
    collection: 'concentration_stage'
});

// Static method to get field configuration
concentrationStageSchema.statics.getFieldConfig = function() {
    return {
        mandatory: [
            'RecoveryYieldPercent',
            'GrindingEnergyKilowattHoursPerTonneConcentrate',
            'TailingsVolumeTonnesPerTonneConcentrate'
        ],
        optional: [
            'ConcentrationReagentsKilogramsPerTonneConcentrate',
            'ConcentrationWaterCubicMetersPerTonneConcentrate',
            'WaterRecycleRatePercent'
        ],
        constraints: {
            RecoveryYieldPercent: { min: 0, max: 100, type: 'number' },
            GrindingEnergyKilowattHoursPerTonneConcentrate: { min: 0, max: 2000, type: 'number' },
            TailingsVolumeTonnesPerTonneConcentrate: { min: 0, max: 100, type: 'number' },
            ConcentrationReagentsKilogramsPerTonneConcentrate: { min: 0, max: 200, type: 'number' },
            ConcentrationWaterCubicMetersPerTonneConcentrate: { min: 0, max: 100, type: 'number' },
            WaterRecycleRatePercent: { min: 0, max: 100, type: 'number' }
        }
    };
};

module.exports = mongoose.model('ConcentrationStage', concentrationStageSchema);