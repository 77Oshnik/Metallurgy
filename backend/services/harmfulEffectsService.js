const { classifyValue } = require('../utils/thresholds');

/**
 * Analyze fields against thresholds and return results
 * @param {Object} inputs - Input fields to analyze
 * @param {Object} outputs - Output fields to analyze
 * @returns {Object} - Threshold analysis results
 */
function analyzeThresholds(inputs, outputs) {
  const thresholdResults = {};
  
  // Analyze inputs
  for (const [fieldName, value] of Object.entries(inputs)) {
    if (typeof value === 'number') {
      thresholdResults[fieldName] = classifyValue(fieldName, value);
    }
  }
  
  // Analyze outputs
  for (const [fieldName, value] of Object.entries(outputs)) {
    if (typeof value === 'number') {
      thresholdResults[fieldName] = classifyValue(fieldName, value);
    }
  }
  
  return thresholdResults;
}

/**
 * Get fields that exceed medium threshold for AI analysis
 * @param {Object} thresholdResults - Results from threshold analysis
 * @returns {Array} - Fields requiring AI analysis
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
 * Filter fields to only include those with concerning severity levels
 * @param {Object} inputs - Input fields
 * @param {Object} outputs - Output fields
 * @param {Object} thresholdResults - Threshold analysis results
 * @returns {Object} - Filtered inputs and outputs
 */
function filterConcerningFields(inputs, outputs, thresholdResults) {
  const filteredInputs = {};
  const filteredOutputs = {};
  
  const concerningFields = getFieldsForAIAnalysis(thresholdResults);
  
  concerningFields.forEach(field => {
    if (inputs.hasOwnProperty(field)) {
      filteredInputs[field] = inputs[field];
    }
    if (outputs.hasOwnProperty(field)) {
      filteredOutputs[field] = outputs[field];
    }
  });
  
  return { filteredInputs, filteredOutputs };
}

module.exports = {
  analyzeThresholds,
  getFieldsForAIAnalysis,
  filterConcerningFields
};