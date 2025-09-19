const mongoose = require('mongoose');

const usePhaseStageSchema = new mongoose.Schema({
    ProjectIdentifier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    Inputs: {
        // Mandatory fields (always required from user)
        ProductLifetimeYears: {
            type: Number,
            required: true,
            min: [0.1, 'Product lifetime must be at least 0.1 years']
        },
        OperationalEnergyKilowattHoursPerYearPerFunctionalUnit: {
            type: Number,
            required: true,
            min: [0, 'Operational energy cannot be negative']
        },
        FailureRatePercent: {
            type: Number,
            required: true,
            min: [0, 'Failure rate cannot be negative'],
            max: [100, 'Failure rate cannot exceed 100%']
        },
        
        // Optional fields (can be AI-predicted if missing)
        MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: {
            type: Number,
            required: false,
            min: [0, 'Maintenance energy cannot be negative']
        },
        MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit: {
            type: Number,
            required: false,
            min: [0, 'Maintenance materials cannot be negative']
        },
        ReusePotentialPercent: {
            type: Number,
            required: false,
            min: [0, 'Reuse potential cannot be negative'],
            max: [100, 'Reuse potential cannot exceed 100%']
        }
    },
    
    DerivedHelperVariables: {
        FailureFraction: { type: Number },
        ReusePotentialFraction: { type: Number },
        EffectiveServiceLifetimeYearsPerFunctionalUnit: { type: Number },
        TotalOperationalEnergyKilowattHoursOverLifetimePerFunctionalUnit: { type: Number },
        TotalMaintenanceEnergyKilowattHoursOverLifetimePerFunctionalUnit: { type: Number },
        TotalMaintenanceMaterialsKilogramsOverLifetimePerFunctionalUnit: { type: Number }
    },
    
    Outputs: {
        LifetimeEfficiencyYearsPerFunctionalUnit: { type: Number },
        OperationalCarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitOverLifetime: { type: Number },
        MaintenanceCarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitOverLifetime: { type: Number },
        ReuseFactorPercent: { type: Number }
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
    collection: 'use_phase_stage'
});

// Static method to get field configuration
usePhaseStageSchema.statics.getFieldConfig = function() {
    return {
        mandatory: [
            'ProductLifetimeYears',
            'OperationalEnergyKilowattHoursPerYearPerFunctionalUnit',
            'FailureRatePercent'
        ],
        optional: [
            'MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit',
            'MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit',
            'ReusePotentialPercent'
        ],
        constraints: {
            ProductLifetimeYears: { min: 0.1, max: 100, type: 'number' },
            OperationalEnergyKilowattHoursPerYearPerFunctionalUnit: { min: 0, max: 100000, type: 'number' },
            FailureRatePercent: { min: 0, max: 100, type: 'number' },
            MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: { min: 0, max: 10000, type: 'number' },
            MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit: { min: 0, max: 1000, type: 'number' },
            ReusePotentialPercent: { min: 0, max: 100, type: 'number' }
        }
    };
};

module.exports = mongoose.model('UsePhaseStage', usePhaseStageSchema);