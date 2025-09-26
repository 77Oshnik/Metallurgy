// Test script for energy transition scenarios
const mongoose = require('mongoose');
const EnergyTransitionScenario = require('./models/energyTransitionScenarioModel');

// MongoDB connection
const connectDB = require('./config/db');
connectDB();

// Test data
const testScenario = {
  ProjectIdentifier: mongoose.Types.ObjectId(), // Replace with actual project ID
  StageName: 'Smelting and Refining',
  BaselineElectricityConsumptionKilowattHoursPerFunctionalUnit: 1000,
  BaselineFuelSharePercent: 30,
  UserScenario: {
    RenewableSharePercent: 50,
    FossilSharePercent: 50,
    EnergySourceMix: {
      grid: 50,
      solar: 50,
      wind: 0,
      hydro: 0
    }
  },
  Outputs: {
    BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit: 1200,
    ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit: 850,
    CarbonReductionPercent: 29.1
  }
};

// Test creating a scenario
async function testCreateScenario() {
  try {
    const scenario = new EnergyTransitionScenario(testScenario);
    const savedScenario = await scenario.save();
    console.log('Scenario saved successfully:', savedScenario);
    
    // Test retrieval
    const retrievedScenario = await EnergyTransitionScenario.findById(savedScenario._id);
    console.log('Retrieved scenario:', retrievedScenario);
    
    // Clean up
    await EnergyTransitionScenario.findByIdAndDelete(savedScenario._id);
    console.log('Test scenario cleaned up');
  } catch (error) {
    console.error('Error in test:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run test
testCreateScenario();