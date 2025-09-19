const { validationResult } = require('express-validator');
const Project = require('../models/projectModel');
const MiningStage = require('../models/miningStageModel');
const ConcentrationStage = require('../models/concentrationStageModel');
const SmeltingStage = require('../models/smeltingStageModel');
const emissionFactors = require('../utils/emissionFactorStore');

const handlePostMiningStage = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { ProjectIdentifier } = req.params;
        const inputs = req.body;

        const project = await Project.findById(ProjectIdentifier);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Step 3: Compute derived helper variables
        const concentrationStage = await ConcentrationStage.findOne({ ProjectIdentifier });
        const smeltingStage = await SmeltingStage.findOne({ ProjectIdentifier });

        let derivedHelperVariables = {};
        let outputs = {};
        let computationMetadata = {
            downstreamRecoveriesAvailable: false,
            log: 'Downstream recovery fractions from Concentration and Smelting stages are not yet available. Outputs cannot be calculated.'
        };

        if (concentrationStage && smeltingStage && concentrationStage.Inputs.RecoveryYieldPercent && smeltingStage.Inputs.SmeltRecoveryPercent) {
            computationMetadata.downstreamRecoveriesAvailable = true;
            computationMetadata.log = 'Downstream recovery fractions found. Calculating outputs.';
            
            const OreGradeFraction = inputs.OreGradePercent / 100;
            const RecoveryFractionFromConcentration = concentrationStage.Inputs.RecoveryYieldPercent / 100;
            const RecoveryFractionFromSmelting = smeltingStage.Inputs.SmeltRecoveryPercent / 100;
            const TotalMetalRecoveryFractionFromOreToProduct = RecoveryFractionFromConcentration * RecoveryFractionFromSmelting;

            const OreRequiredTonnesPerFunctionalUnit = project.FunctionalUnitMassTonnes / (OreGradeFraction * TotalMetalRecoveryFractionFromOreToProduct);
            const DieselUseLitersPerFunctionalUnit = inputs.DieselUseLitersPerTonneOre * OreRequiredTonnesPerFunctionalUnit;
            const ElectricityUseKilowattHoursPerFunctionalUnit = inputs.ElectricityUseKilowattHoursPerTonneOre * OreRequiredTonnesPerFunctionalUnit;
            const ReagentsKilogramsPerFunctionalUnit = inputs.ReagentsKilogramsPerTonneOre * OreRequiredTonnesPerFunctionalUnit;
            const WaterWithdrawalCubicMetersPerFunctionalUnit = inputs.WaterWithdrawalCubicMetersPerTonneOre * OreRequiredTonnesPerFunctionalUnit;
            const TransportTonnesKilometersPerFunctionalUnit = OreRequiredTonnesPerFunctionalUnit * inputs.TransportDistanceKilometersToConcentrator;

            derivedHelperVariables = {
                OreGradeFraction,
                OreRequiredTonnesPerFunctionalUnit,
                DieselUseLitersPerFunctionalUnit,
                ElectricityUseKilowattHoursPerFunctionalUnit,
                ReagentsKilogramsPerFunctionalUnit,
                WaterWithdrawalCubicMetersPerFunctionalUnit,
                TransportTonnesKilometersPerFunctionalUnit,
            };

            // Step 4: Compute outputs
            const CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForMining =
                (DieselUseLitersPerFunctionalUnit * emissionFactors.EmissionFactorDieselKilogramCarbonDioxideEquivalentPerLiter) +
                (ElectricityUseKilowattHoursPerFunctionalUnit * emissionFactors.EmissionFactorElectricityKilogramCarbonDioxideEquivalentPerKilowattHour) +
                (ReagentsKilogramsPerFunctionalUnit * emissionFactors.EmissionFactorReagentKilogramCarbonDioxideEquivalentPerKilogram) +
                (TransportTonnesKilometersPerFunctionalUnit * emissionFactors.EmissionFactorTransportKilogramCarbonDioxideEquivalentPerTonneKilometer);

            const EnergyFootprintMegajoulesPerFunctionalUnitForMining =
                (ElectricityUseKilowattHoursPerFunctionalUnit * emissionFactors.EmissionFactorElectricityEnergyMegajoulePerKilowattHour) +
                (DieselUseLitersPerFunctionalUnit * emissionFactors.EmissionFactorDieselEnergyMegajoulePerLiter);

            const WaterFootprintCubicMetersPerFunctionalUnitForMining = WaterWithdrawalCubicMetersPerFunctionalUnit;

            const SulfurDioxide = (DieselUseLitersPerFunctionalUnit * emissionFactors.PollutantEmissionFactorDieselSulfurDioxideKilogramsPerLiter) +
                (ElectricityUseKilowattHoursPerFunctionalUnit * emissionFactors.PollutantEmissionFactorElectricitySulfurDioxideKilogramsPerKilowattHour) +
                (ReagentsKilogramsPerFunctionalUnit * emissionFactors.PollutantEmissionFactorReagentSulfurDioxideKilogramsPerKilogram) +
                (TransportTonnesKilometersPerFunctionalUnit * emissionFactors.PollutantEmissionFactorTransportSulfurDioxideKilogramsPerTonneKilometer);
            
            const NitrogenOxides = (DieselUseLitersPerFunctionalUnit * emissionFactors.PollutantEmissionFactorDieselNitrogenOxidesKilogramsPerLiter) +
                (ElectricityUseKilowattHoursPerFunctionalUnit * emissionFactors.PollutantEmissionFactorElectricityNitrogenOxidesKilogramsPerKilowattHour) +
                (ReagentsKilogramsPerFunctionalUnit * emissionFactors.PollutantEmissionFactorReagentNitrogenOxidesKilogramsPerKilogram) +
                (TransportTonnesKilometersPerFunctionalUnit * emissionFactors.PollutantEmissionFactorTransportNitrogenOxidesKilogramsPerTonneKilometer);

            const ParticulateMatter = (DieselUseLitersPerFunctionalUnit * emissionFactors.PollutantEmissionFactorDieselParticulateMatterKilogramsPerLiter) +
                (ElectricityUseKilowattHoursPerFunctionalUnit * emissionFactors.PollutantEmissionFactorElectricityParticulateMatterKilogramsPerKilowattHour) +
                (ReagentsKilogramsPerFunctionalUnit * emissionFactors.PollutantEmissionFactorReagentParticulateMatterKilogramsPerKilogram) +
                (TransportTonnesKilometersPerFunctionalUnit * emissionFactors.PollutantEmissionFactorTransportParticulateMatterKilogramsPerTonneKilometer);

            outputs = {
                CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForMining,
                EnergyFootprintMegajoulesPerFunctionalUnitForMining,
                WaterFootprintCubicMetersPerFunctionalUnitForMining,
                AirPollutantEmissionsKilogramsPerFunctionalUnitForMining: {
                    SulfurDioxide,
                    NitrogenOxides,
                    ParticulateMatter,
                },
                OreRequiredTonnesPerFunctionalUnit,
            };
        }

        // Step 5: Save document
        const miningStageData = {
            ProjectIdentifier,
            Inputs: inputs,
            DerivedHelperVariables: derivedHelperVariables,
            Outputs: outputs,
            ComputationMetadata: computationMetadata,
        };

        const savedDocument = await MiningStage.findOneAndUpdate({ ProjectIdentifier }, miningStageData, { new: true, upsert: true });

        res.status(201).json(savedDocument);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const handleGetMiningStage = async (req, res) => {
    try {
        const { ProjectIdentifier } = req.params;
        const miningStage = await MiningStage.findOne({ ProjectIdentifier });
        if (!miningStage) {
            return res.status(404).json({ message: 'Mining stage data not found for this project' });
        }
        res.json(miningStage);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { handlePostMiningStage, handleGetMiningStage };
