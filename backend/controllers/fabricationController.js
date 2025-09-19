const { validationResult } = require('express-validator');
const Project = require('../models/projectModel');
const FabricationStage = require('../models/fabricationStageModel');
const emissionFactors = require('../utils/emissionFactorStore');
const aiPredictionService = require('../services/aiPredictionService');

const handlePostFabricationStage = async (req, res) => {
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

        // Note: Fabrication stage is independent and doesn't require upstream stages
        // It works directly with the functional unit from the project

        // Get field configuration
        const fieldConfig = FabricationStage.getFieldConfig();
        
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
            console.log(`Predicting missing fabrication fields: ${missingFields.join(', ')}`);
            
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
                'fabrication',
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

                console.log(`Successfully predicted ${Object.keys(predictionResult.predictions).length} fabrication fields`);
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
                
                console.warn(`AI fabrication prediction failed: ${predictionResult.error}`);
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
            
            console.log(`Using fallback values for ${missingFields.length} missing fabrication fields`);
        }

        // Calculate derived helper variables
        const FabricationEnergyKilowattHoursPerFunctionalUnit = 
            inputs.FabricationEnergyKilowattHoursPerTonneProduct * project.FunctionalUnitMassTonnes;
        
        const FabricationElectricityNonRenewableShareFraction = 
            (100 - (inputs.FabricationElectricityRenewableSharePercent || 0)) / 100;
        
        const AncillaryMaterialsKilogramsPerFunctionalUnit = 
            (inputs.AncillaryMaterialsKilogramsPerTonneProduct || 0) * project.FunctionalUnitMassTonnes;
        
        const FabricationWaterCubicMetersPerFunctionalUnit = 
            (inputs.FabricationWaterCubicMetersPerTonneProduct || 0) * project.FunctionalUnitMassTonnes;
        
        const ScrapInputFraction = inputs.ScrapInputPercent / 100;
        
        const YieldEfficiencyFraction = (100 - inputs.YieldLossPercent) / 100;

        const derivedHelperVariables = {
            FabricationEnergyKilowattHoursPerFunctionalUnit,
            FabricationElectricityNonRenewableShareFraction,
            AncillaryMaterialsKilogramsPerFunctionalUnit,
            FabricationWaterCubicMetersPerFunctionalUnit,
            ScrapInputFraction,
            YieldEfficiencyFraction
        };

        // Calculate outputs
        const CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForFabrication = 
            (FabricationEnergyKilowattHoursPerFunctionalUnit * 
             FabricationElectricityNonRenewableShareFraction * 
             emissionFactors.EmissionFactorElectricityKilogramCarbonDioxideEquivalentPerKilowattHour) +
            (AncillaryMaterialsKilogramsPerFunctionalUnit * 
             emissionFactors.EmissionFactorReagentKilogramCarbonDioxideEquivalentPerKilogram);

        const EnergyFootprintMegajoulesPerFunctionalUnitForFabrication = 
            FabricationEnergyKilowattHoursPerFunctionalUnit * 
            emissionFactors.EmissionFactorElectricityEnergyMegajoulePerKilowattHour;

        const RecycledContentPercent = inputs.ScrapInputPercent;

        const WaterFootprintCubicMetersPerFunctionalUnitForFabrication = 
            FabricationWaterCubicMetersPerFunctionalUnit;

        const YieldEfficiencyPercent = 100.0 - inputs.YieldLossPercent;

        const outputs = {
            CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForFabrication,
            EnergyFootprintMegajoulesPerFunctionalUnitForFabrication,
            RecycledContentPercent,
            WaterFootprintCubicMetersPerFunctionalUnitForFabrication,
            YieldEfficiencyPercent
        };

        const computationMetadata = {
            independentStage: true,
            log: 'Fabrication stage calculations completed successfully. This stage is independent of upstream processes.',
            functionalUnitUsed: project.FunctionalUnitMassTonnes,
            renewableEnergyShare: inputs.FabricationElectricityRenewableSharePercent || 0,
            circularityIndicators: {
                scrapInputFraction: ScrapInputFraction,
                yieldEfficiency: YieldEfficiencyFraction,
                recycledContent: RecycledContentPercent
            }
        };

        // Save document with prediction metadata
        const fabricationStageData = {
            ProjectIdentifier,
            Inputs: inputs,
            DerivedHelperVariables: derivedHelperVariables,
            Outputs: outputs,
            ComputationMetadata: computationMetadata,
            PredictionMetadata: predictionMetadata,
            FieldSources: fieldSources
        };

        const savedDocument = await FabricationStage.findOneAndUpdate(
            { ProjectIdentifier }, 
            fabricationStageData, 
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
        console.error('Fabrication stage error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const handleGetFabricationStage = async (req, res) => {
    try {
        const { ProjectIdentifier } = req.params;
        const fabricationStage = await FabricationStage.findOne({ ProjectIdentifier });
        if (!fabricationStage) {
            return res.status(404).json({ message: 'Fabrication stage data not found for this project' });
        }
        res.json(fabricationStage);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { handlePostFabricationStage, handleGetFabricationStage };