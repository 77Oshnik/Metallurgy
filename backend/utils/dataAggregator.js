const MiningStage = require('../models/miningStageModel');
const ConcentrationStage = require('../models/concentrationStageModel');
const SmeltingStage = require('../models/smeltingStageModel');
const FabricationStage = require('../models/fabricationStageModel');
const UsePhaseStage = require('../models/usePhaseStageModel');
const EndOfLifeStage = require('../models/endOfLifeStageModel');

const stageModels = [
    MiningStage,
    ConcentrationStage,
    SmeltingStage,
    FabricationStage,
    UsePhaseStage,
    EndOfLifeStage
];

const aggregateStageData = async (projectId, numberOfStages) => {
    let totalCarbonFootprint = 0;
    let totalEnergyFootprint = 0;
    const allStagesData = {};
    const warnings = [];

    const modelsToQuery = stageModels.slice(0, numberOfStages);

    for (const model of modelsToQuery) {
        const stageData = await model.findOne({ ProjectIdentifier: projectId }).lean();
        if (!stageData) {
            warnings.push(`Data for stage '${model.modelName}' is missing.`);
            continue;
        }

        // Store all inputs and outputs for the current stage
        allStagesData[model.modelName] = {
            Inputs: stageData.Inputs || {},
            Outputs: stageData.Outputs || {}
        };
        
        if (!stageData.Outputs) {
            warnings.push(`Outputs for stage '${model.modelName}' are incomplete.`);
            continue;
        }
        
        // Dynamically find carbon and energy footprint keys in the Outputs object
        const carbonKey = Object.keys(stageData.Outputs).find(k => k && k.toLowerCase().includes('carbon'));
        const energyKey = Object.keys(stageData.Outputs).find(k => k && k.toLowerCase().includes('energy'));

        if (carbonKey && typeof stageData.Outputs[carbonKey] === 'number') {
            totalCarbonFootprint += stageData.Outputs[carbonKey];
        }
        if (energyKey && typeof stageData.Outputs[energyKey] === 'number') {
            totalEnergyFootprint += stageData.Outputs[energyKey];
        }
    }

    return {
        aggregatedOutputs: {
            CarbonFootprint: totalCarbonFootprint,
            EnergyFootprint: totalEnergyFootprint,
            stages: allStagesData,
        },
        warnings,
    };
};

module.exports = { aggregateStageData };
