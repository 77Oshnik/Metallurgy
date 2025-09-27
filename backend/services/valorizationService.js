const { GoogleGenerativeAI } = require('@google/generative-ai');

class ValorizationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    this.promptVersion = 'v1.0.0';
  }

  /**
   * Generate valorization analysis for a single byproduct using Gemini AI
   * @param {Object} byproductData - Byproduct information
   * @param {Object} projectContext - Project context information  
   * @param {Object} stageContext - Stage context information
   * @param {Object} constraints - User preferences and constraints
   * @returns {Object} Parsed valorization analysis or error
   */
  async generateByproductAnalysis(byproductData, projectContext, stageContext, constraints = {}) {
    try {
      const startTime = Date.now();
      
      // Build the structured prompt
      const prompt = this.buildAnalysisPrompt(byproductData, projectContext, stageContext, constraints);
      
      // Call Gemini API
      const result = await this.model.generateContent(prompt);
      const rawResponse = result.response.text();
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Parse and validate JSON response
      const parsedAnalysis = this.parseAndValidateResponse(rawResponse, byproductData);
      
      if (!parsedAnalysis.success) {
        return {
          success: false,
          error: parsedAnalysis.error,
          rawResponse,
          latency
        };
      }
      
      // Add provenance metadata
      const enrichedAnalysis = {
        ...parsedAnalysis.data,
        Provenance: {
          ModelName: 'gemini-2.0-flash',
          PromptVersion: this.promptVersion,
          GeneratedAtUtc: new Date(),
          RawAITableOutput: rawResponse
        }
      };
      
      return {
        success: true,
        analysis: enrichedAnalysis,
        rawResponse,
        latency
      };
      
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: error.message,
        fallbackAnalysis: this.generateFallbackAnalysis(byproductData)
      };
    }
  }

  /**
   * Build the structured prompt for Gemini analysis
   */
  buildAnalysisPrompt(byproductData, projectContext, stageContext, constraints) {
    const constraintsText = this.formatConstraints(constraints);
    const measuredPropertiesText = byproductData.measuredProperties ? 
      JSON.stringify(byproductData.measuredProperties, null, 2) : 'null';
    const stageKPIsText = stageContext.kpis ? 
      JSON.stringify(stageContext.kpis, null, 2) : 'null';

    return `You are an expert metallurgical process engineer and industrial sustainability consultant.
Analyze the following byproduct for commercial valorization opportunities within metallurgy or adjacent industries. Use contemporary industry practices, standards, and published benchmarks. Produce a professional, auditable JSON response exactly following the required schema. Quantify benefits, costs, and feasibility with realistic ranges and units. Cite assumptions and references where possible. Do not include any explanation outside the JSON object.

CONTEXT:

* ProjectIdentifier: ${projectContext.ProjectIdentifier}
* ProjectName: ${projectContext.ProjectName}
* MetalType: ${projectContext.MetalType}
* ProcessingMode: ${projectContext.ProcessingMode}
* StageName: ${stageContext.StageName}
* FunctionalUnitMassTonnes: ${projectContext.FunctionalUnitMassTonnes} t

BYPRODUCT:

* Name: ${byproductData.ByproductName}
* MassTonnesPerFunctionalUnit: ${byproductData.MassTonnesPerFunctionalUnit} t/FU
* MeasuredProperties: ${measuredPropertiesText}

KPIS: ${stageKPIsText}

CONSTRAINTS: ${constraintsText}

TASK (strict): For this byproduct produce JSON containing SuggestedApplications[], OverallRecommendationSummary, ScenarioAggregateBenefits, and Provenance as specified. For each SuggestedApplication provide TechnicalDescription, ExpectedSubstitutionRateTonnesPerTonneByproduct, AvoidedEmissionsKilogramsCarbonDioxideEquivalentPerTonneByproduct (numeric range or point estimate), AvoidedLandfillCubicMetersPerTonneByproduct, EstimatedMarketValueUsdPerTonne (range), EstimatedProcessingCapexUsdPerTonne (range, or null), EstimatedProcessingOpexUsdPerTonne (range), ImplementationTimeframeMonths (range), TechnicalFeasibilityRating (ProvenCommercial|DemonstrationScale|Pilot|Research), TypicalQualityRequirements, RegulatoryNotes, ConfidenceScorePercent (0-100), EvidenceAndReferences[].

Return exactly one JSON object (no surrounding commentary). Use industry-standard units (kg CO₂e, t, m³, USD). When giving ranges, include both lower and upper bounds. Provide numeric approximations to reasonable precision (two significant digits for large numbers, one decimal for percentages). Use professional, engineering terminology and cite standards/industry references when possible in EvidenceAndReferences.

Expected JSON Schema:
{
  "ByproductName": "${byproductData.ByproductName}",
  "MassTonnesPerFunctionalUnit": ${byproductData.MassTonnesPerFunctionalUnit},
  "SuggestedApplications": [
    {
      "ApplicationName": "string",
      "TechnicalDescription": "string",
      "ExpectedSubstitutionRateTonnesPerTonneByproduct": number,
      "AvoidedEmissionsKilogramsCarbonDioxideEquivalentPerTonneByproduct": number,
      "AvoidedLandfillCubicMetersPerTonneByproduct": number,
      "EstimatedMarketValueUsdPerTonne": {"low": number, "median": number, "high": number},
      "EstimatedProcessingCapexUsdPerTonne": {"low": number, "median": number, "high": number},
      "EstimatedProcessingOpexUsdPerTonne": {"low": number, "median": number, "high": number},
      "ImplementationTimeframeMonths": {"min": number, "max": number},
      "TechnicalFeasibilityRating": "ProvenCommercial|DemonstrationScale|Pilot|Research",
      "TypicalQualityRequirements": {
        "moisturePercent": number,
        "particleSizeMm": number,
        "heavyMetalThresholdsPpm": number,
        "pHRange": {"min": number, "max": number},
        "other": "string"
      },
      "RegulatoryNotes": "string",
      "ConfidenceScorePercent": number,
      "EvidenceAndReferences": ["string"]
    }
  ],
  "OverallRecommendationSummary": "string",
  "ScenarioAggregateBenefits": {
    "TotalAvoidedEmissionsKilogramsCO2e": number,
    "TotalAvoidedLandfillCubicMeters": number,
    "TotalPotentialRevenueUsd": {"low": number, "median": number, "high": number},
    "EstimatedNetBenefitUsd": {"low": number, "median": number, "high": number}
  }
}`;
  }

  /**
   * Format constraints for the prompt
   */
  formatConstraints(constraints) {
    const parts = [];
    
    if (constraints.preferLowCapex) {
      parts.push('prefer low CAPEX routes');
    }
    
    if (constraints.quickPayback) {
      parts.push('need quick payback');
    }
    
    if (constraints.region) {
      parts.push(`local market = ${constraints.region}`);
    }
    
    if (constraints.exportRestrictions) {
      parts.push('export banned = true');
    }
    
    if (constraints.localMarketPreferences) {
      parts.push(`local market preferences = ${constraints.localMarketPreferences}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No specific constraints';
  }

  /**
   * Parse and validate Gemini's JSON response
   */
  parseAndValidateResponse(rawResponse, byproductData) {
    try {
      // Extract JSON from response (handle cases where response might have extra text)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: 'No valid JSON found in response'
        };
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const requiredFields = [
        'ByproductName',
        'MassTonnesPerFunctionalUnit',
        'SuggestedApplications',
        'OverallRecommendationSummary',
        'ScenarioAggregateBenefits'
      ];
      
      for (const field of requiredFields) {
        if (!parsedData[field]) {
          return {
            success: false,
            error: `Missing required field: ${field}`
          };
        }
      }
      
      // Validate SuggestedApplications array
      if (!Array.isArray(parsedData.SuggestedApplications) || parsedData.SuggestedApplications.length === 0) {
        return {
          success: false,
          error: 'SuggestedApplications must be a non-empty array'
        };
      }
      
      // Validate each application
      for (const app of parsedData.SuggestedApplications) {
        const validationError = this.validateApplication(app);
        if (validationError) {
          return {
            success: false,
            error: `Invalid application: ${validationError}`
          };
        }
      }
      
      // Validate numeric ranges and sanity checks
      const sanityCheckError = this.performSanityChecks(parsedData);
      if (sanityCheckError) {
        return {
          success: false,
          error: `Sanity check failed: ${sanityCheckError}`
        };
      }
      
      return {
        success: true,
        data: parsedData
      };
      
    } catch (error) {
      return {
        success: false,
        error: `JSON parsing error: ${error.message}`
      };
    }
  }

  /**
   * Validate individual application object
   */
  validateApplication(app) {
    const requiredAppFields = [
      'ApplicationName',
      'TechnicalDescription',
      'ExpectedSubstitutionRateTonnesPerTonneByproduct',
      'AvoidedEmissionsKilogramsCarbonDioxideEquivalentPerTonneByproduct',
      'AvoidedLandfillCubicMetersPerTonneByproduct',
      'TechnicalFeasibilityRating',
      'ConfidenceScorePercent'
    ];
    
    for (const field of requiredAppFields) {
      if (app[field] === undefined || app[field] === null) {
        return `Missing field ${field}`;
      }
    }
    
    // Validate feasibility rating
    const validRatings = ['ProvenCommercial', 'DemonstrationScale', 'Pilot', 'Research'];
    if (!validRatings.includes(app.TechnicalFeasibilityRating)) {
      return `Invalid TechnicalFeasibilityRating: ${app.TechnicalFeasibilityRating}`;
    }
    
    // Validate confidence score
    if (app.ConfidenceScorePercent < 0 || app.ConfidenceScorePercent > 100) {
      return `Invalid ConfidenceScorePercent: ${app.ConfidenceScorePercent}`;
    }
    
    return null;
  }

  /**
   * Perform sanity checks on numeric values
   */
  performSanityChecks(data) {
    try {
      // Check for reasonable emission avoidance (not > 10,000 kg CO2e per tonne)
      for (const app of data.SuggestedApplications) {
        if (app.AvoidedEmissionsKilogramsCarbonDioxideEquivalentPerTonneByproduct > 10000) {
          return `Unrealistic avoided emissions: ${app.AvoidedEmissionsKilogramsCarbonDioxideEquivalentPerTonneByproduct} kg CO2e/t`;
        }
        
        // Check for reasonable market values (not > $10,000/tonne for most byproducts)
        if (app.EstimatedMarketValueUsdPerTonne && app.EstimatedMarketValueUsdPerTonne.high > 10000) {
          return `Unrealistic market value: $${app.EstimatedMarketValueUsdPerTonne.high}/t`;
        }
        
        // Check negative values
        if (app.ExpectedSubstitutionRateTonnesPerTonneByproduct < 0 ||
            app.AvoidedEmissionsKilogramsCarbonDioxideEquivalentPerTonneByproduct < 0 ||
            app.AvoidedLandfillCubicMetersPerTonneByproduct < 0) {
          return 'Negative values detected in key metrics';
        }
      }
      
      return null;
    } catch (error) {
      return `Sanity check error: ${error.message}`;
    }
  }

  /**
   * Generate fallback analysis when AI fails
   */
  generateFallbackAnalysis(byproductData) {
    return {
      ByproductName: byproductData.ByproductName,
      MassTonnesPerFunctionalUnit: byproductData.MassTonnesPerFunctionalUnit,
      SuggestedApplications: [{
        ApplicationName: 'Landfill disposal (baseline)',
        TechnicalDescription: 'Standard disposal to authorized landfill facility',
        ExpectedSubstitutionRateTonnesPerTonneByproduct: 0,
        AvoidedEmissionsKilogramsCarbonDioxideEquivalentPerTonneByproduct: 0,
        AvoidedLandfillCubicMetersPerTonneByproduct: 0,
        EstimatedMarketValueUsdPerTonne: { low: 0, median: 0, high: 0 },
        EstimatedProcessingCapexUsdPerTonne: { low: 0, median: 0, high: 0 },
        EstimatedProcessingOpexUsdPerTonne: { low: 50, median: 100, high: 200 },
        ImplementationTimeframeMonths: { min: 1, max: 3 },
        TechnicalFeasibilityRating: 'ProvenCommercial',
        TypicalQualityRequirements: {
          moisturePercent: null,
          particleSizeMm: null,
          heavyMetalThresholdsPpm: null,
          pHRange: { min: null, max: null },
          other: 'Must meet landfill acceptance criteria'
        },
        RegulatoryNotes: 'Requires waste classification and disposal permits',
        ConfidenceScorePercent: 95,
        EvidenceAndReferences: ['Standard waste management practices']
      }],
      OverallRecommendationSummary: 'AI analysis unavailable. Baseline disposal option provided. Manual assessment recommended for valorization opportunities.',
      ScenarioAggregateBenefits: {
        TotalAvoidedEmissionsKilogramsCO2e: 0,
        TotalAvoidedLandfillCubicMeters: 0,
        TotalPotentialRevenueUsd: { low: 0, median: 0, high: 0 },
        EstimatedNetBenefitUsd: { 
          low: -100 * byproductData.MassTonnesPerFunctionalUnit, 
          median: -150 * byproductData.MassTonnesPerFunctionalUnit, 
          high: -200 * byproductData.MassTonnesPerFunctionalUnit 
        }
      },
      Provenance: {
        ModelName: 'fallback-analysis',
        PromptVersion: 'fallback-v1.0.0',
        GeneratedAtUtc: new Date(),
        RawAITableOutput: 'Fallback analysis generated due to AI service unavailability'
      }
    };
  }

  /**
   * Batch analyze multiple byproducts for a project
   */
  async analyzeBatchByproducts(byproductsData, projectContext, stageContexts, constraints = {}) {
    const results = [];
    
    for (const byproductData of byproductsData) {
      const stageContext = stageContexts[byproductData.StageName] || {};
      
      const result = await this.generateByproductAnalysis(
        byproductData, 
        projectContext, 
        stageContext, 
        constraints
      );
      
      results.push({
        ByproductName: byproductData.ByproductName,
        StageName: byproductData.StageName,
        ...result
      });
      
      // Add small delay to avoid rate limiting
      await this.delay(1000);
    }
    
    return results;
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ValorizationService;