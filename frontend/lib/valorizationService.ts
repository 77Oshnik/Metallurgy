interface ByproductConstraints {
  preferLowCapex?: boolean;
  quickPayback?: boolean;
  region?: string;
  exportRestrictions?: boolean;
  localMarketPreferences?: string;
}

interface ByproductMeasuredProperties {
  typicalComposition?: string[];
  moisturePercent?: number;
  particleSizeD50Microns?: number;
  densityKgM3?: number;
  pH?: number;
  sulfurPercent?: number;
  metalContentPercent?: number;
  organicCarbonPercent?: number;
  [key: string]: any;
}

interface Byproduct {
  StageName: string;
  ByproductName: string;
  MassTonnesPerFunctionalUnit: number;
  measuredProperties?: ByproductMeasuredProperties;
  hasProperties?: boolean;
}

interface QualityRequirements {
  moisturePercent?: number;
  particleSizeMm?: number;
  heavyMetalThresholdsPpm?: number;
  pHRange?: {
    min: number;
    max: number;
  };
  other?: string;
}

interface SuggestedApplication {
  ApplicationName: string;
  TechnicalDescription: string;
  ExpectedSubstitutionRateTonnesPerTonneByproduct: number;
  AvoidedEmissionsKilogramsCarbonDioxideEquivalentPerTonneByproduct: number;
  AvoidedLandfillCubicMetersPerTonneByproduct: number;
  EstimatedMarketValueUsdPerTonne: {
    low: number;
    median: number;
    high: number;
  };
  EstimatedProcessingCapexUsdPerTonne?: {
    low: number;
    median: number;
    high: number;
  };
  EstimatedProcessingOpexUsdPerTonne: {
    low: number;
    median: number;
    high: number;
  };
  ImplementationTimeframeMonths: {
    min: number;
    max: number;
  };
  TechnicalFeasibilityRating: 'ProvenCommercial' | 'DemonstrationScale' | 'Pilot' | 'Research';
  TypicalQualityRequirements: QualityRequirements;
  RegulatoryNotes: string;
  ConfidenceScorePercent: number;
  EvidenceAndReferences: string[];
}

interface ScenarioAggregateBenefits {
  TotalAvoidedEmissionsKilogramsCO2e: number;
  TotalAvoidedLandfillCubicMeters: number;
  TotalPotentialRevenueUsd: {
    low: number;
    median: number;
    high: number;
  };
  EstimatedNetBenefitUsd: {
    low: number;
    median: number;
    high: number;
  };
}

interface GeminiAnalysis {
  ByproductName: string;
  MassTonnesPerFunctionalUnit: number;
  SuggestedApplications: SuggestedApplication[];
  OverallRecommendationSummary: string;
  ScenarioAggregateBenefits: ScenarioAggregateBenefits;
  Provenance: {
    ModelName: string;
    PromptVersion: string;
    GeneratedAtUtc: string;
    RawAITableOutput: string;
  };
}

interface ValorizationScenario {
  _id: string;
  ProjectIdentifier: string;
  StageName: string;
  ByproductName: string;
  MassTonnesPerFunctionalUnit: number;
  GeminiAnalysis?: GeminiAnalysis;
  DetailedAnalysis?: GeminiAnalysis;
  TopApplication?: {
    ApplicationName: string;
    TechnicalFeasibilityRating: string;
    ConfidenceScorePercent: number;
  };
  AggregateBenefits?: ScenarioAggregateBenefits;
  OverallRecommendation?: string;
  AnalysisMetadata?: {
    ModelName: string;
    GeneratedAtUtc: string;
    PromptVersion: string;
  };
  CreatedAtUtc: string;
  UpdatedAtUtc: string;
}

interface AvailableByproductsResponse {
  projectName: string;
  totalByproducts: number;
  byproductsByStage: Record<string, Byproduct[]>;
  supportedStages: string[];
}

interface AnalysisFailure {
  ByproductName: string;
  StageName: string;
  error: string;
}

interface AnalysisResponse {
  projectContext: {
    ProjectIdentifier: string;
    ProjectName: string;
    MetalType: string;
    ProcessingMode: string;
    FunctionalUnitMassTonnes: number;
  };
  totalByproductsAnalyzed: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  scenarios: ValorizationScenario[];
  failedAnalysesDetails?: AnalysisFailure[];
}

interface ScenariosResponse {
  projectName: string;
  totalScenarios: number;
  scenariosByStage: Record<string, ValorizationScenario[]>;
  scenarios: ValorizationScenario[];
}

class ValorizationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getAvailableByproducts(projectId: string): Promise<AvailableByproductsResponse> {
    return this.makeRequest<AvailableByproductsResponse>(`/valorization/${projectId}/available-byproducts`);
  }

  async analyzeByproducts(
    projectId: string, 
    byproductNames?: string[], 
    constraints?: ByproductConstraints
  ): Promise<AnalysisResponse> {
    return this.makeRequest<AnalysisResponse>(`/valorization/${projectId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({
        byproductNames,
        constraints,
      }),
    });
  }

  async getProjectScenarios(projectId: string): Promise<ScenariosResponse> {
    return this.makeRequest<ScenariosResponse>(`/valorization/${projectId}`);
  }

  async getScenarioDetail(projectId: string, scenarioId: string): Promise<ValorizationScenario> {
    return this.makeRequest<ValorizationScenario>(`/valorization/${projectId}/${scenarioId}`);
  }

  async updateScenario(
    projectId: string, 
    scenarioId: string, 
    constraints: ByproductConstraints
  ): Promise<{ message: string; scenario: ValorizationScenario }> {
    return this.makeRequest(`/valorization/${projectId}/${scenarioId}`, {
      method: 'PUT',
      body: JSON.stringify({ constraints }),
    });
  }

  async deleteScenario(projectId: string, scenarioId: string): Promise<{ message: string }> {
    return this.makeRequest(`/valorization/${projectId}/${scenarioId}`, {
      method: 'DELETE',
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatLargeNumber(value: number, unit: string = ''): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`.trim();
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`.trim();
    }
    return `${value.toFixed(1)} ${unit}`.trim();
  }

  getFeasibilityInfo(rating: string): { color: string; description: string; bgColor: string } {
    switch (rating) {
      case 'ProvenCommercial':
        return {
          color: 'text-green-700 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          description: 'Proven Commercial'
        };
      case 'DemonstrationScale':
        return {
          color: 'text-blue-700 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          description: 'Demonstration Scale'
        };
      case 'Pilot':
        return {
          color: 'text-orange-700 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          description: 'Pilot Scale'
        };
      case 'Research':
        return {
          color: 'text-red-700 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          description: 'Research Stage'
        };
      default:
        return {
          color: 'text-gray-700 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          description: 'Unknown'
        };
    }
  }

  getConfidenceColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  getStageInfo(stageName: string): { icon: string; color: string; bgColor: string } {
    switch (stageName) {
      case 'Mining':
        return {
          icon: '⛏️',
          color: 'text-amber-700 dark:text-amber-400',
          bgColor: 'bg-amber-100 dark:bg-amber-900/20'
        };
      case 'Concentration':
        return {
          icon: '🔬',
          color: 'text-purple-700 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20'
        };
      case 'Smelting and Refining':
        return {
          icon: '🔥',
          color: 'text-red-700 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20'
        };
      case 'Fabrication':
        return {
          icon: '🔧',
          color: 'text-blue-700 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20'
        };
      case 'Use Phase':
        return {
          icon: '🏭',
          color: 'text-indigo-700 dark:text-indigo-400',
          bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
        };
      case 'End of Life':
        return {
          icon: '♻️',
          color: 'text-green-700 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20'
        };
      default:
        return {
          icon: '📦',
          color: 'text-gray-700 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20'
        };
    }
  }
}

export const valorizationService = new ValorizationService();

export type {
  Byproduct,
  ByproductConstraints,
  ValorizationScenario,
  SuggestedApplication,
  ScenarioAggregateBenefits,
  GeminiAnalysis,
  AvailableByproductsResponse,
  AnalysisResponse,
  ScenariosResponse,
  AnalysisFailure,
};