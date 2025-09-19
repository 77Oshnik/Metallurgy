const { validationResult } = require('express-validator');
const Project = require('../models/projectModel');
const MiningStage = require('../models/miningStageModel');
const ConcentrationStage = require('../models/concentrationStageModel');
const emissionFactors = require('../utils/emissionFactorStore');
const aiPredictionService = require('../services/aiPredictionService');

const handlePostConcentrationStage = async (req, res) => {
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

        // Check if mining stage exists (required for calculations)
        const miningStage = await MiningStage.findOne({ ProjectIdentifier });
        if (!miningStage || !miningStage.DerivedHelperVariables.OreRequiredTonnesPerFunctionalUnit) {
            return res.status(400).json({ 
                message: 'Mining stage data is required before concentration stage. Please complete mining stage first.' 
            });
        }

        // Get field configuration
        const fieldConfig = ConcentrationStage.getFieldConfig();
        
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
            console.log(`Predicting missing concentration fields: ${missingFields.join(', ')}`);
            
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
                'concentration',
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

                console.log(`Successfully predicted ${Object.keys(predictionResult.predictions).length} concentration fields`);
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
                
                console.warn(`AI concentration prediction failed: ${predictionResult.error}`);
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
            
            console.log(`Using fallback values for ${missingFields.length} missing concentration fields`);
        }

        // Calculate derived helper variables
        const OreRequiredTonnesPerFunctionalUnit = miningStage.DerivedHelperVariables.OreRequiredTonnesPerFunctionalUnit;
        
        const RecoveryFractionFromConcentration = inputs.RecoveryYieldPercent / 100;
        
        const ConcentrateMassTonnesPerFunctionalUnit = 
            OreRequiredTonnesPerFunctionalUnit / (inputs.TailingsVolumeTonnesPerTonneConcentrate + 1);
        
        const GrindingEnergyKilowattHoursPerFunctionalUnit = 
            inputs.GrindingEnergyKilowattHoursPerTonneConcentrate * ConcentrateMassTonnesPerFunctionalUnit;
        
        const ConcentrationReagentsKilogramsPerFunctionalUnit = 
            inputs.ConcentrationReagentsKilogramsPerTonneConcentrate * ConcentrateMassTonnesPerFunctionalUnit;
        
        const ConcentrationWaterCubicMetersPerFunctionalUnitNet = 
            inputs.ConcentrationWaterCubicMetersPerTonneConcentrate * 
            ConcentrateMassTonnesPerFunctionalUnit * 
            (1 - inputs.WaterRecycleRatePercent / 100);
        
        const TailingsMassTonnesPerFunctionalUnit = 
            ConcentrateMassTonnesPerFunctionalUnit * inputs.TailingsVolumeTonnesPerTonneConcentrate;

        const derivedHelperVariables = {
            RecoveryFractionFromConcentration,
            ConcentrateMassTonnesPerFunctionalUnit,
            GrindingEnergyKilowattHoursPerFunctionalUnit,
            ConcentrationReagentsKilogramsPerFunctionalUnit,
            ConcentrationWaterCubicMetersPerFunctionalUnitNet,
            TailingsMassTonnesPerFunctionalUnit
        };

        // Calculate outputs
        const CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForConcentration = 
            (GrindingEnergyKilowattHoursPerFunctionalUnit * emissionFactors.EmissionFactorElectricityKilogramCarbonDioxideEquivalentPerKilowattHour) +
            (ConcentrationReagentsKilogramsPerFunctionalUnit * emissionFactors.EmissionFactorReagentKilogramCarbonDioxideEquivalentPerKilogram);

        const EnergyFootprintMegajoulesPerFunctionalUnitForConcentration = 
            GrindingEnergyKilowattHoursPerFunctionalUnit * emissionFactors.EmissionFactorElectricityEnergyMegajoulePerKilowattHour;

        const WaterFootprintCubicMetersPerFunctionalUnitForConcentration = 
            ConcentrationWaterCubicMetersPerFunctionalUnitNet;

        const StageRecoveryFractionFromOreToConcentrate = RecoveryFractionFromConcentration;

        const outputs = {
            CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForConcentration,
            EnergyFootprintMegajoulesPerFunctionalUnitForConcentration,
            WaterFootprintCubicMetersPerFunctionalUnitForConcentration,
            TailingsMassTonnesPerFunctionalUnit,
            StageRecoveryFractionFromOreToConcentrate
        };

        const computationMetadata = {
            upstreamDataAvailable: true,
            log: 'Mining stage data found. Calculations completed successfully.',
            oreRequiredFromMining: OreRequiredTonnesPerFunctionalUnit
        };

        // Save document with prediction metadata
        const concentrationStageData = {
            ProjectIdentifier,
            Inputs: inputs,
            DerivedHelperVariables: derivedHelperVariables,
            Outputs: outputs,
            ComputationMetadata: computationMetadata,
            PredictionMetadata: predictionMetadata,
            FieldSources: fieldSources
        };

        const savedDocument = await ConcentrationStage.findOneAndUpdate(
            { ProjectIdentifier }, 
            concentrationStageData, 
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
        console.error('Concentration stage error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const handleGetConcentrationStage = async (req, res) => {
    try {
        const { ProjectIdentifier } = req.params;
        const concentrationStage = await ConcentrationStage.findOne({ ProjectIdentifier });
        if (!concentrationStage) {
            return res.status(404).json({ message: 'Concentration stage data not found for this project' });
        }
        res.json(concentrationStage);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { handlePostConcentrationStage, handleGetConcentrationStage };