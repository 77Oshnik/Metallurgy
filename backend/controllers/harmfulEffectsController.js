const mongoose = require('mongoose');
const HarmfulEffectScenario = require('../models/harmfulEffectScenarioModel');
const { classifyValue } = require('../utils/thresholds');
const { getStageModel } = require('../utils/dataAggregator');
const aiPredictionService = require('../services/aiPredictionService');

/**
 * Get stage data for analysis
 */
async function getStageData(projectId, stageName) {
  try {
    const StageModel = getStageModel(stageName);
    if (!StageModel) {
      throw new Error(`Invalid stage name: ${stageName}`);
    }
    
    const stageData = await StageModel.findOne({ ProjectIdentifier: projectId });
    if (!stageData) {
      throw new Error(`No data found for stage: ${stageName} in project: ${projectId}`);
    }
    
    return stageData;
  } catch (error) {
    throw new Error(`Failed to fetch stage data: ${error.message}`);
  }
}

/**
 * Extract inputs and outputs from stage data
 */
function extractStageFields(stageData) {
  const inputs = {};
  const outputs = {};
  
  // Extract inputs
  if (stageData.Inputs) {
    for (const [key, value] of Object.entries(stageData.Inputs)) {
      if (typeof value === 'number') {
        inputs[key] = value;
      }
    }
  }
  
  // Extract outputs
  if (stageData.Outputs) {
    for (const [key, value] of Object.entries(stageData.Outputs)) {
      if (typeof value === 'number') {
        outputs[key] = value;
      }
    }
  }
  
  return { inputs, outputs };
}

/**
 * Compare fields against thresholds
 */
function analyzeThresholds(inputs, outputs) {
  const thresholdResults = {};
  
  // Analyze inputs
  for (const [fieldName, value] of Object.entries(inputs)) {
    thresholdResults[fieldName] = classifyValue(fieldName, value);
  }
  
  // Analyze outputs
  for (const [fieldName, value] of Object.entries(outputs)) {
    thresholdResults[fieldName] = classifyValue(fieldName, value);
  }
  
  return thresholdResults;
}

/**
 * Get fields that exceed medium threshold for AI analysis
 */
function getFieldsForAIAnalysis(thresholdResults) {
  return Object.entries(thresholdResults)
    .filter(([_, severity]) => 
      severity === 'Medium' || 
      severity === 'High' || 
      severity === 'Very High'
    )
    .map(([field, _]) => field);
}

/**
 * Format prompt for Gemini AI analysis with professional metallurgy focus
 */
function formatGeminiPrompt(projectId, stageName, inputs, outputs, thresholdResults, fieldsForAnalysis) {
  // Filter inputs, outputs, and thresholds to only include fields for analysis
  const filteredInputs = {};
  const filteredOutputs = {};
  const filteredThresholds = {};
  
  fieldsForAnalysis.forEach(field => {
    if (inputs.hasOwnProperty(field)) {
      filteredInputs[field] = inputs[field];
    }
    if (outputs.hasOwnProperty(field)) {
      filteredOutputs[field] = outputs[field];
    }
    if (thresholdResults.hasOwnProperty(field)) {
      filteredThresholds[field] = thresholdResults[field];
    }
  });
  
  return `You are an industry consultant specialized in metallurgy and life-cycle assessments.  
We are analyzing harmful effects of metallurgy inputs and outputs that exceed sustainability thresholds.  

Context:  
- Project Identifier: ${projectId}  
- Stage: ${stageName}  
- Inputs: ${JSON.stringify(filteredInputs, null, 2)}  
- Outputs: ${JSON.stringify(filteredOutputs, null, 2)}  
- Threshold Results: ${JSON.stringify(filteredThresholds, null, 2)}  

Task:  
For each field where severity is "Medium", "High", or "Very High":  

1. **Harmful Effects**  
   - Describe 3 harmful effects with technical depth.  
   - Use **quantitative ranges** (%, kWh/t, kg CO₂/t, ppm, etc.) wherever possible.  
   - Relate effects to **industrial metallurgy impacts**: furnace efficiency, slag chemistry, particulate capture efficiency, LCA category indicators.  
   - Each point must be 300 characters or less.

2. **Remedies**  
   - Suggest 3 remedies based on **real metallurgy lifecycle practices**.  
   - Include **procedural detail**: process changes, equipment upgrades, or material substitutions.  
   - Add **expected reduction percentages** or ranges.  
   - Use **industry terminology** (e.g., "Top-gas recycling blast furnace (TGR-BF)", "oxygen-enriched smelting", "dry scrubbing with hydrated lime").  
   - Each point must be 300 characters or less.

3. **Benefits**  
   - Provide 3 benefits of implementing remedies.  
   - Must be **professional, measurable outcomes** tied to KPIs.  
   - Example: "Reduction of 250–400 kg CO₂ per tonne steel", "Lower SO₂ emissions below 200 mg/Nm³", "Improved metal recovery efficiency from 92% → 96%".  
   - Each point must be 300 characters or less.

### Response Format (JSON):
{
  "GeminiAnalysis": [
    {
      "Field": "NameOfField",
      "Severity": "Medium | High | Very High",
      "HarmfulEffects": [
        "Effect 1 (with quantitative and technical explanation - max 300 characters)",
        "Effect 2 (max 300 characters)",
        "Effect 3 (max 300 characters)"
      ],
      "Remedies": [
        "Remedy 1 (with procedural detail + expected reduction % - max 300 characters)",
        "Remedy 2 (max 300 characters)",
        "Remedy 3 (max 300 characters)"
      ],
      "Benefits": [
        "Benefit 1 (with quantified KPIs or ranges - max 300 characters)",
        "Benefit 2 (max 300 characters)",
        "Benefit 3 (max 300 characters)"
      ]
    }
  ]
}`;
}

/**
 * Analyze harmful effects for a specific stage
 */
async function analyzeHarmfulEffects(req, res) {
  try {
    const { ProjectIdentifier, StageName } = req.params;
    
    // Validate ProjectIdentifier
    if (!mongoose.Types.ObjectId.isValid(ProjectIdentifier)) {
      return res.status(400).json({ error: 'Invalid Project Identifier' });
    }
    
    // Validate StageName
    const validStages = ['Mining', 'Concentration', 'Smelting and Refining', 'Fabrication', 'Use Phase', 'End of Life'];
    if (!validStages.includes(StageName)) {
      return res.status(400).json({ error: 'Invalid Stage Name' });
    }
    
    // Get stage data
    const stageData = await getStageData(ProjectIdentifier, StageName);
    
    // Extract inputs and outputs
    const { inputs, outputs } = extractStageFields(stageData);
    
    // Analyze thresholds
    const thresholdResults = analyzeThresholds(inputs, outputs);
    
    // Get fields requiring AI analysis
    const fieldsForAnalysis = getFieldsForAIAnalysis(thresholdResults);
    
    // Prepare Gemini AI analysis
    let geminiAnalysis = [];
    
    if (fieldsForAnalysis.length > 0 && aiPredictionService.isEnabled()) {
      try {
        const prompt = formatGeminiPrompt(
          ProjectIdentifier, 
          StageName, 
          inputs, 
          outputs, 
          thresholdResults, 
          fieldsForAnalysis
        );
        
        // Use the Gemini model from aiPredictionService
        const result = await aiPredictionService.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse Gemini response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          geminiAnalysis = parsedResponse.GeminiAnalysis || [];
        }
      } catch (aiError) {
        console.error('Gemini AI analysis failed:', aiError);
        // Continue without AI analysis if it fails
      }
    }
    
    // Create scenario document
    const scenario = new HarmfulEffectScenario({
      ProjectIdentifier,
      StageName,
      InputsAnalyzed: inputs,
      OutputsAnalyzed: outputs,
      ThresholdResults: thresholdResults,
      GeminiAnalysis: geminiAnalysis
    });
    
    // Save scenario
    await scenario.save();
    
    // Return results with all required fields
    res.status(200).json({
      _id: scenario._id,
      ProjectIdentifier,
      StageName,
      InputsAnalyzed: inputs,
      OutputsAnalyzed: outputs,
      ThresholdResults: thresholdResults,
      GeminiAnalysis: geminiAnalysis,
      CreatedAtUtc: scenario.CreatedAtUtc,
      UpdatedAtUtc: scenario.UpdatedAtUtc
    });
  } catch (error) {
    console.error('Harmful effects analysis error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all harmful effect scenarios for a project
 */
async function getProjectHarmfulEffectScenarios(req, res) {
  try {
    const { ProjectIdentifier } = req.params;
    
    // Validate ProjectIdentifier
    if (!mongoose.Types.ObjectId.isValid(ProjectIdentifier)) {
      return res.status(400).json({ error: 'Invalid Project Identifier' });
    }
    
    const scenarios = await HarmfulEffectScenario.find({ ProjectIdentifier })
      .sort({ CreatedAtUtc: -1 });
    
    res.status(200).json(scenarios);
  } catch (error) {
    console.error('Get scenarios error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get a specific harmful effect scenario
 */
async function getHarmfulEffectScenario(req, res) {
  try {
    const { ProjectIdentifier, ScenarioId } = req.params;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(ProjectIdentifier) || 
        !mongoose.Types.ObjectId.isValid(ScenarioId)) {
      return res.status(400).json({ error: 'Invalid identifiers' });
    }
    
    const scenario = await HarmfulEffectScenario.findOne({
      _id: ScenarioId,
      ProjectIdentifier
    });
    
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    res.status(200).json(scenario);
  } catch (error) {
    console.error('Get scenario error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a specific harmful effect scenario
 */
async function deleteHarmfulEffectScenario(req, res) {
  try {
    const { ProjectIdentifier, ScenarioId } = req.params;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(ProjectIdentifier) || 
        !mongoose.Types.ObjectId.isValid(ScenarioId)) {
      return res.status(400).json({ error: 'Invalid identifiers' });
    }
    
    const scenario = await HarmfulEffectScenario.findOneAndDelete({
      _id: ScenarioId,
      ProjectIdentifier
    });
    
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    res.status(200).json({ message: 'Scenario deleted successfully' });
  } catch (error) {
    console.error('Delete scenario error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  analyzeHarmfulEffects,
  getProjectHarmfulEffectScenarios,
  getHarmfulEffectScenario,
  deleteHarmfulEffectScenario,
  formatGeminiPrompt
};