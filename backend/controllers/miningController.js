const { validationResult } = require('express-validator');
const Project = require('../models/projectModel');
const MiningStage = require('../models/miningStageModel');
const ConcentrationStage = require('../models/concentrationStageModel');
const SmeltingStage = require('../models/smeltingStageModel');
const emissionFactors = require('../utils/emissionFactorStore');
const aiPredictionService = require('../services/aiPredictionService');

const handlePostMiningStage = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { ProjectIdentifier } = req.params;
        let inputs = req.body;

        const project = await Project.findById(ProjectIdentifier);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Get field configuration
        const fieldConfig = MiningStage.getFieldConfig();
        
        // Identify missing optional fields
        const missingFields = fieldConfig.optional.filter(field => 
            inputs[field] === undefined || inputs[field] === null || inputs[field] === ''
        );

        // Initialize prediction metadata
        let predictionMetadata = {
            predictedFields: [],
            predictionTimestamp: null,
            predictionModel: null,
            predictionPrompt: null,
            predictionReasoning: null,
            predictionConfidence: {}
        };

        let fieldSources = new Map();
        
        // Track user-provided fields
        Object.keys(inputs).forEach(field => {
            if (inputs[field] !== undefined && inputs[field] !== null && inputs[field] !== '') {
                fieldSources.set(field, 'user');
            }
        });

        // Predict missing fields if AI is enabled and there are missing fields
        if (missingFields.length > 0 && aiPredictionService.isEnabled()) {
            console.log(`Predicting missing fields: ${missingFields.join(', ')}`);
            
            const projectContext = {
                MetalType: project.MetalType,
                ProcessingMode: project.ProcessingMode,
                FunctionalUnitMassTonnes: project.FunctionalUnitMassTonnes,
                ProjectName: project.ProjectName
            };

            const providedFields = {};
            fieldConfig.mandatory.forEach(field => {
                if (inputs[field] !== undefined) {
                    providedFields[field] = inputs[field];
                }
            });

            const predictionResult = await aiPredictionService.predictMiningFields(
                projectContext, 
                providedFields, 
                missingFields
            );

            if (predictionResult.success) {
                // Merge AI predictions with user inputs
                Object.entries(predictionResult.predictions).forEach(([field, value]) => {
                    inputs[field] = value;
                    fieldSources.set(field, 'ai-predicted');
                });

                // Store prediction metadata
                predictionMetadata = {
                    predictedFields: Object.keys(predictionResult.predictions),
                    predictionTimestamp: new Date(predictionResult.metadata.timestamp),
                    predictionModel: predictionResult.metadata.model,
                    predictionPrompt: predictionResult.metadata.prompt,
                    predictionReasoning: predictionResult.metadata.reasoning,
                    predictionConfidence: predictionResult.metadata.confidence
                };

                console.log(`Successfully predicted ${Object.keys(predictionResult.predictions).length} fields`);
            } else {
                // Use fallback predictions if AI fails
                if (predictionResult.fallbackPredictions) {
                    Object.entries(predictionResult.fallbackPredictions).forEach(([field, value]) => {
                        inputs[field] = value;
                        fieldSources.set(field, 'fallback');
                    });
                    
                    predictionMetadata.predictedFields = Object.keys(predictionResult.fallbackPredictions);
                    predictionMetadata.predictionReasoning = `AI prediction failed: ${predictionResult.error}. Using fallback values.`;
                }
                
                console.warn(`AI prediction failed: ${predictionResult.error}`);
            }
        } else if (missingFields.length > 0) {
            // AI is disabled, use fallback values
            const fallbackPredictions = {};
            missingFields.forEach(field => {
                fallbackPredictions[field] = aiPredictionService.getFallbackValue(field, project.MetalType);
                fieldSources.set(field, 'fallback');
            });
            
            Object.assign(inputs, fallbackPredictions);
            predictionMetadata.predictedFields = missingFields;
            predictionMetadata.predictionReasoning = 'AI prediction disabled. Using fallback values.';
            
            console.log(`Using fallback values for ${missingFields.length} missing fields`);
        }

        // Step 3: Compute derived helper variables
        const concentrationStage = await ConcentrationStage.findOne({ ProjectIdentifier });
        const smeltingStage = await SmeltingStage.findOne({ ProjectIdentifier });

        // Always calculate basic derived variables
        const OreGradeFraction = inputs.OreGradePercent / 100;
        
        let derivedHelperVariables = {
            OreGradeFraction
        };
        
        let outputs = {};
        let computationMetadata = {
            downstreamRecoveriesAvailable: false,
            log: 'Downstream recovery fractions from Concentration and Smelting stages are not yet available. Using default recovery assumptions for preliminary calculations.'
        };

        // Calculate OreRequiredTonnesPerFunctionalUnit with available data
        let OreRequiredTonnesPerFunctionalUnit;
        
        if (concentrationStage && smeltingStage && concentrationStage.Inputs.RecoveryYieldPercent && smeltingStage.Inputs.SmeltRecoveryPercent) {
            // Use actual downstream recovery data
            computationMetadata.downstreamRecoveriesAvailable = true;
            computationMetadata.log = 'Downstream recovery fractions found. Calculating outputs with actual recovery data.';
            
            const RecoveryFractionFromConcentration = concentrationStage.Inputs.RecoveryYieldPercent / 100;
            const RecoveryFractionFromSmelting = smeltingStage.Inputs.SmeltRecoveryPercent / 100;
            const TotalMetalRecoveryFractionFromOreToProduct = RecoveryFractionFromConcentration * RecoveryFractionFromSmelting;

            OreRequiredTonnesPerFunctionalUnit = project.FunctionalUnitMassTonnes / (OreGradeFraction * TotalMetalRecoveryFractionFromOreToProduct);
        } else {
            // Use default recovery assumptions for preliminary calculations
            const defaultConcentrationRecovery = 0.85; // 85% typical recovery
            const defaultSmeltingRecovery = 0.95; // 95% typical recovery
            const TotalMetalRecoveryFractionFromOreToProduct = defaultConcentrationRecovery * defaultSmeltingRecovery;

            OreRequiredTonnesPerFunctionalUnit = project.FunctionalUnitMassTonnes / (OreGradeFraction * TotalMetalRecoveryFractionFromOreToProduct);
            
            computationMetadata.log += ` Using default recovery assumptions: Concentration ${defaultConcentrationRecovery * 100}%, Smelting ${defaultSmeltingRecovery * 100}%.`;
        }

        // Calculate other derived variables
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

        // Step 4: Always calculate outputs now that we have OreRequiredTonnesPerFunctionalUnit
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

        // Step 5: Save document with prediction metadata
        const miningStageData = {
            ProjectIdentifier,
            Inputs: inputs,
            DerivedHelperVariables: derivedHelperVariables,
            Outputs: outputs,
            ComputationMetadata: computationMetadata,
            PredictionMetadata: predictionMetadata,
            FieldSources: fieldSources
        };

        const savedDocument = await MiningStage.findOneAndUpdate({ ProjectIdentifier }, miningStageData, { new: true, upsert: true });

        // Include prediction info in response
        const response = {
            ...savedDocument.toObject(),
            predictionSummary: {
                totalFields: Object.keys(inputs).length,
                userProvidedFields: Array.from(fieldSources.entries()).filter(([_, source]) => source === 'user').length,
                aiPredictedFields: predictionMetadata.predictedFields.length,
                predictedFieldNames: predictionMetadata.predictedFields
            }
        };

        res.status(201).json(response);
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
