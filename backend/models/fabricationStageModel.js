const mongoose = require('mongoose');

const fabricationStageSchema = new mongoose.Schema({
    ProjectIdentifier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    Inputs: {
        // Mandatory fields (always required from user)
        FabricationEnergyKilowattHoursPerTonneProduct: {
            type: Number,
            required: true,
            min: [0, 'Fabrication energy cannot be negative']
        },
        ScrapInputPercent: {
            type: Number,
            required: true,
            min: [0, 'Scrap input cannot be negative'],
            max: [100, 'Scrap input cannot exceed 100%']
        },
        YieldLossPercent: {
            type: Number,
            required: true,
            min: [0, 'Yield loss cannot be negative'],
            max: [100, 'Yield loss cannot exceed 100%']
        },
        
        // Optional fields (can be AI-predicted if missing)
        FabricationElectricityRenewableSharePercent: {
            type: Number,
            required: false,
            min: [0, 'Renewable share cannot be negative'],
            max: [100, 'Renewable share cannot exceed 100%']
        },
        AncillaryMaterialsKilogramsPerTonneProduct: {
            type: Number,
            required: false,
            min: [0, 'Ancillary materials cannot be negative']
        },
        FabricationWaterCubicMetersPerTonneProduct: {
            type: Number,
            required: false,
            min: [0, 'Fabrication water cannot be negative']
        }
    },
    
    DerivedHelperVariables: {
        FabricationEnergyKilowattHoursPerFunctionalUnit: { type: Number },
        FabricationElectricityNonRenewableShareFraction: { type: Number },
        AncillaryMaterialsKilogramsPerFunctionalUnit: { type: Number },
        FabricationWaterCubicMetersPerFunctionalUnit: { type: Number },
        ScrapInputFraction: { type: Number },
        YieldEfficiencyFraction: { type: Number }
    },
    
    Outputs: {
        CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForFabrication: { type: Number },
        EnergyFootprintMegajoulesPerFunctionalUnitForFabrication: { type: Number },
        RecycledContentPercent: { type: Number },
        WaterFootprintCubicMetersPerFunctionalUnitForFabrication: { type: Number },
        YieldEfficiencyPercent: { type: Number }
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
    collection: 'fabrication_stage'
});

// Static method to get field configuration
fabricationStageSchema.statics.getFieldConfig = function() {
    return {
        mandatory: [
            'FabricationEnergyKilowattHoursPerTonneProduct',
            'ScrapInputPercent',
            'YieldLossPercent'
        ],
        optional: [
            'FabricationElectricityRenewableSharePercent',
            'AncillaryMaterialsKilogramsPerTonneProduct',
            'FabricationWaterCubicMetersPerTonneProduct'
        ],
        constraints: {
            FabricationEnergyKilowattHoursPerTonneProduct: { min: 0, max: 10000, type: 'number' },
            ScrapInputPercent: { min: 0, max: 100, type: 'number' },
            YieldLossPercent: { min: 0, max: 100, type: 'number' },
            FabricationElectricityRenewableSharePercent: { min: 0, max: 100, type: 'number' },
            AncillaryMaterialsKilogramsPerTonneProduct: { min: 0, max: 1000, type: 'number' },
            FabricationWaterCubicMetersPerTonneProduct: { min: 0, max: 100, type: 'number' }
        }
    };
};

module.exports = mongoose.model('FabricationStage', fabricationStageSchema);