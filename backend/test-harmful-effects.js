const { classifyValue } = require('./utils/thresholds');

// Test the threshold classification
console.log('Testing threshold classification:');

// Test normal fields (higher is worse)
console.log('ElectricityUseKilowattHoursPerTonneOre (150):', classifyValue('ElectricityUseKilowattHoursPerTonneOre', 150));
console.log('ElectricityUseKilowattHoursPerTonneOre (50):', classifyValue('ElectricityUseKilowattHoursPerTonneOre', 50));
console.log('ElectricityUseKilowattHoursPerTonneOre (250):', classifyValue('ElectricityUseKilowattHoursPerTonneOre', 250));

// Test inverse fields (lower is worse)
console.log('OreGradePercent (1.5):', classifyValue('OreGradePercent', 1.5));
console.log('OreGradePercent (3.0):', classifyValue('OreGradePercent', 3.0));
console.log('OreGradePercent (0.3):', classifyValue('OreGradePercent', 0.3));

console.log('Test completed.');