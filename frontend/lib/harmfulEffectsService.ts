// Harmful Effects Service
// This service handles API calls to the harmful effects analyzer

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export interface ThresholdResult {
  [key: string]: 'Very High' | 'High' | 'Medium' | 'Safe';
}

export interface GeminiAnalysisItem {
  Field: string;
  Severity: 'Very High' | 'High' | 'Medium' | 'Safe';
  HarmfulEffects: string[];
  Remedies: string[];
  Benefits: string[];
}

export interface HarmfulEffectScenario {
  _id?: string;
  ProjectIdentifier: string;
  StageName: string;
  InputsAnalyzed: { [key: string]: number };
  OutputsAnalyzed: { [key: string]: number };
  ThresholdResults: ThresholdResult;
  GeminiAnalysis: GeminiAnalysisItem[];
  CreatedAtUtc?: string;
  UpdatedAtUtc?: string;
}

// Type guard to check if the object is a valid HarmfulEffectScenario
export function isHarmfulEffectScenario(obj: any): obj is HarmfulEffectScenario {
  // Check if obj exists and has the required properties
  if (!obj || typeof obj !== 'object') {
    console.log('Object is null or not an object');
    return false;
  }

  // Check required string properties
  if (typeof obj.ProjectIdentifier !== 'string') {
    console.log('ProjectIdentifier is not a string');
    return false;
  }
  
  if (typeof obj.StageName !== 'string') {
    console.log('StageName is not a string');
    return false;
  }

  // Check InputsAnalyzed and OutputsAnalyzed (should be objects)
  if (typeof obj.InputsAnalyzed !== 'object') {
    console.log('InputsAnalyzed is not an object');
    return false;
  }
  
  if (typeof obj.OutputsAnalyzed !== 'object') {
    console.log('OutputsAnalyzed is not an object');
    return false;
  }

  // Check ThresholdResults (should be an object)
  if (typeof obj.ThresholdResults !== 'object') {
    console.log('ThresholdResults is not an object');
    return false;
  }

  // Check GeminiAnalysis array
  if (!Array.isArray(obj.GeminiAnalysis)) {
    console.log('GeminiAnalysis is not an array');
    return false;
  }

  // If we got here, it's a valid HarmfulEffectScenario
  return true;
}

/**
 * Run harmful effects analysis for a specific stage
 * @param projectId - The ID of the project
 * @param stageName - The name of the stage to analyze
 * @returns The harmful effect analysis results
 */
export async function analyzeHarmfulEffects(
  projectId: string,
  stageName: string
): Promise<HarmfulEffectScenario> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/harmful-effects/${projectId}/${stageName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to analyze harmful effects';
      
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
    if (!isHarmfulEffectScenario(data)) {
      console.error('Invalid response data format from server:', data);
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
 * Get all harmful effect scenarios for a project
 * @param projectId - The ID of the project
 * @returns Array of harmful effect scenarios
 */
export async function getHarmfulEffectScenarios(
  projectId: string
): Promise<HarmfulEffectScenario[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/harmful-effects/${projectId}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch harmful effect scenarios';
      
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
    return data.filter(isHarmfulEffectScenario);
  } catch (error: any) {
    if (error instanceof TypeError) {
      throw new Error('Network error - please check if the backend server is running');
    }
    throw error;
  }
}

/**
 * Get a specific harmful effect scenario
 * @param projectId - The ID of the project
 * @param scenarioId - The ID of the scenario to fetch
 * @returns The harmful effect scenario
 */
export async function getHarmfulEffectScenario(
  projectId: string,
  scenarioId: string
): Promise<HarmfulEffectScenario> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/harmful-effects/${projectId}/${scenarioId}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch harmful effect scenario';
      
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
    if (!isHarmfulEffectScenario(data)) {
      console.error('Invalid response data format from server:', data);
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
 * Delete a harmful effect scenario
 * @param projectId - The ID of the project
 * @param scenarioId - The ID of the scenario to delete
 * @returns Promise that resolves when the scenario is deleted
 */
export async function deleteHarmfulEffectScenario(
  projectId: string,
  scenarioId: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/harmful-effects/${projectId}/${scenarioId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to delete harmful effect scenario';
      
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