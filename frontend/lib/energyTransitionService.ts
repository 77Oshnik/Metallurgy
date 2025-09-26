// Energy Transition Service
// This service handles API calls to the energy transition simulator

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export interface EnergySourceMix {
  grid: number;
  solar: number;
  wind: number;
  hydro: number;
  geothermal: number;
  biomass: number;
}

export interface EnergyTransitionScenario {
  StageName: string;
  BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit: number;
  ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit: number;
  CarbonReductionPercent: number;
  UserScenario: {
    RenewableSharePercent: number;
    FossilSharePercent: number;
    EnergySourceMix: EnergySourceMix;
  };
  AIInsights?: AIInsight[];
}

export interface AIInsight {
  title: string;
  description: string;
  category: 'environmental' | 'economic' | 'technical' | 'regulatory' | 'social';
  impact: string;
  confidence: 'high' | 'medium' | 'low';
}

// Type guard to check if the object is a valid EnergyTransitionScenario
export function isEnergyTransitionScenario(obj: any): obj is EnergyTransitionScenario {
  return (
    obj &&
    typeof obj.StageName === 'string' &&
    typeof obj.BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit === 'number' &&
    typeof obj.ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit === 'number' &&
    typeof obj.CarbonReductionPercent === 'number' &&
    obj.UserScenario &&
    typeof obj.UserScenario.RenewableSharePercent === 'number' &&
    typeof obj.UserScenario.FossilSharePercent === 'number' &&
    obj.UserScenario.EnergySourceMix &&
    typeof obj.UserScenario.EnergySourceMix.grid === 'number' &&
    typeof obj.UserScenario.EnergySourceMix.solar === 'number' &&
    typeof obj.UserScenario.EnergySourceMix.wind === 'number' &&
    typeof obj.UserScenario.EnergySourceMix.hydro === 'number' &&
    typeof obj.UserScenario.EnergySourceMix.geothermal === 'number' &&
    typeof obj.UserScenario.EnergySourceMix.biomass === 'number'
    // AIInsights is optional, so we don't need to validate it
  );
}

/**
 * Create a new energy transition scenario
 * @param projectId - The ID of the project
 * @param stageName - The name of the stage
 * @param renewableSharePercent - Percentage of renewable energy (0-100)
 * @param energySourceMix - Distribution of energy sources
 * @returns The created energy transition scenario
 */
export async function createEnergyTransitionScenario(
  projectId: string,
  stageName: string,
  renewableSharePercent: number,
  energySourceMix: EnergySourceMix
): Promise<EnergyTransitionScenario> {
  const fossilSharePercent = 100 - renewableSharePercent;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/energy-transition/${projectId}/${stageName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        RenewableSharePercent: renewableSharePercent,
        FossilSharePercent: fossilSharePercent,
        EnergySourceMix: energySourceMix,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to create energy transition scenario';
      
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate the response data
    if (!isEnergyTransitionScenario(data)) {
      throw new Error('Invalid response data format from server');
    }
    
    return data;
  } catch (error: any) {
    if (error instanceof TypeError) {
      throw new Error('Network error - please check if the backend server is running');
    }
    throw error;
  }
}

/**
 * Get all energy transition scenarios for a project
 * @param projectId - The ID of the project
 * @returns Array of energy transition scenarios
 */
export async function getEnergyTransitionScenarios(
  projectId: string
): Promise<EnergyTransitionScenario[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/energy-transition/${projectId}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch energy transition scenarios';
      
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate the response data
    if (!Array.isArray(data)) {
      throw new Error('Invalid response data format from server');
    }
    
    // Filter and validate each scenario
    return data.filter(isEnergyTransitionScenario);
  } catch (error: any) {
    if (error instanceof TypeError) {
      throw new Error('Network error - please check if the backend server is running');
    }
    throw error;
  }
}

/**
 * Delete an energy transition scenario
 * @param projectId - The ID of the project
 * @param scenarioId - The ID of the scenario to delete
 * @returns Promise that resolves when the scenario is deleted
 */
export async function deleteEnergyTransitionScenario(
  projectId: string,
  scenarioId: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/energy-transition/${projectId}/${scenarioId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to delete energy transition scenario';
      
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    if (error instanceof TypeError) {
      throw new Error('Network error - please check if the backend server is running');
    }
    throw error;
  }
}