// Threshold definitions for harmful effects analysis
const thresholds = {
  // Mining Stage Thresholds
  OreGradePercent: {
    medium: 2.0,
    high: 1.0,
    veryHigh: 0.5
  },
  DieselUseLitersPerTonneOre: {
    medium: 15.0,
    high: 25.0,
    veryHigh: 40.0
  },
  ElectricityUseKilowattHoursPerTonneOre: {
    medium: 50.0,
    high: 100.0,
    veryHigh: 200.0
  },
  ReagentsKilogramsPerTonneOre: {
    medium: 10.0,
    high: 25.0,
    veryHigh: 50.0
  },
  WaterWithdrawalCubicMetersPerTonneOre: {
    medium: 5.0,
    high: 15.0,
    veryHigh: 30.0
  },

  // Concentration Stage Thresholds
  RecoveryYieldPercent: {
    medium: 80.0,
    high: 85.0,
    veryHigh: 90.0
  },
  GrindingEnergyKilowattHoursPerTonneConcentrate: {
    medium: 30.0,
    high: 50.0,
    veryHigh: 80.0
  },
  TailingsVolumeTonnesPerTonneConcentrate: {
    medium: 0.5,
    high: 1.0,
    veryHigh: 2.0
  },
  ConcentrationReagentsKilogramsPerTonneConcentrate: {
    medium: 20.0,
    high: 40.0,
    veryHigh: 70.0
  },
  ConcentrationWaterCubicMetersPerTonneConcentrate: {
    medium: 8.0,
    high: 15.0,
    veryHigh: 25.0
  },

  // Smelting Stage Thresholds
  SmeltEnergyKilowattHoursPerTonneMetal: {
    medium: 800.0,
    high: 1200.0,
    veryHigh: 2000.0
  },
  SmeltRecoveryPercent: {
    medium: 90.0,
    high: 95.0,
    veryHigh: 98.0
  },
  CokeUseKilogramsPerTonneMetal: {
    medium: 300.0,
    high: 500.0,
    veryHigh: 800.0
  },
  FuelSharePercent: {
    medium: 60.0,
    high: 80.0,
    veryHigh: 95.0
  },
  FluxesKilogramsPerTonneMetal: {
    medium: 100.0,
    high: 200.0,
    veryHigh: 400.0
  },
  EmissionControlEfficiencyPercent: {
    medium: 80.0,
    high: 90.0,
    veryHigh: 95.0
  },

  // Fabrication Stage Thresholds
  FabricationEnergyKilowattHoursPerTonneProduct: {
    medium: 2000.0,
    high: 3500.0,
    veryHigh: 5000.0
  },
  ScrapInputPercent: {
    medium: 30.0,
    high: 50.0,
    veryHigh: 70.0
  },
  YieldLossPercent: {
    medium: 5.0,
    high: 10.0,
    veryHigh: 20.0
  },
  FabricationElectricityRenewableSharePercent: {
    medium: 40.0,
    high: 60.0,
    veryHigh: 80.0
  },
  AncillaryMaterialsKilogramsPerTonneProduct: {
    medium: 50.0,
    high: 100.0,
    veryHigh: 200.0
  },

  // Use Phase Stage Thresholds
  ProductLifetimeYears: {
    medium: 10.0,
    high: 5.0,
    veryHigh: 2.0
  },
  OperationalEnergyKilowattHoursPerYearPerFunctionalUnit: {
    medium: 1000.0,
    high: 2500.0,
    veryHigh: 5000.0
  },
  FailureRatePercent: {
    medium: 2.0,
    high: 5.0,
    veryHigh: 10.0
  },
  MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: {
    medium: 200.0,
    high: 500.0,
    veryHigh: 1000.0
  },

  // End of Life Stage Thresholds
  CollectionRatePercent: {
    medium: 70.0,
    high: 50.0,
    veryHigh: 30.0
  },
  RecyclingEfficiencyPercent: {
    medium: 80.0,
    high: 60.0,
    veryHigh: 40.0
  },
  RecyclingEnergyKilowattHoursPerTonneRecycled: {
    medium: 1000.0,
    high: 2000.0,
    veryHigh: 4000.0
  },
  TransportDistanceKilometersToRecycler: {
    medium: 200.0,
    high: 500.0,
    veryHigh: 1000.0
  },
  DowncyclingFractionPercent: {
    medium: 30.0,
    high: 50.0,
    veryHigh: 70.0
  },
  LandfillSharePercent: {
    medium: 20.0,
    high: 40.0,
    veryHigh: 60.0
  }
};

/**
 * Classify a value against its thresholds
 * @param {string} fieldName - Name of the field
 * @param {number} value - Value to classify
 * @returns {string} - Classification: 'Very High', 'High', 'Medium', 'Safe'
 */
function classifyValue(fieldName, value) {
  const fieldThresholds = thresholds[fieldName];
  
  if (!fieldThresholds) {
    return 'Safe'; // Default if no thresholds defined
  }
  
  // Handle inverse thresholds (lower is better)
  const inverseFields = [
    'OreGradePercent',
    'RecoveryYieldPercent',
    'SmeltRecoveryPercent',
    'ScrapInputPercent',
    'CollectionRatePercent',
    'RecyclingEfficiencyPercent',
    'FabricationElectricityRenewableSharePercent'
  ];
  
  if (inverseFields.includes(fieldName)) {
    // For inverse fields, lower values are worse
    if (value <= fieldThresholds.veryHigh) return 'Very High';
    if (value <= fieldThresholds.high) return 'High';
    if (value <= fieldThresholds.medium) return 'Medium';
    return 'Safe';
  } else {
    // For normal fields, higher values are worse
    if (value >= fieldThresholds.veryHigh) return 'Very High';
    if (value >= fieldThresholds.high) return 'High';
    if (value >= fieldThresholds.medium) return 'Medium';
    return 'Safe';
  }
}

module.exports = {
  thresholds,
  classifyValue
};