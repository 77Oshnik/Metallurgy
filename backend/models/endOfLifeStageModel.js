const mongoose = require('mongoose');

const endOfLifeStageSchema = new mongoose.Schema({
    ProjectIdentifier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    Inputs: {
        // Mandatory fields (always required from user)
        CollectionRatePercent: {
            type: Number,
            required: true,
            min: [0, 'Collection rate cannot be negative'],
            max: [100, 'Collection rate cannot exceed 100%']
        },
        RecyclingEfficiencyPercent: {
            type: Number,
            required: true,
            min: [0, 'Recycling efficiency cannot be negative'],
            max: [100, 'Recycling efficiency cannot exceed 100%']
        },
        RecyclingEnergyKilowattHoursPerTonneRecycled: {
            type: Number,
            required: true,
            min: [0, 'Recycling energy cannot be negative']
        },
        
        // Optional fields (can be AI-predicted if missing)
        TransportDistanceKilometersToRecycler: {
            type: Number,
            required: false,
            min: [0, 'Transport distance cannot be negative']
        },
        DowncyclingFractionPercent: {
            type: Number,
            required: false,
            min: [0, 'Downcycling fraction cannot be negative'],
            max: [100, 'Downcycling fraction cannot exceed 100%']
        },
        LandfillSharePercent: {
            type: Number,
            required: false,
            min: [0, 'Landfill share cannot be negative'],
            max: [100, 'Landfill share cannot exceed 100%']
        }
    },
    
    DerivedHelperVariables: {
        CollectionFraction: { type: Number },
        RecyclingEfficiencyFraction: { type: Number },
        DowncyclingFraction: { type: Number },
        LandfillFraction: { type: Number },
        RecoveredMassTonnesPerFunctionalUnit: { type: Number },
        DowncycledMassTonnesPerFunctionalUnit: { type: Number },
        LandfilledMassTonnesPerFunctionalUnit: { type: Number },
        TransportTonnesKilometersPerFunctionalUnitToRecycler: { type: Number },
        RecyclingEnergyKilowattHoursPerFunctionalUnit: { type: Number }
    },
    
    Outputs: {
        EndOfLifeRecyclingRatePercent: { type: Number },
        RecycledMassTonnesPerFunctionalUnit: { type: Number },
        LandfilledMassTonnesPerFunctionalUnit: { type: Number },
        CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForEndOfLife: { type: Number },
        ScrapUtilizationFraction: { type: Number }
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
    collection: 'end_of_life_stage'
});

// Static method to get field configuration
endOfLifeStageSchema.statics.getFieldConfig = function() {
    return {
        mandatory: [
            'CollectionRatePercent',
            'RecyclingEfficiencyPercent',
            'RecyclingEnergyKilowattHoursPerTonneRecycled'
        ],
        optional: [
            'TransportDistanceKilometersToRecycler',
            'DowncyclingFractionPercent',
            'LandfillSharePercent'
        ],
        constraints: {
            CollectionRatePercent: { min: 0, max: 100, type: 'number' },
            RecyclingEfficiencyPercent: { min: 0, max: 100, type: 'number' },
            RecyclingEnergyKilowattHoursPerTonneRecycled: { min: 0, max: 5000, type: 'number' },
            TransportDistanceKilometersToRecycler: { min: 0, max: 2000, type: 'number' },
            DowncyclingFractionPercent: { min: 0, max: 100, type: 'number' },
            LandfillSharePercent: { min: 0, max: 100, type: 'number' }
        }
    };
};

module.exports = mongoose.model('EndOfLifeStage', endOfLifeStageSchema);