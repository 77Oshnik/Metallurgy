// src/utils/emissionFactorStore.js

const emissionFactorStore = {
  // 🔹 Energy-related emission factors
  EmissionFactorDieselKilogramCarbonDioxideEquivalentPerLiter: 2.68, // kg CO2e per liter diesel
  EmissionFactorElectricityKilogramCarbonDioxideEquivalentPerKilowattHour: 0.45, // kg CO2e per kWh (grid average)
  EmissionFactorElectricityEnergyMegajoulePerKilowattHour: 3.6, // MJ per kWh
  EmissionFactorDieselEnergyMegajoulePerLiter: 38.6, // MJ per liter diesel

  // 🔹 Material-related emission factors
  EmissionFactorReagentKilogramCarbonDioxideEquivalentPerKilogram: 1.5, // kg CO2e per kg reagent (placeholder)
  EmissionFactorFluxKilogramCarbonDioxideEquivalentPerKilogram: 0.8, // example for smelting fluxes
  EmissionFactorAncillaryMaterialKilogramCarbonDioxideEquivalentPerKilogram: 2.0, // for fabrication

  // 🔹 Transport-related emission factors
  EmissionFactorTransportKilogramCarbonDioxideEquivalentPerTonneKilometer: 0.1, // kg CO2e per t·km

  // 🔹 Air pollutant emission factors (example placeholder values)
  PollutantEmissionFactorDieselSulfurDioxideKilogramsPerLiter: 0.002,
  PollutantEmissionFactorDieselNitrogenOxidesKilogramsPerLiter: 0.004,
  PollutantEmissionFactorDieselParticulateMatterKilogramsPerLiter: 0.0005,

  PollutantEmissionFactorElectricitySulfurDioxideKilogramsPerKilowattHour: 0.001,
  PollutantEmissionFactorElectricityNitrogenOxidesKilogramsPerKilowattHour: 0.002,
  PollutantEmissionFactorElectricityParticulateMatterKilogramsPerKilowattHour: 0.0003,

  // 🔹 Pollutant factors for reagents (placeholders)
  PollutantEmissionFactorReagentSulfurDioxideKilogramsPerKilogram: 0.0001,
  PollutantEmissionFactorReagentNitrogenOxidesKilogramsPerKilogram: 0.0002,
  PollutantEmissionFactorReagentParticulateMatterKilogramsPerKilogram: 0.00005,

  // 🔹 Pollutant factors for transport (placeholders)
  PollutantEmissionFactorTransportSulfurDioxideKilogramsPerTonneKilometer: 0.0001,
  PollutantEmissionFactorTransportNitrogenOxidesKilogramsPerTonneKilometer: 0.0005,
  PollutantEmissionFactorTransportParticulateMatterKilogramsPerTonneKilometer: 0.00005,

  // ... add more if needed for other stages
};

module.exports = emissionFactorStore;
