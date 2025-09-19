const { body } = require("express-validator");

const miningValidationRules = () => {
  return [
    // Mandatory fields (always required)
    body("OreGradePercent")
      .isFloat({ gt: 0, lte: 100 })
      .withMessage(
        "OreGradePercent must be a number greater than 0 and less than or equal to 100"
      ),
    body("DieselUseLitersPerTonneOre")
      .isFloat({ min: 0 })
      .withMessage("DieselUseLitersPerTonneOre must be a non-negative number"),
    body("ElectricityUseKilowattHoursPerTonneOre")
      .isFloat({ min: 0 })
      .withMessage(
        "ElectricityUseKilowattHoursPerTonneOre must be a non-negative number"
      ),

    // Optional fields (can be AI-predicted if missing)
    body("ReagentsKilogramsPerTonneOre")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "ReagentsKilogramsPerTonneOre must be a non-negative number"
      ),
    body("WaterWithdrawalCubicMetersPerTonneOre")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "WaterWithdrawalCubicMetersPerTonneOre must be a non-negative number"
      ),
    body("TransportDistanceKilometersToConcentrator")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "TransportDistanceKilometersToConcentrator must be a non-negative number"
      ),
  ];
};

const concentrationValidationRules = () => {
  return [
    // Mandatory fields (always required)
    body("RecoveryYieldPercent")
      .isFloat({ gt: 0, lte: 100 })
      .withMessage(
        "RecoveryYieldPercent must be a number greater than 0 and less than or equal to 100"
      ),
    body("GrindingEnergyKilowattHoursPerTonneConcentrate")
      .isFloat({ min: 0 })
      .withMessage(
        "GrindingEnergyKilowattHoursPerTonneConcentrate must be a non-negative number"
      ),
    body("TailingsVolumeTonnesPerTonneConcentrate")
      .isFloat({ min: 0 })
      .withMessage(
        "TailingsVolumeTonnesPerTonneConcentrate must be a non-negative number"
      ),

    // Optional fields (can be AI-predicted if missing)
    body("ConcentrationReagentsKilogramsPerTonneConcentrate")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "ConcentrationReagentsKilogramsPerTonneConcentrate must be a non-negative number"
      ),
    body("ConcentrationWaterCubicMetersPerTonneConcentrate")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "ConcentrationWaterCubicMetersPerTonneConcentrate must be a non-negative number"
      ),
    body("WaterRecycleRatePercent")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("WaterRecycleRatePercent must be between 0 and 100"),
  ];
};

const smeltingValidationRules = () => {
  return [
    // Mandatory fields (always required)
    body("SmeltEnergyKilowattHoursPerTonneMetal")
      .isFloat({ min: 0 })
      .withMessage(
        "SmeltEnergyKilowattHoursPerTonneMetal must be a non-negative number"
      ),
    body("SmeltRecoveryPercent")
      .isFloat({ gt: 0, lte: 100 })
      .withMessage(
        "SmeltRecoveryPercent must be a number greater than 0 and less than or equal to 100"
      ),
    body("CokeUseKilogramsPerTonneMetal")
      .isFloat({ min: 0 })
      .withMessage(
        "CokeUseKilogramsPerTonneMetal must be a non-negative number"
      ),

    // Optional fields (can be AI-predicted if missing)
    body("FuelSharePercent")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("FuelSharePercent must be between 0 and 100"),
    body("FluxesKilogramsPerTonneMetal")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "FluxesKilogramsPerTonneMetal must be a non-negative number"
      ),
    body("EmissionControlEfficiencyPercent")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage(
        "EmissionControlEfficiencyPercent must be between 0 and 100"
      ),
  ];
};

const fabricationValidationRules = () => {
  return [
    // Mandatory fields (always required)
    body("FabricationEnergyKilowattHoursPerTonneProduct")
      .isFloat({ min: 0 })
      .withMessage(
        "FabricationEnergyKilowattHoursPerTonneProduct must be a non-negative number"
      ),
    body("ScrapInputPercent")
      .isFloat({ min: 0, max: 100 })
      .withMessage("ScrapInputPercent must be between 0 and 100"),
    body("YieldLossPercent")
      .isFloat({ min: 0, max: 100 })
      .withMessage("YieldLossPercent must be between 0 and 100"),

    // Optional fields (can be AI-predicted if missing)
    body("FabricationElectricityRenewableSharePercent")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage(
        "FabricationElectricityRenewableSharePercent must be between 0 and 100"
      ),
    body("AncillaryMaterialsKilogramsPerTonneProduct")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "AncillaryMaterialsKilogramsPerTonneProduct must be a non-negative number"
      ),
    body("FabricationWaterCubicMetersPerTonneProduct")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "FabricationWaterCubicMetersPerTonneProduct must be a non-negative number"
      ),
  ];
};

const usePhaseValidationRules = () => {
  return [
    // Mandatory fields (always required)
    body("ProductLifetimeYears")
      .isFloat({ gt: 0 })
      .withMessage("ProductLifetimeYears must be greater than 0"),
    body("OperationalEnergyKilowattHoursPerYearPerFunctionalUnit")
      .isFloat({ min: 0 })
      .withMessage(
        "OperationalEnergyKilowattHoursPerYearPerFunctionalUnit must be a non-negative number"
      ),
    body("FailureRatePercent")
      .isFloat({ min: 0, max: 100 })
      .withMessage("FailureRatePercent must be between 0 and 100"),

    // Optional fields (can be AI-predicted if missing)
    body("MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit must be a non-negative number"
      ),
    body("MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit must be a non-negative number"
      ),
    body("ReusePotentialPercent")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("ReusePotentialPercent must be between 0 and 100"),
  ];
};

const endOfLifeValidationRules = () => {
  return [
    // Mandatory fields (always required)
    body("CollectionRatePercent")
      .isFloat({ min: 0, max: 100 })
      .withMessage("CollectionRatePercent must be between 0 and 100"),
    body("RecyclingEfficiencyPercent")
      .isFloat({ min: 0, max: 100 })
      .withMessage("RecyclingEfficiencyPercent must be between 0 and 100"),
    body("RecyclingEnergyKilowattHoursPerTonneRecycled")
      .isFloat({ min: 0 })
      .withMessage(
        "RecyclingEnergyKilowattHoursPerTonneRecycled must be a non-negative number"
      ),

    // Optional fields (can be AI-predicted if missing)
    body("TransportDistanceKilometersToRecycler")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "TransportDistanceKilometersToRecycler must be a non-negative number"
      ),
    body("DowncyclingFractionPercent")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("DowncyclingFractionPercent must be between 0 and 100"),
    body("LandfillSharePercent")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("LandfillSharePercent must be between 0 and 100"),
  ];
};

module.exports = {
  miningValidationRules,
  concentrationValidationRules,
  smeltingValidationRules,
  fabricationValidationRules,
  usePhaseValidationRules,
  endOfLifeValidationRules,
};
