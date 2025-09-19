const { validationResult } = require('express-validator');
const Project = require('../models/projectModel');
const UsePhaseStage = require('../models/usePhaseStageModel');
const emissionFactors = require('../utils/emissionFactorStore');
const aiPredictionService = require('../services/aiPredictionService');

const handlePostUsePhaseStage = async (req, res) => {
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

        // Note: Use Phase stage is independent and doesn't require upstream stages
        // It works directly with the functional unit from the project

        // Get field configuration
        const fieldConfig = UsePhaseStage.getFieldConfig();
        
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
            console.log(`Predicting missing use phase fields: ${missingFields.join(', ')}`);
            
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
                'usePhase',
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

                console.log(`Successfully predicted ${Object.keys(predictionResult.predictions).length} use phase fields`);
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
                
                console.warn(`AI use phase prediction failed: ${predictionResult.error}`);
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
            
            console.log(`Using fallback values for ${missingFields.length} missing use phase fields`);
        }

        // Calculate derived helper variables
        const FailureFraction = inputs.FailureRatePercent / 100;
        
        const ReusePotentialFraction = (inputs.ReusePotentialPercent || 0) / 100;
        
        const EffectiveServiceLifetimeYearsPerFunctionalUnit = 
            inputs.ProductLifetimeYears * (1.0 - FailureFraction);
        
        const TotalOperationalEnergyKilowattHoursOverLifetimePerFunctionalUnit = 
            inputs.OperationalEnergyKilowattHoursPerYearPerFunctionalUnit * inputs.ProductLifetimeYears;
        
        const TotalMaintenanceEnergyKilowattHoursOverLifetimePerFunctionalUnit = 
            (inputs.MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit || 0) * inputs.ProductLifetimeYears;
        
        const TotalMaintenanceMaterialsKilogramsOverLifetimePerFunctionalUnit = 
            (inputs.MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit || 0) * inputs.ProductLifetimeYears;

        const derivedHelperVariables = {
            FailureFraction,
            ReusePotentialFraction,
            EffectiveServiceLifetimeYearsPerFunctionalUnit,
            TotalOperationalEnergyKilowattHoursOverLifetimePerFunctionalUnit,
            TotalMaintenanceEnergyKilowattHoursOverLifetimePerFunctionalUnit,
            TotalMaintenanceMaterialsKilogramsOverLifetimePerFunctionalUnit
        };

        // Calculate outputs
        const LifetimeEfficiencyYearsPerFunctionalUnit = EffectiveServiceLifetimeYearsPerFunctionalUnit;

        const OperationalCarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitOverLifetime = 
            TotalOperationalEnergyKilowattHoursOverLifetimePerFunctionalUnit * 
            emissionFactors.EmissionFactorElectricityKilogramCarbonDioxideEquivalentPerKilowattHour;

        const MaintenanceCarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitOverLifetime = 
            (TotalMaintenanceEnergyKilowattHoursOverLifetimePerFunctionalUnit * 
             emissionFactors.EmissionFactorElectricityKilogramCarbonDioxideEquivalentPerKilowattHour) +
            (TotalMaintenanceMaterialsKilogramsOverLifetimePerFunctionalUnit * 
             emissionFactors.EmissionFactorReagentKilogramCarbonDioxideEquivalentPerKilogram);

        const ReuseFactorPercent = inputs.ReusePotentialPercent || 0;

        const outputs = {
            LifetimeEfficiencyYearsPerFunctionalUnit,
            OperationalCarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitOverLifetime,
            MaintenanceCarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitOverLifetime,
            ReuseFactorPercent
        };

        const computationMetadata = {
            independentStage: true,
            log: 'Use phase stage calculations completed successfully. This stage is independent of upstream processes.',
            functionalUnitUsed: project.FunctionalUnitMassTonnes,
            lifetimeAnalysis: {
                nominalLifetime: inputs.ProductLifetimeYears,
                effectiveLifetime: EffectiveServiceLifetimeYearsPerFunctionalUnit,
                failureImpact: FailureFraction,
                totalOperationalEnergy: TotalOperationalEnergyKilowattHoursOverLifetimePerFunctionalUnit,
                totalMaintenanceEnergy: TotalMaintenanceEnergyKilowattHoursOverLifetimePerFunctionalUnit
            },
            circularityIndicators: {
                reusePotential: ReusePotentialFraction,
                lifetimeEfficiency: EffectiveServiceLifetimeYearsPerFunctionalUnit / inputs.ProductLifetimeYears,
                reuseFactorPercent: ReuseFactorPercent
            }
        };

        // Save document with prediction metadata
        const usePhaseStageData = {
            ProjectIdentifier,
            Inputs: inputs,
            DerivedHelperVariables: derivedHelperVariables,
            Outputs: outputs,
            ComputationMetadata: computationMetadata,
            PredictionMetadata: predictionMetadata,
            FieldSources: fieldSources
        };

        const savedDocument = await UsePhaseStage.findOneAndUpdate(
            { ProjectIdentifier }, 
            usePhaseStageData, 
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
        console.error('Use phase stage error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const handleGetUsePhaseStage = async (req, res) => {
    try {
        const { ProjectIdentifier } = req.params;
        const usePhaseStage = await UsePhaseStage.findOne({ ProjectIdentifier });
        if (!usePhaseStage) {
            return res.status(404).json({ message: 'Use phase stage data not found for this project' });
        }
        res.json(usePhaseStage);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { handlePostUsePhaseStage, handleGetUsePhaseStage };