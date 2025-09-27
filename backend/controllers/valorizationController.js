const ValorizationScenario = require('../models/valorizationScenarioModel');
const Project = require('../models/projectModel');
const ValorizationService = require('../services/valorizationService');
const ByproductExtractionService = require('../services/byproductExtractionService');
const mongoose = require('mongoose');

/**
 * Analyze byproducts for valorization opportunities
 * POST /api/valorization/:ProjectIdentifier/analyze
 */
const analyzeByproductValorization = async (req, res) => {
  try {
    const { ProjectIdentifier } = req.params;
    const { byproductNames, constraints } = req.body;
    
    // Validate ProjectIdentifier
    if (!mongoose.Types.ObjectId.isValid(ProjectIdentifier)) {
      return res.status(400).json({ error: 'Invalid Project Identifier' });
    }
    
    // Validate project exists
    const project = await Project.findById(ProjectIdentifier);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Prepare project context
    const projectContext = {
      ProjectIdentifier,
      ProjectName: project.ProjectName,
      MetalType: project.MetalType,
      ProcessingMode: project.ProcessingMode,
      FunctionalUnitMassTonnes: project.FunctionalUnitMassTonnes
    };
    
    // Initialize services
    const valorizationService = new ValorizationService();
    const extractionService = new ByproductExtractionService();
    
    // Extract byproducts from project stages
    let byproductsToAnalyze;
    
    if (byproductNames && byproductNames.length > 0) {
      // Analyze specific byproducts
      const stageByproductMap = {};
      
      // Group byproducts by stage (if provided with stage info)
      for (const byproductName of byproductNames) {
        // For simplicity, check all stages for the byproduct
        const allByproducts = await extractionService.extractProjectByproducts(ProjectIdentifier);
        const found = allByproducts.find(bp => bp.ByproductName === byproductName);
        
        if (found) {
          if (!stageByproductMap[found.StageName]) {
            stageByproductMap[found.StageName] = [];
          }
          stageByproductMap[found.StageName].push(byproductName);
        }
      }
      
      byproductsToAnalyze = await extractionService.getSpecificByproducts(ProjectIdentifier, stageByproductMap);
    } else {
      // Analyze all byproducts
      byproductsToAnalyze = await extractionService.extractProjectByproducts(ProjectIdentifier);
    }
    
    if (byproductsToAnalyze.length === 0) {
      return res.status(404).json({ 
        error: 'No byproducts found for analysis',
        availableStages: ['Mining', 'Concentration', 'Smelting and Refining', 'Fabrication', 'Use Phase', 'End of Life']
      });
    }
    
    // Prepare stage contexts
    const stageContexts = {};
    const uniqueStages = [...new Set(byproductsToAnalyze.map(bp => bp.StageName))];
    
    for (const stageName of uniqueStages) {
      const kpis = await extractionService.getStageKPIs(ProjectIdentifier, stageName);
      stageContexts[stageName] = {
        StageName: stageName,
        kpis: kpis
      };
    }
    
    // Analyze byproducts using Gemini
    const analysisResults = await valorizationService.analyzeBatchByproducts(
      byproductsToAnalyze,
      projectContext,
      stageContexts,
      constraints || {}
    );
    
    // Save successful analyses to database
    const savedScenarios = [];
    const failedAnalyses = [];
    
    for (const result of analysisResults) {
      if (result.success && result.analysis) {
        try {
          // Check if scenario already exists
          const existingScenario = await ValorizationScenario.findOne({
            ProjectIdentifier,
            StageName: result.StageName,
            ByproductName: result.ByproductName
          });
          
          if (existingScenario) {
            // Update existing scenario
            existingScenario.GeminiAnalysis = result.analysis;
            existingScenario.ComputationMetadata = {
              PromptVersion: result.analysis.Provenance.PromptVersion,
              ModelName: result.analysis.Provenance.ModelName,
              GeneratedAtUtc: result.analysis.Provenance.GeneratedAtUtc,
              ApiLatencyMs: result.latency
            };
            existingScenario.FieldSources.set('GeminiAnalysis', 'ai-predicted');
            
            await existingScenario.save();
            savedScenarios.push(existingScenario);
          } else {
            // Create new scenario
            const newScenario = new ValorizationScenario({
              ProjectIdentifier,
              StageName: result.StageName,
              ByproductName: result.ByproductName,
              MassTonnesPerFunctionalUnit: result.analysis.MassTonnesPerFunctionalUnit,
              GeminiAnalysis: result.analysis,
              ComputationMetadata: {
                PromptVersion: result.analysis.Provenance.PromptVersion,
                ModelName: result.analysis.Provenance.ModelName,
                GeneratedAtUtc: result.analysis.Provenance.GeneratedAtUtc,
                ApiLatencyMs: result.latency
              }
            });
            
            newScenario.FieldSources.set('MassTonnesPerFunctionalUnit', 'user');
            newScenario.FieldSources.set('GeminiAnalysis', 'ai-predicted');
            
            await newScenario.save();
            savedScenarios.push(newScenario);
          }
        } catch (saveError) {
          console.error(`Error saving scenario for ${result.ByproductName}:`, saveError);
          failedAnalyses.push({
            ByproductName: result.ByproductName,
            StageName: result.StageName,
            error: 'Failed to save to database'
          });
        }
      } else {
        failedAnalyses.push({
          ByproductName: result.ByproductName,
          StageName: result.StageName,
          error: result.error || 'Analysis failed'
        });
      }
    }
    
    // Prepare response
    const responseData = {
      projectContext,
      totalByproductsAnalyzed: byproductsToAnalyze.length,
      successfulAnalyses: savedScenarios.length,
      failedAnalyses: failedAnalyses.length,
      scenarios: savedScenarios.map(scenario => ({
        _id: scenario._id,
        StageName: scenario.StageName,
        ByproductName: scenario.ByproductName,
        MassTonnesPerFunctionalUnit: scenario.MassTonnesPerFunctionalUnit,
        TopApplication: scenario.GeminiAnalysis.SuggestedApplications[0] || null,
        OverallRecommendation: scenario.GeminiAnalysis.OverallRecommendationSummary,
        AggregateBenefits: scenario.GeminiAnalysis.ScenarioAggregateBenefits,
        CreatedAtUtc: scenario.CreatedAtUtc
      }))
    };
    
    if (failedAnalyses.length > 0) {
      responseData.failedAnalyses = failedAnalyses;
    }
    
    res.status(201).json(responseData);
    
  } catch (error) {
    console.error('Error analyzing byproduct valorization:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

/**
 * Get all valorization scenarios for a project
 * GET /api/valorization/:ProjectIdentifier
 */
const getProjectValorizationScenarios = async (req, res) => {
  try {
    const { ProjectIdentifier } = req.params;
    console.log('🔍 getProjectValorizationScenarios called for project:', ProjectIdentifier);
    console.log('📋 Request details:', {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
    
    // Validate ProjectIdentifier
    if (!mongoose.Types.ObjectId.isValid(ProjectIdentifier)) {
      console.log('❌ Invalid Project Identifier:', ProjectIdentifier);
      return res.status(400).json({ error: 'Invalid Project Identifier' });
    }
    
    // Validate project exists
    const project = await Project.findById(ProjectIdentifier);
    if (!project) {
      console.log('❌ Project not found:', ProjectIdentifier);
      return res.status(404).json({ error: 'Project not found' });
    }
    console.log('✅ Project found:', project.ProjectName);
    
    // Find all scenarios for this project
    const scenarios = await ValorizationScenario.find({ ProjectIdentifier })
      .sort({ CreatedAtUtc: -1 });
    
    console.log(`📊 Found ${scenarios.length} scenarios for project`);
    
    if (scenarios.length === 0) {
      return res.status(200).json({
        message: 'No valorization scenarios found for this project',
        scenarios: []
      });
    }
    
    // Transform scenarios for frontend consumption
    const transformedScenarios = scenarios.map(scenario => ({
      _id: scenario._id,
      StageName: scenario.StageName,
      ByproductName: scenario.ByproductName,
      MassTonnesPerFunctionalUnit: scenario.MassTonnesPerFunctionalUnit,
      TopApplication: {
        ApplicationName: scenario.GeminiAnalysis.SuggestedApplications[0]?.ApplicationName || 'No applications',
        TechnicalFeasibilityRating: scenario.GeminiAnalysis.SuggestedApplications[0]?.TechnicalFeasibilityRating || 'Unknown',
        ConfidenceScorePercent: scenario.GeminiAnalysis.SuggestedApplications[0]?.ConfidenceScorePercent || 0
      },
      AggregateBenefits: {
        TotalAvoidedEmissionsKilogramsCO2e: scenario.GeminiAnalysis.ScenarioAggregateBenefits.TotalAvoidedEmissionsKilogramsCO2e,
        TotalPotentialRevenueUsd: scenario.GeminiAnalysis.ScenarioAggregateBenefits.TotalPotentialRevenueUsd,
        EstimatedNetBenefitUsd: scenario.GeminiAnalysis.ScenarioAggregateBenefits.EstimatedNetBenefitUsd
      },
      OverallRecommendation: scenario.GeminiAnalysis.OverallRecommendationSummary,
      AnalysisMetadata: {
        ModelName: scenario.ComputationMetadata.ModelName,
        GeneratedAtUtc: scenario.ComputationMetadata.GeneratedAtUtc,
        PromptVersion: scenario.ComputationMetadata.PromptVersion
      },
      CreatedAtUtc: scenario.CreatedAtUtc,
      UpdatedAtUtc: scenario.UpdatedAtUtc
    }));
    
    // Group scenarios by stage
    const scenariosByStage = transformedScenarios.reduce((acc, scenario) => {
      if (!acc[scenario.StageName]) {
        acc[scenario.StageName] = [];
      }
      acc[scenario.StageName].push(scenario);
      return acc;
    }, {});
    
    res.status(200).json({
      projectName: project.ProjectName,
      totalScenarios: scenarios.length,
      scenariosByStage,
      scenarios: transformedScenarios
    });
    
  } catch (error) {
    console.error('Error fetching valorization scenarios:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

/**
 * Get detailed valorization scenario
 * GET /api/valorization/:ProjectIdentifier/:ScenarioId
 */
const getValorizationScenarioDetail = async (req, res) => {
  try {
    const { ProjectIdentifier, ScenarioId } = req.params;
    
    // Validate identifiers
    if (!mongoose.Types.ObjectId.isValid(ProjectIdentifier) || 
        !mongoose.Types.ObjectId.isValid(ScenarioId)) {
      return res.status(400).json({ error: 'Invalid identifier format' });
    }
    
    // Find the specific scenario
    const scenario = await ValorizationScenario.findOne({
      _id: ScenarioId,
      ProjectIdentifier: ProjectIdentifier
    });
    
    if (!scenario) {
      return res.status(404).json({ error: 'Valorization scenario not found' });
    }
    
    // Return detailed scenario data
    res.status(200).json({
      _id: scenario._id,
      ProjectIdentifier: scenario.ProjectIdentifier,
      StageName: scenario.StageName,
      ByproductName: scenario.ByproductName,
      MassTonnesPerFunctionalUnit: scenario.MassTonnesPerFunctionalUnit,
      DetailedAnalysis: scenario.GeminiAnalysis,
      FieldSources: Object.fromEntries(scenario.FieldSources),
      ComputationMetadata: scenario.ComputationMetadata,
      CreatedAtUtc: scenario.CreatedAtUtc,
      UpdatedAtUtc: scenario.UpdatedAtUtc
    });
    
  } catch (error) {
    console.error('Error fetching valorization scenario detail:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

/**
 * Delete valorization scenario
 * DELETE /api/valorization/:ProjectIdentifier/:ScenarioId
 */
const deleteValorizationScenario = async (req, res) => {
  try {
    const { ProjectIdentifier, ScenarioId } = req.params;
    
    // Validate identifiers
    if (!mongoose.Types.ObjectId.isValid(ProjectIdentifier) || 
        !mongoose.Types.ObjectId.isValid(ScenarioId)) {
      return res.status(400).json({ error: 'Invalid identifier format' });
    }
    
    // Find and delete the scenario
    const deletedScenario = await ValorizationScenario.findOneAndDelete({
      _id: ScenarioId,
      ProjectIdentifier: ProjectIdentifier
    });
    
    if (!deletedScenario) {
      return res.status(404).json({ error: 'Valorization scenario not found' });
    }
    
    res.status(200).json({
      message: 'Valorization scenario deleted successfully',
      deletedScenario: {
        _id: deletedScenario._id,
        StageName: deletedScenario.StageName,
        ByproductName: deletedScenario.ByproductName
      }
    });
    
  } catch (error) {
    console.error('Error deleting valorization scenario:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

/**
 * Get available byproducts for a project (without analysis)
 * GET /api/valorization/:ProjectIdentifier/available-byproducts
 */
const getAvailableByproducts = async (req, res) => {
  try {
    const { ProjectIdentifier } = req.params;
    console.log('🔍 getAvailableByproducts called for project:', ProjectIdentifier);
    console.log('📋 Request details:', {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
    
    // Validate ProjectIdentifier
    if (!mongoose.Types.ObjectId.isValid(ProjectIdentifier)) {
      console.log('❌ Invalid Project Identifier:', ProjectIdentifier);
      return res.status(400).json({ error: 'Invalid Project Identifier' });
    }
    
    // Validate project exists
    const project = await Project.findById(ProjectIdentifier);
    if (!project) {
      console.log('❌ Project not found:', ProjectIdentifier);
      return res.status(404).json({ error: 'Project not found' });
    }
    console.log('✅ Project found:', project.ProjectName);
    
    // Extract available byproducts
    const extractionService = new ByproductExtractionService();
    console.log('Extracting byproducts for project...');
    const availableByproducts = await extractionService.extractProjectByproducts(ProjectIdentifier);
    console.log('Found byproducts:', availableByproducts.length);
    
    // Group by stage
    const byproductsByStage = availableByproducts.reduce((acc, byproduct) => {
      if (!acc[byproduct.StageName]) {
        acc[byproduct.StageName] = [];
      }
      acc[byproduct.StageName].push({
        ByproductName: byproduct.ByproductName,
        MassTonnesPerFunctionalUnit: byproduct.MassTonnesPerFunctionalUnit,
        hasProperties: !!byproduct.measuredProperties
      });
      return acc;
    }, {});
    
    res.status(200).json({
      projectName: project.ProjectName,
      totalByproducts: availableByproducts.length,
      byproductsByStage,
      supportedStages: Object.keys(byproductsByStage)
    });
    
  } catch (error) {
    console.error('Error fetching available byproducts:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

/**
 * Update valorization scenario (re-analyze with new constraints)
 * PUT /api/valorization/:ProjectIdentifier/:ScenarioId
 */
const updateValorizationScenario = async (req, res) => {
  try {
    const { ProjectIdentifier, ScenarioId } = req.params;
    const { constraints } = req.body;
    
    // Validate identifiers
    if (!mongoose.Types.ObjectId.isValid(ProjectIdentifier) || 
        !mongoose.Types.ObjectId.isValid(ScenarioId)) {
      return res.status(400).json({ error: 'Invalid identifier format' });
    }
    
    // Find existing scenario
    const existingScenario = await ValorizationScenario.findOne({
      _id: ScenarioId,
      ProjectIdentifier: ProjectIdentifier
    });
    
    if (!existingScenario) {
      return res.status(404).json({ error: 'Valorization scenario not found' });
    }
    
    // Get project context
    const project = await Project.findById(ProjectIdentifier);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectContext = {
      ProjectIdentifier,
      ProjectName: project.ProjectName,
      MetalType: project.MetalType,
      ProcessingMode: project.ProcessingMode,
      FunctionalUnitMassTonnes: project.FunctionalUnitMassTonnes
    };
    
    // Prepare byproduct data for re-analysis
    const byproductData = {
      StageName: existingScenario.StageName,
      ByproductName: existingScenario.ByproductName,
      MassTonnesPerFunctionalUnit: existingScenario.MassTonnesPerFunctionalUnit,
      measuredProperties: null // Could be enhanced to store original properties
    };
    
    // Get stage context
    const extractionService = new ByproductExtractionService();
    const kpis = await extractionService.getStageKPIs(ProjectIdentifier, existingScenario.StageName);
    const stageContext = {
      StageName: existingScenario.StageName,
      kpis: kpis
    };
    
    // Re-analyze with new constraints
    const valorizationService = new ValorizationService();
    const analysisResult = await valorizationService.generateByproductAnalysis(
      byproductData,
      projectContext,
      stageContext,
      constraints || {}
    );
    
    if (!analysisResult.success) {
      return res.status(500).json({
        error: 'Failed to re-analyze scenario',
        details: analysisResult.error
      });
    }
    
    // Update scenario with new analysis
    existingScenario.GeminiAnalysis = analysisResult.analysis;
    existingScenario.ComputationMetadata = {
      PromptVersion: analysisResult.analysis.Provenance.PromptVersion,
      ModelName: analysisResult.analysis.Provenance.ModelName,
      GeneratedAtUtc: analysisResult.analysis.Provenance.GeneratedAtUtc,
      ApiLatencyMs: analysisResult.latency
    };
    
    await existingScenario.save();
    
    res.status(200).json({
      message: 'Valorization scenario updated successfully',
      scenario: {
        _id: existingScenario._id,
        StageName: existingScenario.StageName,
        ByproductName: existingScenario.ByproductName,
        UpdatedAnalysis: existingScenario.GeminiAnalysis,
        UpdatedAtUtc: existingScenario.UpdatedAtUtc
      }
    });
    
  } catch (error) {
    console.error('Error updating valorization scenario:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

module.exports = {
  analyzeByproductValorization,
  getProjectValorizationScenarios,
  getValorizationScenarioDetail,
  deleteValorizationScenario,
  getAvailableByproducts,
  updateValorizationScenario
};