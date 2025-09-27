const MiningStage = require('../models/miningStageModel');
const ConcentrationStage = require('../models/concentrationStageModel');
const SmeltingStage = require('../models/smeltingStageModel');
const FabricationStage = require('../models/fabricationStageModel');
const UsePhaseStage = require('../models/usePhaseStageModel');
const EndOfLifeStage = require('../models/endOfLifeStageModel');

class ByproductExtractionService {
  /**
   * Extract all byproducts from project stages
   * @param {String} projectId - Project identifier
   * @returns {Array} Array of byproduct data objects
   */
  async extractProjectByproducts(projectId) {
    try {
      const allByproducts = [];
      
      // Extract byproducts from each stage
      const miningByproducts = await this.extractMiningByproducts(projectId);
      const concentrationByproducts = await this.extractConcentrationByproducts(projectId);
      const smeltingByproducts = await this.extractSmeltingByproducts(projectId);
      const fabricationByproducts = await this.extractFabricationByproducts(projectId);
      const usePhaseByproducts = await this.extractUsePhaseByproducts(projectId);
      const endOfLifeByproducts = await this.extractEndOfLifeByproducts(projectId);
      
      allByproducts.push(
        ...miningByproducts,
        ...concentrationByproducts,
        ...smeltingByproducts,
        ...fabricationByproducts,
        ...usePhaseByproducts,
        ...endOfLifeByproducts
      );
      
      return allByproducts.filter(byproduct => byproduct.MassTonnesPerFunctionalUnit > 0);
      
    } catch (error) {
      console.error('Error extracting project byproducts:', error);
      throw error;
    }
  }

  /**
   * Extract byproducts from Mining stage
   */
  async extractMiningByproducts(projectId) {
    try {
      const miningData = await MiningStage.findOne({ ProjectIdentifier: projectId });
      if (!miningData) return [];

      const byproducts = [];
      
      // Calculate ore required for functional unit
      const oreRequired = miningData.Outputs?.OreRequiredTonnesPerFunctionalUnit || 0;
      const oreGrade = miningData.Inputs?.OreGradePercent || 1;
      
      // Waste Rock (assume 90-95% of mined ore becomes waste rock)
      const wasteRockRatio = 0.92; // 92% typical waste rock
      const wasteRockMass = oreRequired * wasteRockRatio;
      
      if (wasteRockMass > 0) {
        byproducts.push({
          StageName: 'Mining',
          ByproductName: 'Waste Rock',
          MassTonnesPerFunctionalUnit: wasteRockMass,
          measuredProperties: {
            typicalComposition: ['SiO2', 'Al2O3', 'Fe2O3', 'CaO', 'MgO'],
            moisturePercent: 5,
            densityKgM3: 2500,
            particleSizeDistribution: 'Mixed (0.1mm to 500mm)',
            pH: 7.5
          }
        });
      }
      
      // Overburden (typically 2-5 times ore extraction)
      const overburdenRatio = 3.5; // 3.5:1 typical ratio
      const overburdenMass = oreRequired * overburdenRatio;
      
      if (overburdenMass > 0) {
        byproducts.push({
          StageName: 'Mining',
          ByproductName: 'Overburden',
          MassTonnesPerFunctionalUnit: overburdenMass,
          measuredProperties: {
            typicalComposition: ['soil', 'clay', 'sand', 'gravel'],
            moisturePercent: 12,
            densityKgM3: 1800,
            organicCarbonPercent: 2.5,
            pH: 6.8
          }
        });
      }
      
      // Mine Water (process and dewatering)
      const waterWithdrawal = miningData.Inputs?.WaterWithdrawalCubicMetersPerTonneOre || 0;
      const mineWaterVolume = waterWithdrawal * oreRequired * 0.3; // 30% becomes contaminated water
      
      if (mineWaterVolume > 0) {
        byproducts.push({
          StageName: 'Mining',
          ByproductName: 'Mine Water',
          MassTonnesPerFunctionalUnit: mineWaterVolume * 1.02, // water density ~1.02 t/m³ (with dissolved solids)
          measuredProperties: {
            pH: 4.2,
            totalDissolvedSolidsPpm: 2500,
            heavyMetalsPpm: {
              Fe: 450,
              Mn: 120,
              Cu: 35,
              Zn: 28
            },
            sulfatesPpm: 1200
          }
        });
      }
      
      return byproducts;
      
    } catch (error) {
      console.error('Error extracting mining byproducts:', error);
      return [];
    }
  }

  /**
   * Extract byproducts from Concentration stage
   */
  async extractConcentrationByproducts(projectId) {
    try {
      const concentrationData = await ConcentrationStage.findOne({ ProjectIdentifier: projectId });
      if (!concentrationData) return [];

      const byproducts = [];
      
      // Tailings (primary byproduct)
      const tailingsMass = concentrationData.Outputs?.TailingsMassTonnesPerFunctionalUnit || 
                          concentrationData.DerivedHelperVariables?.TailingsMassTonnesPerFunctionalUnit || 0;
      
      if (tailingsMass > 0) {
        byproducts.push({
          StageName: 'Concentration',
          ByproductName: 'Tailings',
          MassTonnesPerFunctionalUnit: tailingsMass,
          measuredProperties: {
            typicalComposition: ['SiO2', 'Al2O3', 'Fe2O3', 'S', 'pyrite'],
            moisturePercent: 25,
            particleSizeD50Microns: 35,
            densityKgM3: 1600,
            pH: 8.2,
            sulfurPercent: 12
          }
        });
      }
      
      // Process Water (contaminated with reagents)
      const waterUsed = concentrationData.Inputs?.ConcentrationWaterCubicMetersPerTonneConcentrate || 0;
      const concentrateMass = concentrationData.DerivedHelperVariables?.ConcentrateMassTonnesPerFunctionalUnit || 1;
      const processWaterVolume = waterUsed * concentrateMass * 0.4; // 40% becomes contaminated
      
      if (processWaterVolume > 0) {
        byproducts.push({
          StageName: 'Concentration',
          ByproductName: 'Process Water',
          MassTonnesPerFunctionalUnit: processWaterVolume * 1.05, // water with dissolved reagents
          measuredProperties: {
            pH: 9.5,
            totalDissolvedSolidsPpm: 4500,
            reagentResidualsPpm: 150,
            suspendedSolidsPpm: 800,
            organicsPpm: 45
          }
        });
      }
      
      // Flotation Reagent Residues
      const reagentsUsed = concentrationData.Inputs?.ConcentrationReagentsKilogramsPerTonneConcentrate || 0;
      const reagentResidue = reagentsUsed * concentrateMass * 0.1; // 10% becomes solid residue
      
      if (reagentResidue > 0) {
        byproducts.push({
          StageName: 'Concentration',
          ByproductName: 'Flotation Reagent Residues',
          MassTonnesPerFunctionalUnit: reagentResidue / 1000, // convert kg to tonnes
          measuredProperties: {
            typicalComposition: ['xanthates', 'frothers', 'collectors'],
            moisturePercent: 15,
            organicCarbonPercent: 35,
            pH: 10.2,
            biodegradabilityPercent: 25
          }
        });
      }
      
      return byproducts;
      
    } catch (error) {
      console.error('Error extracting concentration byproducts:', error);
      return [];
    }
  }

  /**
   * Extract byproducts from Smelting and Refining stage
   */
  async extractSmeltingByproducts(projectId) {
    try {
      const smeltingData = await SmeltingStage.findOne({ ProjectIdentifier: projectId });
      if (!smeltingData) return [];

      const byproducts = [];
      
      // Calculate functional unit metal mass (1 tonne by default)
      const metalMass = 1; // tonne
      
      // Slag (major byproduct - typically 1.5-3 tonnes per tonne metal)
      const slagRatio = 2.2; // 2.2 tonnes slag per tonne metal (typical)
      const slagMass = metalMass * slagRatio;
      
      byproducts.push({
        StageName: 'Smelting and Refining',
        ByproductName: 'Slag',
        MassTonnesPerFunctionalUnit: slagMass,
        measuredProperties: {
          typicalComposition: ['CaO', 'SiO2', 'Al2O3', 'FeO', 'MgO'],
          moisturePercent: 0.5,
          densityKgM3: 2800,
          particleSizeDistribution: 'Granulated (0.1-10mm)',
          pH: 11.5,
          hydraulicActivity: 'moderate'
        }
      });
      
      // Flue Gas particulates/dust
      const energyUsed = smeltingData.Inputs?.SmeltEnergyKilowattHoursPerTonneMetal || 0;
      const dustEmissionRate = 0.5; // kg dust per MWh (with emission controls)
      const flueGasDust = (energyUsed / 1000) * dustEmissionRate; // tonnes
      
      if (flueGasDust > 0) {
        byproducts.push({
          StageName: 'Smelting and Refining',
          ByproductName: 'Smelter Dust',
          MassTonnesPerFunctionalUnit: flueGasDust,
          measuredProperties: {
            typicalComposition: ['metal oxides', 'SO2', 'particulates'],
            moisturePercent: 2,
            particleSizeD50Microns: 8,
            metalContentPercent: 15,
            hazardousClassification: 'K061' // EPA classification
          }
        });
      }
      
      // Spent Refractories (periodic replacement)
      const refractoryLifeYears = 3;
      const refractoryMassPerCampaign = metalMass * 0.05; // 5% of metal mass
      const spentRefractoryMass = refractoryMassPerCampaign / refractoryLifeYears; // annualized
      
      byproducts.push({
        StageName: 'Smelting and Refining',
        ByproductName: 'Spent Refractories',
        MassTonnesPerFunctionalUnit: spentRefractoryMass,
        measuredProperties: {
          typicalComposition: ['Al2O3', 'SiO2', 'Cr2O3', 'MgO'],
          moisturePercent: 1,
          densityKgM3: 3200,
          thermalShockResistance: 'degraded',
          metalInfiltrationPercent: 8
        }
      });
      
      // Fluxes consumption residues
      const fluxesUsed = smeltingData.Inputs?.FluxesKilogramsPerTonneMetal || 0;
      const fluxResidues = fluxesUsed * 0.15; // 15% becomes separate residue
      
      if (fluxResidues > 0) {
        byproducts.push({
          StageName: 'Smelting and Refining',
          ByproductName: 'Flux Residues',
          MassTonnesPerFunctionalUnit: fluxResidues / 1000, // convert kg to tonnes
          measuredProperties: {
            typicalComposition: ['CaO', 'CaF2', 'SiO2'],
            moisturePercent: 3,
            pH: 12.8,
            fluorideContentPercent: 25,
            reactivity: 'high'
          }
        });
      }
      
      return byproducts;
      
    } catch (error) {
      console.error('Error extracting smelting byproducts:', error);
      return [];
    }
  }

  /**
   * Extract byproducts from Fabrication stage
   */
  async extractFabricationByproducts(projectId) {
    try {
      const fabricationData = await FabricationStage.findOne({ ProjectIdentifier: projectId });
      if (!fabricationData) return [];

      const byproducts = [];
      
      // Metal Scrap (from yield loss)
      const yieldLoss = fabricationData.Inputs?.YieldLossPercent || 5; // default 5%
      const metalScrapMass = (yieldLoss / 100) * 1; // 1 tonne input
      
      if (metalScrapMass > 0) {
        byproducts.push({
          StageName: 'Fabrication',
          ByproductName: 'Metal Scrap',
          MassTonnesPerFunctionalUnit: metalScrapMass,
          measuredProperties: {
            typicalComposition: ['primary metal', 'alloy elements'],
            moisturePercent: 0.5,
            oxidationLevel: 'minimal',
            contaminationLevel: 'low',
            recycleValuePercent: 85
          }
        });
      }
      
      // Cutting Fluids (contaminated)
      const energyUsed = fabricationData.Inputs?.FabricationEnergyKilowattHoursPerTonneProduct || 0;
      const cuttingFluidRate = 0.5; // liters per MWh
      const contaminatedFluidVolume = (energyUsed / 1000) * cuttingFluidRate / 1000; // m³
      
      if (contaminatedFluidVolume > 0) {
        byproducts.push({
          StageName: 'Fabrication',
          ByproductName: 'Cutting Fluids',
          MassTonnesPerFunctionalUnit: contaminatedFluidVolume * 0.95, // density ~0.95 t/m³
          measuredProperties: {
            typicalComposition: ['mineral oils', 'additives', 'water', 'metal particles'],
            moisturePercent: 25,
            metalParticlesPpm: 850,
            biodegradabilityPercent: 15,
            toxicityLevel: 'moderate'
          }
        });
      }
      
      // Grinding/Machining Sludge
      const sludgeGenerationRate = 0.002; // tonnes sludge per tonne product
      const sludgeMass = sludgeGenerationRate * 1; // per functional unit
      
      byproducts.push({
        StageName: 'Fabrication',
        ByproductName: 'Grinding Sludge',
        MassTonnesPerFunctionalUnit: sludgeMass,
        measuredProperties: {
          typicalComposition: ['metal particles', 'abrasive', 'coolant'],
          moisturePercent: 35,
          metalContentPercent: 45,
          particleSizeD50Microns: 15,
          contaminantLevel: 'moderate'
        }
      });
      
      return byproducts;
      
    } catch (error) {
      console.error('Error extracting fabrication byproducts:', error);
      return [];
    }
  }

  /**
   * Extract byproducts from Use Phase stage
   */
  async extractUsePhaseByproducts(projectId) {
    try {
      const usePhaseData = await UsePhaseStage.findOne({ ProjectIdentifier: projectId });
      if (!usePhaseData) return [];

      const byproducts = [];
      
      // Wear Particles (during operation)
      const serviceLifeYears = usePhaseData.Inputs?.ServiceLifeYears || 20;
      const wearRate = 0.001; // 0.1% mass loss per year typical
      const wearParticlesMass = (wearRate * 1) / serviceLifeYears; // annualized
      
      if (wearParticlesMass > 0) {
        byproducts.push({
          StageName: 'Use Phase',
          ByproductName: 'Wear Particles',
          MassTonnesPerFunctionalUnit: wearParticlesMass,
          measuredProperties: {
            typicalComposition: ['metal particles', 'oxides'],
            particleSizeD50Microns: 2,
            environmentalMobility: 'high',
            bioavailability: 'moderate',
            magnetism: 'ferromagnetic'
          }
        });
      }
      
      // Maintenance Waste
      const maintenanceMaterials = usePhaseData.Inputs?.MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit || 0;
      const maintenanceWasteRate = 0.3; // 30% becomes waste
      const maintenanceWasteMass = (maintenanceMaterials * maintenanceWasteRate) / 1000; // convert to tonnes
      
      if (maintenanceWasteMass > 0) {
        byproducts.push({
          StageName: 'Use Phase',
          ByproductName: 'Maintenance Waste',
          MassTonnesPerFunctionalUnit: maintenanceWasteMass,
          measuredProperties: {
            typicalComposition: ['lubricants', 'seals', 'filters', 'worn parts'],
            mixtureComplexity: 'high',
            contaminationLevel: 'variable',
            reuseabilityPercent: 40
          }
        });
      }
      
      return byproducts;
      
    } catch (error) {
      console.error('Error extracting use phase byproducts:', error);
      return [];
    }
  }

  /**
   * Extract byproducts from End of Life stage
   */
  async extractEndOfLifeByproducts(projectId) {
    try {
      const endOfLifeData = await EndOfLifeStage.findOne({ ProjectIdentifier: projectId });
      if (!endOfLifeData) return [];

      const byproducts = [];
      
      // Shredder Residue (from recycling process)
      const recyclingRate = endOfLifeData.Inputs?.RecyclingRatePercent || 80;
      const shredderResidueRate = 0.15; // 15% of recycled material becomes residue
      const shredderResidueMass = (recyclingRate / 100) * 1 * shredderResidueRate;
      
      if (shredderResidueMass > 0) {
        byproducts.push({
          StageName: 'End of Life',
          ByproductName: 'Shredder Residue',
          MassTonnesPerFunctionalUnit: shredderResidueMass,
          measuredProperties: {
            typicalComposition: ['plastics', 'rubber', 'textiles', 'glass', 'fine metals'],
            moisturePercent: 8,
            calorificValueMJKg: 18,
            heavyMetalsPpm: 250,
            organicContentPercent: 65
          }
        });
      }
      
      // Separation Residues (magnetic/eddy current separation)
      const separationEfficiency = 0.95; // 95% efficiency
      const separationResidueMass = (1 - separationEfficiency) * (recyclingRate / 100) * 1;
      
      if (separationResidueMass > 0) {
        byproducts.push({
          StageName: 'End of Life',
          ByproductName: 'Separation Residues',
          MassTonnesPerFunctionalUnit: separationResidueMass,
          measuredProperties: {
            typicalComposition: ['mixed metals', 'alloys', 'composites'],
            magneticSusceptibility: 'variable',
            densityKgM3: 3500,
            sortabilityRating: 'difficult',
            metalPurityPercent: 75
          }
        });
      }
      
      // Downcycled Materials (lower quality applications)
      const downcyclingFraction = endOfLifeData.Inputs?.DowncyclingFractionPercent || 20;
      const downcycledMass = (downcyclingFraction / 100) * 1;
      
      if (downcycledMass > 0) {
        byproducts.push({
          StageName: 'End of Life',
          ByproductName: 'Downcycled Materials',
          MassTonnesPerFunctionalUnit: downcycledMass,
          measuredProperties: {
            typicalComposition: ['degraded metal', 'impurities'],
            qualityGrade: 'secondary',
            strengthReductionPercent: 25,
            applicationRestrictions: 'non-structural use only',
            marketValueReductionPercent: 40
          }
        });
      }
      
      return byproducts;
      
    } catch (error) {
      console.error('Error extracting end of life byproducts:', error);
      return [];
    }
  }

  /**
   * Get specific byproducts by stage and names
   */
  async getSpecificByproducts(projectId, stageByproductMap) {
    try {
      const allByproducts = await this.extractProjectByproducts(projectId);
      const filteredByproducts = [];
      
      for (const [stageName, byproductNames] of Object.entries(stageByproductMap)) {
        const stageByproducts = allByproducts.filter(bp => 
          bp.StageName === stageName && byproductNames.includes(bp.ByproductName)
        );
        filteredByproducts.push(...stageByproducts);
      }
      
      return filteredByproducts;
      
    } catch (error) {
      console.error('Error getting specific byproducts:', error);
      throw error;
    }
  }

  /**
   * Get stage KPIs for context
   */
  async getStageKPIs(projectId, stageName) {
    try {
      let stageData;
      
      switch (stageName) {
        case 'Mining':
          stageData = await MiningStage.findOne({ ProjectIdentifier: projectId });
          break;
        case 'Concentration':
          stageData = await ConcentrationStage.findOne({ ProjectIdentifier: projectId });
          break;
        case 'Smelting and Refining':
          stageData = await SmeltingStage.findOne({ ProjectIdentifier: projectId });
          break;
        case 'Fabrication':
          stageData = await FabricationStage.findOne({ ProjectIdentifier: projectId });
          break;
        case 'Use Phase':
          stageData = await UsePhaseStage.findOne({ ProjectIdentifier: projectId });
          break;
        case 'End of Life':
          stageData = await EndOfLifeStage.findOne({ ProjectIdentifier: projectId });
          break;
        default:
          return null;
      }
      
      if (!stageData) return null;
      
      // Extract relevant KPIs
      const kpis = {};
      
      if (stageData.Outputs) {
        // Carbon footprint
        const carbonField = Object.keys(stageData.Outputs).find(key => 
          key.includes('CarbonFootprint') && key.includes('PerFunctionalUnit')
        );
        if (carbonField) {
          kpis.CarbonFootprintKilogramsCO2ePerFU = stageData.Outputs[carbonField];
        }
        
        // Energy footprint
        const energyField = Object.keys(stageData.Outputs).find(key => 
          key.includes('EnergyFootprint') && key.includes('PerFunctionalUnit')
        );
        if (energyField) {
          kpis.EnergyDemandMegajoulesPerFU = stageData.Outputs[energyField];
        }
        
        // Water footprint
        const waterField = Object.keys(stageData.Outputs).find(key => 
          key.includes('WaterFootprint') && key.includes('PerFunctionalUnit')
        );
        if (waterField) {
          kpis.WaterFootprintCubicMetersPerFU = stageData.Outputs[waterField];
        }
      }
      
      return kpis;
      
    } catch (error) {
      console.error('Error getting stage KPIs:', error);
      return null;
    }
  }
}

module.exports = ByproductExtractionService;