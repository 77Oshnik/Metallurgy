const mongoose = require('mongoose');

const suggestedApplicationSchema = new mongoose.Schema({
  ApplicationName: {
    type: String,
    required: true
  },
  TechnicalDescription: {
    type: String,
    required: true
  },
  ExpectedSubstitutionRateTonnesPerTonneByproduct: {
    type: Number,
    required: true,
    min: 0
  },
  AvoidedEmissionsKilogramsCarbonDioxideEquivalentPerTonneByproduct: {
    type: Number,
    required: true,
    min: 0
  },
  AvoidedLandfillCubicMetersPerTonneByproduct: {
    type: Number,
    required: true,
    min: 0
  },
  EstimatedMarketValueUsdPerTonne: {
    low: { type: Number, required: true, min: 0 },
    median: { type: Number, required: true, min: 0 },
    high: { type: Number, required: true, min: 0 }
  },
  EstimatedProcessingCapexUsdPerTonne: {
    low: { type: Number, min: 0 },
    median: { type: Number, min: 0 },
    high: { type: Number, min: 0 }
  },
  EstimatedProcessingOpexUsdPerTonne: {
    low: { type: Number, required: true, min: 0 },
    median: { type: Number, required: true, min: 0 },
    high: { type: Number, required: true, min: 0 }
  },
  ImplementationTimeframeMonths: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 }
  },
  TechnicalFeasibilityRating: {
    type: String,
    required: true,
    enum: ['ProvenCommercial', 'DemonstrationScale', 'Pilot', 'Research']
  },
  TypicalQualityRequirements: {
    moisturePercent: { type: Number, min: 0, max: 100 },
    particleSizeMm: { type: Number, min: 0 },
    heavyMetalThresholdsPpm: { type: Number, min: 0 },
    pHRange: {
      min: { type: Number, min: 0, max: 14 },
      max: { type: Number, min: 0, max: 14 }
    },
    other: { type: String }
  },
  RegulatoryNotes: {
    type: String,
    required: true
  },
  ConfidenceScorePercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  EvidenceAndReferences: [{
    type: String
  }]
}, { _id: false });

const scenarioAggregateBenefitsSchema = new mongoose.Schema({
  TotalAvoidedEmissionsKilogramsCO2e: {
    type: Number,
    required: true,
    min: 0
  },
  TotalAvoidedLandfillCubicMeters: {
    type: Number,
    required: true,
    min: 0
  },
  TotalPotentialRevenueUsd: {
    low: { type: Number, required: true, min: 0 },
    median: { type: Number, required: true, min: 0 },
    high: { type: Number, required: true, min: 0 }
  },
  EstimatedNetBenefitUsd: {
    low: { type: Number, required: true },
    median: { type: Number, required: true },
    high: { type: Number, required: true }
  }
}, { _id: false });

const provenanceSchema = new mongoose.Schema({
  ModelName: {
    type: String,
    required: true,
    default: 'gemini-2.0-flash'
  },
  PromptVersion: {
    type: String,
    required: true
  },
  GeneratedAtUtc: {
    type: Date,
    required: true,
    default: Date.now
  },
  RawAITableOutput: {
    type: String,
    required: true
  }
}, { _id: false });

const geminiAnalysisSchema = new mongoose.Schema({
  ByproductName: {
    type: String,
    required: true
  },
  MassTonnesPerFunctionalUnit: {
    type: Number,
    required: true,
    min: 0
  },
  SuggestedApplications: [suggestedApplicationSchema],
  OverallRecommendationSummary: {
    type: String,
    required: true
  },
  ScenarioAggregateBenefits: scenarioAggregateBenefitsSchema,
  Provenance: provenanceSchema
}, { _id: false });

const valorizationScenarioSchema = new mongoose.Schema({
  ProjectIdentifier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  StageName: {
    type: String,
    required: true,
    enum: ['Mining', 'Concentration', 'Smelting and Refining', 'Fabrication', 'Use Phase', 'End of Life']
  },
  ByproductName: {
    type: String,
    required: true
  },
  MassTonnesPerFunctionalUnit: {
    type: Number,
    required: true,
    min: 0
  },
  GeminiAnalysis: geminiAnalysisSchema,
  FieldSources: {
    type: Map,
    of: String, // 'user' or 'ai-predicted'
    default: new Map()
  },
  ComputationMetadata: {
    PromptVersion: {
      type: String,
      required: true
    },
    ModelName: {
      type: String,
      required: true,
      default: 'gemini-2.0-flash'
    },
    GeneratedAtUtc: {
      type: Date,
      required: true,
      default: Date.now
    },
    ApiLatencyMs: {
      type: Number,
      min: 0
    }
  }
}, {
  timestamps: { createdAt: 'CreatedAtUtc', updatedAt: 'UpdatedAtUtc' },
  collection: 'valorization_scenarios'
});

// Compound index for efficient querying
valorizationScenarioSchema.index({ ProjectIdentifier: 1, StageName: 1, ByproductName: 1 }, { unique: true });

// Static method to get supported byproducts by stage
valorizationScenarioSchema.statics.getSupportedByproducts = function() {
  return {
    'Mining': [
      'Overburden', 
      'Waste Rock', 
      'Mine Water', 
      'Dust Emissions'
    ],
    'Concentration': [
      'Tailings', 
      'Process Water', 
      'Flotation Reagent Residues',
      'Concentrate Dust'
    ],
    'Smelting and Refining': [
      'Slag', 
      'Spent Refractories', 
      'Flue Gas', 
      'Smelter Dust',
      'Acid Plant Residues',
      'Spent Electrolyte'
    ],
    'Fabrication': [
      'Metal Scrap', 
      'Cutting Fluids', 
      'Grinding Sludge',
      'Surface Treatment Residues'
    ],
    'Use Phase': [
      'Wear Particles', 
      'Maintenance Waste', 
      'Replacement Parts'
    ],
    'End of Life': [
      'Recycled Metal', 
      'Shredder Residue', 
      'Separation Residues',
      'Downcycled Materials'
    ]
  };
};

// Static method to get byproduct properties mapping
valorizationScenarioSchema.statics.getByproductProperties = function() {
  return {
    'Slag': {
      typicalComposition: ['Fe', 'Si', 'Ca', 'Al', 'Mg'],
      moistureRange: [0, 5],
      densityKgM3: [2200, 3500]
    },
    'Tailings': {
      typicalComposition: ['Si', 'Al', 'Fe', 'S', 'traces'],
      moistureRange: [10, 30],
      densityKgM3: [1400, 2000]
    },
    'Waste Rock': {
      typicalComposition: ['Si', 'Al', 'Fe', 'carbonates'],
      moistureRange: [2, 15],
      densityKgM3: [2000, 2800]
    },
    'Metal Scrap': {
      typicalComposition: ['primary metal', 'alloy elements'],
      moistureRange: [0, 2],
      densityKgM3: [2700, 8900]
    }
  };
};

module.exports = mongoose.model('ValorizationScenario', valorizationScenarioSchema);