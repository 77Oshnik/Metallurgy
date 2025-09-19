const mongoose = require('mongoose');

const smeltingStageSchema = new mongoose.Schema({
    ProjectIdentifier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    Inputs: {
        // Mandatory fields (always required from user)
        SmeltEnergyKilowattHoursPerTonneMetal: {
            type: Number,
            required: true,
            min: [0, 'Smelt energy cannot be negative']
        },
        SmeltRecoveryPercent: { 
            type: Number, 
            required: true,
            min: [0, 'Smelt recovery cannot be negative'],
            max: [100, 'Smelt recovery cannot exceed 100%']
        },
        CokeUseKilogramsPerTonneMetal: {
            type: Number,
            required: true,
            min: [0, 'Coke use cannot be negative']
        },
        
        // Optional fields (can be AI-predicted if missing)
        FuelSharePercent: {
            type: Number,
            required: false,
            min: [0, 'Fuel share cannot be negative'],
            max: [100, 'Fuel share cannot exceed 100%']
        },
        FluxesKilogramsPerTonneMetal: {
            type: Number,
            required: false,
            min: [0, 'Fluxes cannot be negative']
        },
        EmissionControlEfficiencyPercent: {
            type: Number,
            required: false,
            min: [0, 'Emission control efficiency cannot be negative'],
            max: [100, 'Emission control efficiency cannot exceed 100%']
        }
    },
    
    DerivedHelperVariables: {
        SmeltRecoveryFraction: { type: Number },
        SmeltEnergyKilowattHoursPerFunctionalUnit: { type: Number },
        CokeUseKilogramsPerFunctionalUnit: { type: Number },
        FluxesKilogramsPerFunctionalUnit: { type: Number },
        EmissionControlFraction: { type: Number }
    },
    
    Outputs: {
        CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForSmelting: { type: Number },
        EnergyFootprintMegajoulesPerFunctionalUnitForSmelting: { type: Number },
        StageRecoveryFractionForSmelting: { type: Number },
        AirPollutantEmissionsKilogramsPerFunctionalUnitForSmelting: {
            SulfurDioxide: { type: Number },
            NitrogenOxides: { type: Number },
            ParticulateMatter: { type: Number }
        }
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
    collection: 'smelting_stage'
});

// Static method to get field configuration
smeltingStageSchema.statics.getFieldConfig = function() {
    return {
        mandatory: [
            'SmeltEnergyKilowattHoursPerTonneMetal',
            'SmeltRecoveryPercent',
            'CokeUseKilogramsPerTonneMetal'
        ],
        optional: [
            'FuelSharePercent',
            'FluxesKilogramsPerTonneMetal',
            'EmissionControlEfficiencyPercent'
        ],
        constraints: {
            SmeltEnergyKilowattHoursPerTonneMetal: { min: 0, max: 5000, type: 'number' },
            SmeltRecoveryPercent: { min: 0, max: 100, type: 'number' },
            CokeUseKilogramsPerTonneMetal: { min: 0, max: 2000, type: 'number' },
            FuelSharePercent: { min: 0, max: 100, type: 'number' },
            FluxesKilogramsPerTonneMetal: { min: 0, max: 500, type: 'number' },
            EmissionControlEfficiencyPercent: { min: 0, max: 100, type: 'number' }
        }
    };
};

module.exports = mongoose.model('SmeltingStage', smeltingStageSchema);