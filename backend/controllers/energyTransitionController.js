const EnergyTransitionScenario = require('../models/energyTransitionScenarioModel');
const Project = require('../models/projectModel');
const emissionFactorStore = require('../utils/emissionFactorStore');
const renewableInsightsService = require('../services/renewableInsightsService');

// Get stage configuration based on stage name
const getStageConfig = (stageName) => {
  const stageConfigs = {
    'Mining': {
      model: require('../models/miningStageModel'),
      endpoint: 'mining'
    },
    'Concentration': {
      model: require('../models/concentrationStageModel'),
      endpoint: 'concentration'
    },
    'Smelting and Refining': {
      model: require('../models/smeltingStageModel'),
      endpoint: 'smelting'
    },
    'Fabrication': {
      model: require('../models/fabricationStageModel'),
      endpoint: 'fabrication'
    },
    'Use Phase': {
      model: require('../models/usePhaseStageModel'),
      endpoint: 'use-phase'
    },
    'End of Life': {
      model: require('../models/endOfLifeStageModel'),
      endpoint: 'end-of-life'
    }
  };
  
  return stageConfigs[stageName];
};

// Calculate carbon footprint based on energy mix
const calculateCarbonFootprint = (electricityConsumption, fuelConsumption, energyMix, emissionFactors) => {
  // Baseline calculation
  if (!energyMix) {
    return electricityConsumption * emissionFactors.gridElectricity + 
           fuelConsumption * emissionFactors.fossilFuel;
  }
  
  // Scenario calculation with renewable energy mix
  const renewableEmissionFactor = 
    (energyMix.solar || 0) / 100 * (emissionFactors.solar || 0) +
    (energyMix.wind || 0) / 100 * (emissionFactors.wind || 0) +
    (energyMix.hydro || 0) / 100 * (emissionFactors.hydro || 0) +
    (energyMix.geothermal || 0) / 100 * (emissionFactors.geothermal || 0) +
    (energyMix.biomass || 0) / 100 * (emissionFactors.biomass || 0) +
    (energyMix.grid || 0) / 100 * (emissionFactors.gridElectricity || 0);
    
  return electricityConsumption * renewableEmissionFactor + 
         fuelConsumption * emissionFactors.fossilFuel;
};

// Create a new energy transition scenario
const createEnergyTransitionScenario = async (req, res) => {
  try {
    const { ProjectIdentifier, StageName } = req.params;
    const { RenewableSharePercent, FossilSharePercent, EnergySourceMix } = req.body;
    
    // Validate project exists
    const project = await Project.findById(ProjectIdentifier);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Prepare project context for AI insights
    const projectContext = {
      ProjectName: project.ProjectName,
      MetalType: project.MetalType,
      ProcessingMode: project.ProcessingMode,
      FunctionalUnitMassTonnes: project.FunctionalUnitMassTonnes
    };
    
    // Validate stage name
    const validStages = ['Mining', 'Concentration', 'Smelting and Refining', 'Fabrication', 'Use Phase', 'End of Life'];
    if (!validStages.includes(StageName)) {
      return res.status(400).json({ error: 'Invalid stage name' });
    }
    
    // Validate energy mix percentages
    if (RenewableSharePercent + FossilSharePercent !== 100) {
      return res.status(400).json({ error: 'RenewableSharePercent and FossilSharePercent must add up to 100' });
    }
    
    // Get stage configuration
    const stageConfig = getStageConfig(StageName);
    if (!stageConfig) {
      return res.status(400).json({ error: 'Invalid stage name' });
    }
    
    // Fetch stage data via API endpoint
    let stageData;
    try {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const response = await fetch(`${baseUrl}/api/${stageConfig.endpoint}/${ProjectIdentifier}`);
      if (!response.ok) {
        return res.status(404).json({ error: `No data found for stage: ${StageName}` });
      }
      
      stageData = await response.json();
      if (!stageData) {
        return res.status(404).json({ error: `No data found for stage: ${StageName}` });
      }
    } catch (error) {
      console.error(`Error fetching data for stage ${StageName}:`, error);
      return res.status(500).json({ error: `Failed to fetch data for stage: ${StageName}` });
    }
    
    // Extract electricity and fuel consumption from stage data
    // The API response format might be different, so we need to check the structure
    const data = stageData.data || stageData; // Handle both possible response formats
    let electricityConsumption, fuelConsumption, baselineFuelSharePercent;
    
    switch (StageName) {
      case 'Smelting and Refining':
        // For smelting, we calculate electricity consumption based on the energy input
        electricityConsumption = data.Inputs?.SmeltEnergyKilowattHoursPerTonneMetal || 0;
        // Fuel consumption is based on coke use
        fuelConsumption = data.Inputs?.CokeUseKilogramsPerTonneMetal || 0;
        // Fuel share percent
        baselineFuelSharePercent = data.Inputs?.FuelSharePercent || 0;
        break;
      case 'Fabrication':
        electricityConsumption = data.Inputs?.FabricationEnergyKilowattHoursPerTonneProduct || 0;
        // For fabrication, we'll assume fuel consumption is minimal or zero
        fuelConsumption = 0;
        // For fabrication, we can use the renewable share if available
        baselineFuelSharePercent = 100 - (data.Inputs?.FabricationElectricityRenewableSharePercent || 0);
        break;
      case 'Mining':
        electricityConsumption = data.Inputs?.ElectricityUseKilowattHoursPerTonneOre || 0;
        fuelConsumption = data.Inputs?.DieselUseLitersPerTonneOre || 0;
        // For mining, we'll assume a default fuel share if not specified
        baselineFuelSharePercent = data.Inputs?.FuelSharePercent || 50; // Default value
        break;
      case 'Concentration':
        electricityConsumption = data.Inputs?.GrindingEnergyKilowattHoursPerTonneConcentrate || 0;
        // For concentration, we'll assume fuel consumption is minimal or zero
        fuelConsumption = 0;
        // For concentration, we'll assume a default fuel share if not specified
        baselineFuelSharePercent = 100; // Default value - mostly electric
        break;
      case 'Use Phase':
        electricityConsumption = data.Inputs?.OperationalEnergyKilowattHoursPerYearPerFunctionalUnit || 0;
        // For use phase, we'll assume fuel consumption is minimal or zero
        fuelConsumption = 0;
        // For use phase, we'll assume a default fuel share if not specified
        baselineFuelSharePercent = 100; // Default value - mostly electric
        break;
      case 'End of Life':
        electricityConsumption = data.Inputs?.RecyclingEnergyKilowattHoursPerTonneRecycled || 0;
        // For end of life, we'll assume fuel consumption is minimal or zero
        fuelConsumption = 0;
        // Transport might use fuel, but we'll keep it simple for now
        baselineFuelSharePercent = 100; // Default value - mostly electric
        break;
      default:
        electricityConsumption = 0;
        fuelConsumption = 0;
        baselineFuelSharePercent = 0;
    }
    
    // Get emission factors
    const emissionFactors = emissionFactorStore.getFactors();
    
    // Calculate baseline carbon footprint
    const baselineCarbonFootprint = calculateCarbonFootprint(
      electricityConsumption,
      fuelConsumption,
      null, // baseline uses grid electricity
      emissionFactors
    );
    
    // Prepare energy source mix (use defaults if not provided)
    const energySourceMix = EnergySourceMix || {
      grid: FossilSharePercent,
      solar: RenewableSharePercent * 0.4, // 40% of renewable
      wind: RenewableSharePercent * 0.3,  // 30% of renewable
      hydro: RenewableSharePercent * 0.2, // 20% of renewable
      geothermal: RenewableSharePercent * 0.05, // 5% of renewable
      biomass: RenewableSharePercent * 0.05  // 5% of renewable
    };
    
    // Calculate scenario carbon footprint
    const scenarioCarbonFootprint = calculateCarbonFootprint(
      electricityConsumption,
      fuelConsumption,
      energySourceMix,
      emissionFactors
    );
    
    // Calculate carbon reduction percentage
    const carbonReductionPercent = baselineCarbonFootprint > 0 ? 
      ((baselineCarbonFootprint - scenarioCarbonFootprint) / baselineCarbonFootprint) * 100 : 0;
    
    // Create energy transition scenario document
    const energyTransitionScenario = new EnergyTransitionScenario({
      ProjectIdentifier,
      StageName,
      BaselineElectricityConsumptionKilowattHoursPerFunctionalUnit: electricityConsumption,
      BaselineFuelSharePercent: baselineFuelSharePercent,
      UserScenario: {
        RenewableSharePercent,
        FossilSharePercent,
        EnergySourceMix: energySourceMix
      },
      Outputs: {
        BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit: baselineCarbonFootprint,
        ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit: scenarioCarbonFootprint,
        CarbonReductionPercent: parseFloat(carbonReductionPercent.toFixed(1))
      }
    });
    
    // Save to database
    await energyTransitionScenario.save();
    
    // Prepare scenario data for AI insights
    const scenarioData = {
      StageName,
      BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit: baselineCarbonFootprint,
      ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit: scenarioCarbonFootprint,
      CarbonReductionPercent: parseFloat(carbonReductionPercent.toFixed(1)),
      UserScenario: {
        RenewableSharePercent,
        FossilSharePercent,
        EnergySourceMix: energySourceMix
      }
    };
    
    // Generate AI insights
    let aiInsights = null;
    try {
      const insightResult = await renewableInsightsService.generateRenewableInsights(scenarioData, projectContext);
      if (insightResult.success) {
        aiInsights = insightResult.insights;
      } else if (insightResult.fallbackInsights) {
        aiInsights = insightResult.fallbackInsights;
      }
    } catch (insightError) {
      console.warn('Failed to generate AI insights:', insightError.message);
    }
    
    // Return response
    res.status(201).json({
      StageName,
      BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit: baselineCarbonFootprint,
      ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit: scenarioCarbonFootprint,
      CarbonReductionPercent: parseFloat(carbonReductionPercent.toFixed(1)),
      UserScenario: {
        RenewableSharePercent,
        FossilSharePercent,
        EnergySourceMix: energySourceMix
      },
      AIInsights: aiInsights
    });
  } catch (error) {
    console.error('Error creating energy transition scenario:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all energy transition scenarios for a project
const getEnergyTransitionScenarios = async (req, res) => {
  try {
    const { ProjectIdentifier } = req.params;
    
    // Validate project exists
    const project = await Project.findById(ProjectIdentifier);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Prepare project context for AI insights
    const projectContext = {
      ProjectName: project.ProjectName,
      MetalType: project.MetalType,
      ProcessingMode: project.ProcessingMode,
      FunctionalUnitMassTonnes: project.FunctionalUnitMassTonnes
    };
    
    // Find all scenarios for this project
    const scenarios = await EnergyTransitionScenario.find({ ProjectIdentifier })
      .sort({ CreatedAtUtc: -1 });
    
    // Transform scenarios to match the frontend expected format
    const transformedScenarios = scenarios.map(scenario => ({
      _id: scenario._id,
      StageName: scenario.StageName,
      BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit: scenario.Outputs?.BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit || 0,
      ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit: scenario.Outputs?.ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit || 0,
      CarbonReductionPercent: scenario.Outputs?.CarbonReductionPercent || 0,
      UserScenario: scenario.UserScenario,
      CreatedAtUtc: scenario.CreatedAtUtc,
      UpdatedAtUtc: scenario.UpdatedAtUtc
    }));
    
    res.status(200).json(transformedScenarios);
  } catch (error) {
    console.error('Error fetching energy transition scenarios:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete an energy transition scenario
const deleteEnergyTransitionScenario = async (req, res) => {
  try {
    const { ProjectIdentifier, ScenarioId } = req.params;
    
    // Validate project exists
    const project = await Project.findById(ProjectIdentifier);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Find and delete the specific scenario
    const scenario = await EnergyTransitionScenario.findOneAndDelete({
      _id: ScenarioId,
      ProjectIdentifier: ProjectIdentifier
    });
    
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    res.status(200).json({ message: 'Scenario deleted successfully' });
  } catch (error) {
    console.error('Error deleting energy transition scenario:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createEnergyTransitionScenario,
  getEnergyTransitionScenarios,
  deleteEnergyTransitionScenario
};