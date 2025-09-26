const mongoose = require('mongoose');

const energyTransitionScenarioSchema = new mongoose.Schema({
  ProjectIdentifier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  StageName: {
    type: String,
    required: true
  },
  BaselineElectricityConsumptionKilowattHoursPerFunctionalUnit: {
    type: Number,
    required: true
  },
  BaselineFuelSharePercent: {
    type: Number,
    required: true
  },
  UserScenario: {
    RenewableSharePercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    FossilSharePercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    EnergySourceMix: {
      grid: { type: Number, default: 0 },
      solar: { type: Number, default: 0 },
      wind: { type: Number, default: 0 },
      hydro: { type: Number, default: 0 },
      geothermal: { type: Number, default: 0 },
      biomass: { type: Number, default: 0 }
    }
  },
  Outputs: {
    BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit: {
      type: Number,
      required: true
    },
    ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit: {
      type: Number,
      required: true
    },
    CarbonReductionPercent: {
      type: Number,
      required: true
    }
  },
  CreatedAtUtc: {
    type: Date,
    default: Date.now
  },
  UpdatedAtUtc: {
    type: Date,
    default: Date.now
  }
});

// Ensure renewable and fossil shares add up to 100
energyTransitionScenarioSchema.pre('save', function(next) {
  if (this.UserScenario.RenewableSharePercent + this.UserScenario.FossilSharePercent !== 100) {
    return next(new Error('RenewableSharePercent and FossilSharePercent must add up to 100'));
  }
  next();
});

module.exports = mongoose.model('EnergyTransitionScenario', energyTransitionScenarioSchema);