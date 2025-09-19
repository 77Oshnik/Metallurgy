const { validationResult } = require('express-validator');
const Project = require('../models/projectModel');
const ConcentrationStage = require('../models/concentrationStageModel');
const SmeltingStage = require('../models/smeltingStageModel');
const emissionFactors = require('../utils/emissionFactorStore');
const aiPredictionService = require('../services/aiPredictionService');

const handlePostSmeltingStage = async (req, res) => {
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

        // Check if concentration stage exists (required for calculations)
        const concentrationStage = await ConcentrationStage.findOne({ ProjectIdentifier });
        if (!concentrationStage || !concentrationStage.DerivedHelperVariables.ConcentrateMassTonnesPerFunctionalUnit) {
            return res.status(400).json({ 
                message: 'Concentration stage data is required before smelting stage. Please complete concentration stage first.' 
            });
        }

        // Get field configuration
        const fieldConfig = SmeltingStage.getFieldConfig();
        
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
            console.log(`Predicting missing smelting fields: ${missingFields.join(', ')}`);
            
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

            const predictionResult = await aiPredictionService.predictStageFields(
                'smelting',
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

                console.log(`Successfully predicted ${Object.keys(predictionResult.predictions).length} smelting fields`);
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
                
                console.warn(`AI smelting prediction failed: ${predictionResult.error}`);
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
            
            console.log(`Using fallback values for ${missingFields.length} missing smelting fields`);
        }

        // Calculate derived helper variables
        const ConcentrateMassTonnesPerFunctionalUnit = concentrationStage.DerivedHelperVariables.ConcentrateMassTonnesPerFunctionalUnit;
        const RecoveryFractionFromConcentration = concentrationStage.DerivedHelperVariables.RecoveryFractionFromConcentration;
        
        const SmeltRecoveryFraction = inputs.SmeltRecoveryPercent / 100;
        
        // Calculate metal mass produced after smelting
        const MetalMassTonnesPerFunctionalUnit = 
            ConcentrateMassTonnesPerFunctionalUnit * SmeltRecoveryFraction;
        
        const SmeltEnergyKilowattHoursPerFunctionalUnit = 
            inputs.SmeltEnergyKilowattHoursPerTonneMetal * MetalMassTonnesPerFunctionalUnit;
        
        const CokeUseKilogramsPerFunctionalUnit = 
            inputs.CokeUseKilogramsPerTonneMetal * MetalMassTonnesPerFunctionalUnit;
        
        const FluxesKilogramsPerFunctionalUnit = 
            (inputs.FluxesKilogramsPerTonneMetal || 0) * MetalMassTonnesPerFunctionalUnit;
        
        const EmissionControlFraction = (inputs.EmissionControlEfficiencyPercent || 0) / 100;

        const derivedHelperVariables = {
            SmeltRecoveryFraction,
            SmeltEnergyKilowattHoursPerFunctionalUnit,
            CokeUseKilogramsPerFunctionalUnit,
            FluxesKilogramsPerFunctionalUnit,
            EmissionControlFraction
        };

        // Calculate outputs
        const CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForSmelting = 
            (SmeltEnergyKilowattHoursPerFunctionalUnit * emissionFactors.EmissionFactorElectricityKilogramCarbonDioxideEquivalentPerKilowattHour) +
            (CokeUseKilogramsPerFunctionalUnit * emissionFactors.EmissionFactorReagentKilogramCarbonDioxideEquivalentPerKilogram) +
            (FluxesKilogramsPerFunctionalUnit * emissionFactors.EmissionFactorReagentKilogramCarbonDioxideEquivalentPerKilogram);

        const EnergyFootprintMegajoulesPerFunctionalUnitForSmelting = 
            SmeltEnergyKilowattHoursPerFunctionalUnit * emissionFactors.EmissionFactorElectricityEnergyMegajoulePerKilowattHour;

        const StageRecoveryFractionForSmelting = SmeltRecoveryFraction;

        // Calculate air pollutant emissions (with emission control if specified)
        const baseEmissionFactor = 1 - EmissionControlFraction;
        
        const SulfurDioxide = (
            (SmeltEnergyKilowattHoursPerFunctionalUnit * emissionFactors.PollutantEmissionFactorElectricitySulfurDioxideKilogramsPerKilowattHour) +
            (CokeUseKilogramsPerFunctionalUnit * emissionFactors.PollutantEmissionFactorReagentSulfurDioxideKilogramsPerKilogram) +
            (FluxesKilogramsPerFunctionalUnit * emissionFactors.PollutantEmissionFactorReagentSulfurDioxideKilogramsPerKilogram)
        ) * baseEmissionFactor;
        
        const NitrogenOxides = (
            (SmeltEnergyKilowattHoursPerFunctionalUnit * emissionFactors.PollutantEmissionFactorElectricityNitrogenOxidesKilogramsPerKilowattHour) +
            (CokeUseKilogramsPerFunctionalUnit * emissionFactors.PollutantEmissionFactorReagentNitrogenOxidesKilogramsPerKilogram) +
            (FluxesKilogramsPerFunctionalUnit * emissionFactors.PollutantEmissionFactorReagentNitrogenOxidesKilogramsPerKilogram)
        ) * baseEmissionFactor;

        const ParticulateMatter = (
            (SmeltEnergyKilowattHoursPerFunctionalUnit * emissionFactors.PollutantEmissionFactorElectricityParticulateMatterKilogramsPerKilowattHour) +
            (CokeUseKilogramsPerFunctionalUnit * emissionFactors.PollutantEmissionFactorReagentParticulateMatterKilogramsPerKilogram) +
            (FluxesKilogramsPerFunctionalUnit * emissionFactors.PollutantEmissionFactorReagentParticulateMatterKilogramsPerKilogram)
        ) * baseEmissionFactor;

        const outputs = {
            CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForSmelting,
            EnergyFootprintMegajoulesPerFunctionalUnitForSmelting,
            StageRecoveryFractionForSmelting,
            AirPollutantEmissionsKilogramsPerFunctionalUnitForSmelting: {
                SulfurDioxide,
                NitrogenOxides,
                ParticulateMatter
            }
        };

        const computationMetadata = {
            upstreamDataAvailable: true,
            log: 'Concentration stage data found. Smelting calculations completed successfully.',
            concentrateMassFromUpstream: ConcentrateMassTonnesPerFunctionalUnit,
            metalMassProduced: MetalMassTonnesPerFunctionalUnit,
            totalRecoveryFromOre: RecoveryFractionFromConcentration * SmeltRecoveryFraction
        };

        // Save document with prediction metadata
        const smeltingStageData = {
            ProjectIdentifier,
            Inputs: inputs,
            DerivedHelperVariables: derivedHelperVariables,
            Outputs: outputs,
            ComputationMetadata: computationMetadata,
            PredictionMetadata: predictionMetadata,
            FieldSources: fieldSources
        };

        const savedDocument = await SmeltingStage.findOneAndUpdate(
            { ProjectIdentifier }, 
            smeltingStageData, 
            { new: true, upsert: true }
        );

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
        console.error('Smelting stage error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const handleGetSmeltingStage = async (req, res) => {
    try {
        const { ProjectIdentifier } = req.params;
        const smeltingStage = await SmeltingStage.findOne({ ProjectIdentifier });
        if (!smeltingStage) {
            return res.status(404).json({ message: 'Smelting stage data not found for this project' });
        }
        res.json(smeltingStage);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { handlePostSmeltingStage, handleGetSmeltingStage };