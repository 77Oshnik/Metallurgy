// Emission factors for LCA calculations
const emissionFactors = {
    // Carbon footprint factors (kg CO2-eq per unit)
    EmissionFactorDieselKilogramCarbonDioxideEquivalentPerLiter: 2.68,
    EmissionFactorElectricityKilogramCarbonDioxideEquivalentPerKilowattHour: 0.82,
    EmissionFactorReagentKilogramCarbonDioxideEquivalentPerKilogram: 1.2,
    EmissionFactorTransportKilogramCarbonDioxideEquivalentPerTonneKilometer: 0.062,

    // Renewable energy emission factors (kg CO2-eq per kWh)
    EmissionFactorSolarKilogramCarbonDioxideEquivalentPerKilowattHour: 0.045,
    EmissionFactorWindKilogramCarbonDioxideEquivalentPerKilowattHour: 0.012,
    EmissionFactorHydroKilogramCarbonDioxideEquivalentPerKilowattHour: 0.025,
    EmissionFactorGeothermalKilogramCarbonDioxideEquivalentPerKilowattHour: 0.035,
    EmissionFactorBiomassKilogramCarbonDioxideEquivalentPerKilowattHour: 0.020,

    // Energy footprint factors (MJ per unit)
    EmissionFactorElectricityEnergyMegajoulePerKilowattHour: 3.6,
    EmissionFactorDieselEnergyMegajoulePerLiter: 38.6,
    EnergyFactorCokeMegajoulePerKilogram: 28.2,

    // Coke emission factors
    EmissionFactorCokeKilogramCarbonDioxideEquivalentPerKilogram: 3.2,

    // Air pollutant emission factors (kg per unit)
    // Sulfur Dioxide (SO2)
    PollutantEmissionFactorDieselSulfurDioxideKilogramsPerLiter: 0.0054,
    PollutantEmissionFactorElectricitySulfurDioxideKilogramsPerKilowattHour: 0.0012,
    PollutantEmissionFactorReagentSulfurDioxideKilogramsPerKilogram: 0.008,
    PollutantEmissionFactorTransportSulfurDioxideKilogramsPerTonneKilometer: 0.00015,

    // Nitrogen Oxides (NOx)
    PollutantEmissionFactorDieselNitrogenOxidesKilogramsPerLiter: 0.0312,
    PollutantEmissionFactorElectricityNitrogenOxidesKilogramsPerKilowattHour: 0.0008,
    PollutantEmissionFactorReagentNitrogenOxidesKilogramsPerKilogram: 0.005,
    PollutantEmissionFactorTransportNitrogenOxidesKilogramsPerTonneKilometer: 0.00089,

    // Particulate Matter (PM)
    PollutantEmissionFactorDieselParticulateMatterKilogramsPerLiter: 0.0024,
    PollutantEmissionFactorElectricityParticulateMatterKilogramsPerKilowattHour: 0.0003,
    PollutantEmissionFactorReagentParticulateMatterKilogramsPerKilogram: 0.002,
    PollutantEmissionFactorTransportParticulateMatterKilogramsPerTonneKilometer: 0.00012,

    // Helper function to get all factors
    getFactors: function() {
        return {
            gridElectricity: this.EmissionFactorElectricityKilogramCarbonDioxideEquivalentPerKilowattHour,
            fossilFuel: this.EmissionFactorDieselKilogramCarbonDioxideEquivalentPerLiter,
            solar: this.EmissionFactorSolarKilogramCarbonDioxideEquivalentPerKilowattHour,
            wind: this.EmissionFactorWindKilogramCarbonDioxideEquivalentPerKilowattHour,
            hydro: this.EmissionFactorHydroKilogramCarbonDioxideEquivalentPerKilowattHour,
            geothermal: this.EmissionFactorGeothermalKilogramCarbonDioxideEquivalentPerKilowattHour,
            biomass: this.EmissionFactorBiomassKilogramCarbonDioxideEquivalentPerKilowattHour
        };
    }
};

module.exports = emissionFactors;