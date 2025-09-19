const { validationResult } = require('express-validator');
const Project = require('../models/projectModel');
const EndOfLifeStage = require('../models/endOfLifeStageModel');
const emissionFactors = require('../utils/emissionFactorStore');
const aiPredictionService = require('../services/aiPredictionService');

const handlePostEndOfLifeStage = async (req, res) => {
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

        // Note: End-of-Life stage is independent and doesn't require upstream stages
        // It works directly with the functional unit from the project

        // Get field configuration
        const fieldConfig = EndOfLifeStage.getFieldConfig();
        
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
            console.log(`Predicting missing end-of-life fields: ${missingFields.join(', ')}`);
            
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
                'endOfLife',
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

                console.log(`Successfully predicted ${Object.keys(predictionResult.predictions).length} end-of-life fields`);
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
                
                console.warn(`AI end-of-life prediction failed: ${predictionResult.error}`);
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
            
            console.log(`Using fallback values for ${missingFields.length} missing end-of-life fields`);
        }

        // Calculate derived helper variables
        const CollectionFraction = inputs.CollectionRatePercent / 100;
        
        const RecyclingEfficiencyFraction = inputs.RecyclingEfficiencyPercent / 100;
        
        const DowncyclingFraction = (inputs.DowncyclingFractionPercent || 0) / 100;
        
        const LandfillFraction = (inputs.LandfillSharePercent || 0) / 100;
        
        const RecoveredMassTonnesPerFunctionalUnit = 
            project.FunctionalUnitMassTonnes * CollectionFraction * RecyclingEfficiencyFraction;
        
        const DowncycledMassTonnesPerFunctionalUnit = 
            RecoveredMassTonnesPerFunctionalUnit * DowncyclingFraction;
        
        const LandfilledMassTonnesPerFunctionalUnit = 
            project.FunctionalUnitMassTonnes * LandfillFraction;
        
        const TransportTonnesKilometersPerFunctionalUnitToRecycler = 
            RecoveredMassTonnesPerFunctionalUnit * (inputs.TransportDistanceKilometersToRecycler || 0);
        
        const RecyclingEnergyKilowattHoursPerFunctionalUnit = 
            inputs.RecyclingEnergyKilowattHoursPerTonneRecycled * RecoveredMassTonnesPerFunctionalUnit;

        const derivedHelperVariables = {
            CollectionFraction,
            RecyclingEfficiencyFraction,
            DowncyclingFraction,
            LandfillFraction,
            RecoveredMassTonnesPerFunctionalUnit,
            DowncycledMassTonnesPerFunctionalUnit,
            LandfilledMassTonnesPerFunctionalUnit,
            TransportTonnesKilometersPerFunctionalUnitToRecycler,
            RecyclingEnergyKilowattHoursPerFunctionalUnit
        };

        // Calculate outputs
        const EndOfLifeRecyclingRatePercent = 
            inputs.CollectionRatePercent * inputs.RecyclingEfficiencyPercent / 100.0;

        const RecycledMassTonnesPerFunctionalUnit = RecoveredMassTonnesPerFunctionalUnit;

        const CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForEndOfLife = 
            (RecyclingEnergyKilowattHoursPerFunctionalUnit * 
             emissionFactors.EmissionFactorElectricityKilogramCarbonDioxideEquivalentPerKilowattHour) +
            (TransportTonnesKilometersPerFunctionalUnitToRecycler * 
             emissionFactors.EmissionFactorTransportKilogramCarbonDioxideEquivalentPerTonneKilometer);

        const ScrapUtilizationFraction = 
            RecycledMassTonnesPerFunctionalUnit / project.FunctionalUnitMassTonnes;

        const outputs = {
            EndOfLifeRecyclingRatePercent,
            RecycledMassTonnesPerFunctionalUnit,
            LandfilledMassTonnesPerFunctionalUnit,
            CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForEndOfLife,
            ScrapUtilizationFraction
        };

        const computationMetadata = {
            independentStage: true,
            log: 'End-of-life stage calculations completed successfully. This stage is independent of upstream processes.',
            functionalUnitUsed: project.FunctionalUnitMassTonnes,
            massBalance: {
                totalMass: project.FunctionalUnitMassTonnes,
                collectedMass: project.FunctionalUnitMassTonnes * CollectionFraction,
                recoveredMass: RecoveredMassTonnesPerFunctionalUnit,
                downcycledMass: DowncycledMassTonnesPerFunctionalUnit,
                landfilledMass: LandfilledMassTonnesPerFunctionalUnit,
                uncollectedMass: project.FunctionalUnitMassTonnes * (1 - CollectionFraction)
            },
            circularityIndicators: {
                collectionRate: CollectionFraction,
                recyclingEfficiency: RecyclingEfficiencyFraction,
                endOfLifeRecyclingRate: EndOfLifeRecyclingRatePercent / 100,
                scrapUtilization: ScrapUtilizationFraction,
                downcyclingImpact: DowncyclingFraction,
                landfillDiversion: 1 - LandfillFraction
            }
        };

        // Save document with prediction metadata
        const endOfLifeStageData = {
            ProjectIdentifier,
            Inputs: inputs,
            DerivedHelperVariables: derivedHelperVariables,
            Outputs: outputs,
            ComputationMetadata: computationMetadata,
            PredictionMetadata: predictionMetadata,
            FieldSources: fieldSources
        };

        const savedDocument = await EndOfLifeStage.findOneAndUpdate(
            { ProjectIdentifier }, 
            endOfLifeStageData, 
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
        console.error('End-of-life stage error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const handleGetEndOfLifeStage = async (req, res) => {
    try {
        const { ProjectIdentifier } = req.params;
        const endOfLifeStage = await EndOfLifeStage.findOne({ ProjectIdentifier });
        if (!endOfLifeStage) {
            return res.status(404).json({ message: 'End-of-life stage data not found for this project' });
        }
        res.json(endOfLifeStage);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { handlePostEndOfLifeStage, handleGetEndOfLifeStage };