const mongoose = require('mongoose');

const harmfulEffectScenarioSchema = new mongoose.Schema({
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
  InputsAnalyzed: {
    type: Map,
    of: Number
  },
  OutputsAnalyzed: {
    type: Map,
    of: Number
  },
  ThresholdResults: {
    type: Map,
    of: {
      type: String,
      enum: ['Very High', 'High', 'Medium', 'Safe']
    }
  },
  GeminiAnalysis: [{
    Field: {
      type: String,
      required: true
    },
    Severity: {
      type: String,
      required: true,
      enum: ['Very High', 'High', 'Medium', 'Safe']
    },
    HarmfulEffects: [{
      type: String
    }],
    Remedies: [{
      type: String
    }],
    Benefits: [{
      type: String
    }]
  }],
  CreatedAtUtc: {
    type: Date,
    default: Date.now
  },
  UpdatedAtUtc: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HarmfulEffectScenario', harmfulEffectScenarioSchema);