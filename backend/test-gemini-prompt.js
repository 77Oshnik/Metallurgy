const { formatGeminiPrompt } = require('./controllers/harmfulEffectsController');

// Test data
const projectId = 'test123';
const stageName = 'Smelting and Refining';
const inputs = {
  'SmeltEnergyKilowattHoursPerTonneMetal': 2500,
  'CokeUseKilogramsPerTonneMetal': 450,
  'FuelSharePercent': 75
};
const outputs = {
  'CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForSmelting': 2200
};
const thresholdResults = {
  'SmeltEnergyKilowattHoursPerTonneMetal': 'Very High',
  'CokeUseKilogramsPerTonneMetal': 'High',
  'FuelSharePercent': 'High'
};
const fieldsForAnalysis = ['SmeltEnergyKilowattHoursPerTonneMetal', 'CokeUseKilogramsPerTonneMetal'];

// Generate the prompt
const prompt = formatGeminiPrompt(projectId, stageName, inputs, outputs, thresholdResults, fieldsForAnalysis);

console.log('Generated Gemini Prompt:');
console.log(prompt);

// Verify key elements are present
console.log('\n--- VERIFICATION ---');
console.log('Contains professional context:', prompt.includes('industry consultant specialized in metallurgy'));
console.log('Contains technical instructions:', prompt.includes('Harmful Effects') && prompt.includes('Remedies') && prompt.includes('Benefits'));
console.log('Contains quantified examples:', prompt.includes('kg CO₂/t') || prompt.includes('kWh/t') || prompt.includes('ppm'));
console.log('Contains industry terminology:', prompt.includes('Top-gas recycling blast furnace') || prompt.includes('oxygen-enriched smelting'));
console.log('Contains JSON format specification:', prompt.includes('"GeminiAnalysis"'));
console.log('Includes project context:', prompt.includes(projectId) && prompt.includes(stageName));
console.log('Filters to only concerning fields:', !prompt.includes('FuelSharePercent') && prompt.includes('SmeltEnergyKilowattHoursPerTonneMetal'));