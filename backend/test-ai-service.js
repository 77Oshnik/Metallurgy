// Simple test script for AI prediction service
require('dotenv').config();
const aiPredictionService = require('./services/aiPredictionService');

async function testAIService() {
    console.log('Testing AI Prediction Service...\n');
    
    // Test data
    const projectContext = {
        MetalType: 'Copper',
        ProcessingMode: 'Circular',
        FunctionalUnitMassTonnes: 1.0,
        ProjectName: 'Test Project'
    };
    
    const providedFields = {
        OreGradePercent: 2.5,
        DieselUseLitersPerTonneOre: 15.0,
        ElectricityUseKilowattHoursPerTonneOre: 45.0
    };
    
    const missingFields = [
        'ReagentsKilogramsPerTonneOre',
        'WaterWithdrawalCubicMetersPerTonneOre',
        'TransportDistanceKilometersToConcentrator'
    ];
    
    console.log('Project Context:', projectContext);
    console.log('Provided Fields:', providedFields);
    console.log('Missing Fields:', missingFields);
    console.log('\n--- Testing AI Prediction ---');
    
    try {
        const result = await aiPredictionService.predictMiningFields(
            projectContext,
            providedFields,
            missingFields
        );
        
        if (result.success) {
            console.log('✅ AI Prediction Successful!');
            console.log('Predictions:', result.predictions);
            console.log('Metadata:', {
                model: result.metadata.model,
                timestamp: result.metadata.timestamp,
                confidence: result.metadata.confidence
            });
            console.log('Reasoning:', result.metadata.reasoning.substring(0, 200) + '...');
        } else {
            console.log('❌ AI Prediction Failed:', result.error);
            console.log('Fallback Predictions:', result.fallbackPredictions);
        }
    } catch (error) {
        console.error('❌ Test Error:', error.message);
    }
    
    console.log('\n--- Testing Fallback Values ---');
    const fallbackValues = {
        Copper: {
            ReagentsKilogramsPerTonneOre: aiPredictionService.getFallbackValue('ReagentsKilogramsPerTonneOre', 'Copper'),
            WaterWithdrawalCubicMetersPerTonneOre: aiPredictionService.getFallbackValue('WaterWithdrawalCubicMetersPerTonneOre', 'Copper'),
            TransportDistanceKilometersToConcentrator: aiPredictionService.getFallbackValue('TransportDistanceKilometersToConcentrator', 'Copper')
        },
        Aluminium: {
            ReagentsKilogramsPerTonneOre: aiPredictionService.getFallbackValue('ReagentsKilogramsPerTonneOre', 'Aluminium'),
            WaterWithdrawalCubicMetersPerTonneOre: aiPredictionService.getFallbackValue('WaterWithdrawalCubicMetersPerTonneOre', 'Aluminium'),
            TransportDistanceKilometersToConcentrator: aiPredictionService.getFallbackValue('TransportDistanceKilometersToConcentrator', 'Aluminium')
        }
    };
    
    console.log('Fallback Values:', fallbackValues);
    
    console.log('\n--- Testing Concentration Stage AI Prediction ---');
    
    const concentrationMissingFields = [
        'ConcentrationReagentsKilogramsPerTonneConcentrate',
        'ConcentrationWaterCubicMetersPerTonneConcentrate',
        'WaterRecycleRatePercent'
    ];
    
    const concentrationProvidedFields = {
        RecoveryYieldPercent: 85.0,
        GrindingEnergyKilowattHoursPerTonneConcentrate: 120.0,
        TailingsVolumeTonnesPerTonneConcentrate: 8.5
    };
    
    try {
        const concentrationResult = await aiPredictionService.predictStageFields(
            'concentration',
            projectContext,
            concentrationProvidedFields,
            concentrationMissingFields
        );
        
        if (concentrationResult.success) {
            console.log('✅ Concentration AI Prediction Successful!');
            console.log('Predictions:', concentrationResult.predictions);
        } else {
            console.log('❌ Concentration AI Prediction Failed:', concentrationResult.error);
            console.log('Fallback Predictions:', concentrationResult.fallbackPredictions);
        }
    } catch (error) {
        console.error('❌ Concentration Test Error:', error.message);
    }

    console.log('\n--- Testing Smelting Stage AI Prediction ---');
    
    const smeltingMissingFields = [
        'FuelSharePercent',
        'FluxesKilogramsPerTonneMetal',
        'EmissionControlEfficiencyPercent'
    ];
    
    const smeltingProvidedFields = {
        SmeltEnergyKilowattHoursPerTonneMetal: 3500.0,
        SmeltRecoveryPercent: 95.0,
        CokeUseKilogramsPerTonneMetal: 800.0
    };
    
    try {
        const smeltingResult = await aiPredictionService.predictStageFields(
            'smelting',
            projectContext,
            smeltingProvidedFields,
            smeltingMissingFields
        );
        
        if (smeltingResult.success) {
            console.log('✅ Smelting AI Prediction Successful!');
            console.log('Predictions:', smeltingResult.predictions);
        } else {
            console.log('❌ Smelting AI Prediction Failed:', smeltingResult.error);
            console.log('Fallback Predictions:', smeltingResult.fallbackPredictions);
        }
    } catch (error) {
        console.error('❌ Smelting Test Error:', error.message);
    }

    console.log('\n--- Testing Fabrication Stage AI Prediction ---');
    
    const fabricationMissingFields = [
        'FabricationElectricityRenewableSharePercent',
        'AncillaryMaterialsKilogramsPerTonneProduct',
        'FabricationWaterCubicMetersPerTonneProduct'
    ];
    
    const fabricationProvidedFields = {
        FabricationEnergyKilowattHoursPerTonneProduct: 2500.0,
        ScrapInputPercent: 25.0,
        YieldLossPercent: 5.0
    };
    
    try {
        const fabricationResult = await aiPredictionService.predictStageFields(
            'fabrication',
            projectContext,
            fabricationProvidedFields,
            fabricationMissingFields
        );
        
        if (fabricationResult.success) {
            console.log('✅ Fabrication AI Prediction Successful!');
            console.log('Predictions:', fabricationResult.predictions);
        } else {
            console.log('❌ Fabrication AI Prediction Failed:', fabricationResult.error);
            console.log('Fallback Predictions:', fabricationResult.fallbackPredictions);
        }
    } catch (error) {
        console.error('❌ Fabrication Test Error:', error.message);
    }

    console.log('\n--- Testing Use Phase Stage AI Prediction ---');
    
    const usePhaseMissingFields = [
        'MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit',
        'MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit',
        'ReusePotentialPercent'
    ];
    
    const usePhaseProvidedFields = {
        ProductLifetimeYears: 15.0,
        OperationalEnergyKilowattHoursPerYearPerFunctionalUnit: 500.0,
        FailureRatePercent: 5.0
    };
    
    try {
        const usePhaseResult = await aiPredictionService.predictStageFields(
            'usePhase',
            projectContext,
            usePhaseProvidedFields,
            usePhaseMissingFields
        );
        
        if (usePhaseResult.success) {
            console.log('✅ Use Phase AI Prediction Successful!');
            console.log('Predictions:', usePhaseResult.predictions);
        } else {
            console.log('❌ Use Phase AI Prediction Failed:', usePhaseResult.error);
            console.log('Fallback Predictions:', usePhaseResult.fallbackPredictions);
        }
    } catch (error) {
        console.error('❌ Use Phase Test Error:', error.message);
    }

    console.log('\n--- Testing End-of-Life Stage AI Prediction ---');
    
    const endOfLifeMissingFields = [
        'TransportDistanceKilometersToRecycler',
        'DowncyclingFractionPercent',
        'LandfillSharePercent'
    ];
    
    const endOfLifeProvidedFields = {
        CollectionRatePercent: 85.0,
        RecyclingEfficiencyPercent: 90.0,
        RecyclingEnergyKilowattHoursPerTonneRecycled: 800.0
    };
    
    try {
        const endOfLifeResult = await aiPredictionService.predictStageFields(
            'endOfLife',
            projectContext,
            endOfLifeProvidedFields,
            endOfLifeMissingFields
        );
        
        if (endOfLifeResult.success) {
            console.log('✅ End-of-Life AI Prediction Successful!');
            console.log('Predictions:', endOfLifeResult.predictions);
        } else {
            console.log('❌ End-of-Life AI Prediction Failed:', endOfLifeResult.error);
            console.log('Fallback Predictions:', endOfLifeResult.fallbackPredictions);
        }
    } catch (error) {
        console.error('❌ End-of-Life Test Error:', error.message);
    }

    console.log('\n--- Service Status ---');
    console.log('AI Enabled:', aiPredictionService.isEnabled());
    console.log('API Key Set:', !!process.env.GEMINI_API_KEY);
    console.log('Model:', process.env.GEMINI_MODEL || 'gemini-pro');
}

// Run the test
testAIService().catch(console.error);