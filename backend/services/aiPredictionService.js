const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIPredictionService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-pro",
    });
    this.timeout = parseInt(process.env.AI_PREDICTION_TIMEOUT) || 30000;
  }

  /**
   * Predict missing fields for any stage based on project context and provided fields
   */
  async predictStageFields(
    stage,
    projectContext,
    providedFields,
    missingFields
  ) {
    if (stage === "mining") {
      return this.predictMiningFields(
        projectContext,
        providedFields,
        missingFields
      );
    } else if (stage === "concentration") {
      return this.predictConcentrationFields(
        projectContext,
        providedFields,
        missingFields
      );
    } else if (stage === "smelting") {
      return this.predictSmeltingFields(
        projectContext,
        providedFields,
        missingFields
      );
    } else if (stage === "fabrication") {
      return this.predictFabricationFields(
        projectContext,
        providedFields,
        missingFields
      );
    } else if (stage === "usePhase") {
      return this.predictUsePhaseFields(
        projectContext,
        providedFields,
        missingFields
      );
    } else if (stage === "endOfLife") {
      return this.predictEndOfLifeFields(
        projectContext,
        providedFields,
        missingFields
      );
    }
    throw new Error(`Unsupported stage: ${stage}`);
  }

  /**
   * Predict missing mining fields based on project context and provided fields
   */
  async predictMiningFields(projectContext, providedFields, missingFields) {
    try {
      const prompt = this.formatPredictionPrompt(
        projectContext,
        providedFields,
        missingFields
      );

      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("AI prediction timeout")),
            this.timeout
          )
        ),
      ]);

      const response = await result.response;
      const text = response.text();

      const predictions = this.parsePredictionResponse(text, missingFields);
      const validatedPredictions = this.validatePredictions(
        predictions,
        missingFields
      );

      return {
        success: true,
        predictions: validatedPredictions,
        metadata: {
          model: process.env.GEMINI_MODEL || "gemini-pro",
          prompt: prompt,
          reasoning: text,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(validatedPredictions),
        },
      };
    } catch (error) {
      console.error("AI Prediction Error:", error);
      return {
        success: false,
        error: error.message,
        fallbackPredictions: this.getFallbackPredictions(
          projectContext,
          missingFields
        ),
      };
    }
  }

  /**
   * Format the prediction prompt with context and constraints
   */
  formatPredictionPrompt(projectContext, providedFields, missingFields) {
    const metalTypeContext = this.getMetalTypeContext(projectContext.MetalType);
    const processingModeContext = this.getProcessingModeContext(
      projectContext.ProcessingMode
    );

    return `You are an expert metallurgist and LCA specialist. Based on the following mining project context, predict realistic values for the missing parameters.

PROJECT CONTEXT:
- Metal Type: ${projectContext.MetalType}
- Processing Mode: ${projectContext.ProcessingMode}
- Functional Unit: ${projectContext.FunctionalUnitMassTonnes} tonnes
- Project Name: ${projectContext.ProjectName}

${metalTypeContext}
${processingModeContext}

PROVIDED PARAMETERS:
${Object.entries(providedFields)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

MISSING PARAMETERS TO PREDICT:
${missingFields.map((field) => `- ${field}`).join("\n")}

CONSTRAINTS:
- ReagentsKilogramsPerTonneOre: 0-100 kg/tonne (typical range: 2-20)
- WaterWithdrawalCubicMetersPerTonneOre: 0-50 m³/tonne (typical range: 0.5-10)
- TransportDistanceKilometersToConcentrator: 0-1000 km (typical range: 5-200)

Please provide ONLY a JSON response with the predicted values. Use realistic industry-standard values that are consistent with the provided parameters and metal type. Format:

{
  "ReagentsKilogramsPerTonneOre": <value>,
  "WaterWithdrawalCubicMetersPerTonneOre": <value>,
  "TransportDistanceKilometersToConcentrator": <value>
}`;
  }

  /**
   * Get metal-specific context for better predictions
   */
  getMetalTypeContext(metalType) {
    const contexts = {
      Aluminium: `
ALUMINIUM MINING CONTEXT:
- Typically extracted from bauxite ore with grades of 20-60% Al2O3
- Energy-intensive process requiring significant electricity for processing
- Water usage varies significantly based on processing method
- Reagents include caustic soda, lime, and various flotation chemicals`,

      Copper: `
COPPER MINING CONTEXT:
- Ore grades typically range from 0.3% to 3% Cu
- Requires significant diesel for mining operations and electricity for processing
- Water usage is substantial for flotation and dust suppression
- Common reagents include xanthates, frothers, and lime`,

      CriticalMinerals: `
CRITICAL MINERALS MINING CONTEXT:
- Ore grades vary widely depending on specific mineral
- Often requires specialized reagents and processing techniques
- Water and energy requirements depend on mineral type and processing method
- Transport distances can be significant due to remote locations`,
    };

    return contexts[metalType] || contexts["CriticalMinerals"];
  }

  /**
   * Get processing mode context
   */
  getProcessingModeContext(processingMode) {
    if (processingMode === "Circular") {
      return `
CIRCULAR PROCESSING CONSIDERATIONS:
- Focus on resource efficiency and waste minimization
- May involve recycled content integration
- Optimized for reduced environmental impact
- Consider end-of-life recovery potential`;
    } else {
      return `
LINEAR PROCESSING CONSIDERATIONS:
- Traditional extraction and processing methods
- Standard industry practices and parameters
- Focus on primary production efficiency`;
    }
  }

  /**
   * Parse AI response and extract predictions
   */
  parsePredictionResponse(text, missingFields) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const predictions = JSON.parse(jsonMatch[0]);

        // Filter to only include requested missing fields
        const filteredPredictions = {};
        missingFields.forEach((field) => {
          if (predictions[field] !== undefined) {
            filteredPredictions[field] = parseFloat(predictions[field]);
          }
        });

        return filteredPredictions;
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
    }

    return {};
  }

  /**
   * Validate predictions against constraints
   */
  validatePredictions(predictions, missingFields) {
    const constraints = {
      ReagentsKilogramsPerTonneOre: { min: 0, max: 100 },
      WaterWithdrawalCubicMetersPerTonneOre: { min: 0, max: 50 },
      TransportDistanceKilometersToConcentrator: { min: 0, max: 1000 },
    };

    const validatedPredictions = {};

    Object.entries(predictions).forEach(([field, value]) => {
      if (missingFields.includes(field) && constraints[field]) {
        const constraint = constraints[field];
        const numValue = parseFloat(value);

        if (
          !isNaN(numValue) &&
          numValue >= constraint.min &&
          numValue <= constraint.max
        ) {
          validatedPredictions[field] = numValue;
        } else {
          // Use fallback value if prediction is invalid
          validatedPredictions[field] = this.getFallbackValue(field);
        }
      }
    });

    return validatedPredictions;
  }

  /**
   * Calculate confidence scores for predictions
   */
  calculateConfidence(predictions) {
    const confidence = {};
    Object.keys(predictions).forEach((field) => {
      // Simple confidence calculation based on field type
      // In a real implementation, this could be more sophisticated
      confidence[field] = 0.75; // Default confidence
    });
    return confidence;
  }

  /**
   * Get fallback predictions when AI fails
   */
  getFallbackPredictions(projectContext, missingFields) {
    const fallbacks = {};

    missingFields.forEach((field) => {
      fallbacks[field] = this.getFallbackValue(field, projectContext.MetalType);
    });

    return fallbacks;
  }

  /**
   * Predict missing concentration fields based on project context and provided fields
   */
  async predictConcentrationFields(
    projectContext,
    providedFields,
    missingFields
  ) {
    try {
      const prompt = this.formatConcentrationPrompt(
        projectContext,
        providedFields,
        missingFields
      );

      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("AI prediction timeout")),
            this.timeout
          )
        ),
      ]);

      const response = await result.response;
      const text = response.text();

      const predictions = this.parsePredictionResponse(text, missingFields);
      const validatedPredictions = this.validateConcentrationPredictions(
        predictions,
        missingFields
      );

      return {
        success: true,
        predictions: validatedPredictions,
        metadata: {
          model: process.env.GEMINI_MODEL || "gemini-pro",
          prompt: prompt,
          reasoning: text,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(validatedPredictions),
        },
      };
    } catch (error) {
      console.error("AI Concentration Prediction Error:", error);
      return {
        success: false,
        error: error.message,
        fallbackPredictions: this.getFallbackConcentrationPredictions(
          projectContext,
          missingFields
        ),
      };
    }
  }

  /**
   * Format the concentration prediction prompt
   */
  formatConcentrationPrompt(projectContext, providedFields, missingFields) {
    const metalTypeContext = this.getMetalTypeContext(projectContext.MetalType);
    const processingModeContext = this.getProcessingModeContext(
      projectContext.ProcessingMode
    );

    return `You are an expert metallurgist and LCA specialist. Based on the following concentration/beneficiation project context, predict realistic values for the missing parameters.

PROJECT CONTEXT:
- Metal Type: ${projectContext.MetalType}
- Processing Mode: ${projectContext.ProcessingMode}
- Functional Unit: ${projectContext.FunctionalUnitMassTonnes} tonnes
- Project Name: ${projectContext.ProjectName}

${metalTypeContext}
${processingModeContext}

CONCENTRATION STAGE CONTEXT:
This stage involves grinding ore to liberate valuable minerals, followed by flotation or other beneficiation processes to separate concentrate from tailings. The process requires reagents for flotation, significant water for processing, and energy for grinding operations.

PROVIDED PARAMETERS:
${Object.entries(providedFields)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

MISSING PARAMETERS TO PREDICT:
${missingFields.map((field) => `- ${field}`).join("\n")}

CONSTRAINTS:
- ConcentrationReagentsKilogramsPerTonneConcentrate: 0-200 kg/tonne (typical range: 5-50)
- ConcentrationWaterCubicMetersPerTonneConcentrate: 0-100 m³/tonne (typical range: 2-20)
- WaterRecycleRatePercent: 0-100% (typical range: 60-95%)

RELATIONSHIPS TO CONSIDER:
- Higher recovery yields typically require more reagents and energy
- Water recycling rates depend on environmental regulations and water availability
- Tailings volume affects overall water and reagent consumption

Please provide ONLY a JSON response with the predicted values. Use realistic industry-standard values that are consistent with the provided parameters and metal type. Format:

{
  "ConcentrationReagentsKilogramsPerTonneConcentrate": <value>,
  "ConcentrationWaterCubicMetersPerTonneConcentrate": <value>,
  "WaterRecycleRatePercent": <value>
}`;
  }

  /**
   * Validate concentration predictions against constraints
   */
  validateConcentrationPredictions(predictions, missingFields) {
    const constraints = {
      ConcentrationReagentsKilogramsPerTonneConcentrate: { min: 0, max: 200 },
      ConcentrationWaterCubicMetersPerTonneConcentrate: { min: 0, max: 100 },
      WaterRecycleRatePercent: { min: 0, max: 100 },
    };

    const validatedPredictions = {};

    Object.entries(predictions).forEach(([field, value]) => {
      if (missingFields.includes(field) && constraints[field]) {
        const constraint = constraints[field];
        const numValue = parseFloat(value);

        if (
          !isNaN(numValue) &&
          numValue >= constraint.min &&
          numValue <= constraint.max
        ) {
          validatedPredictions[field] = numValue;
        } else {
          // Use fallback value if prediction is invalid
          validatedPredictions[field] = this.getFallbackValue(field);
        }
      }
    });

    return validatedPredictions;
  }

  /**
   * Get fallback predictions for concentration stage
   */
  getFallbackConcentrationPredictions(projectContext, missingFields) {
    const fallbacks = {};

    missingFields.forEach((field) => {
      fallbacks[field] = this.getFallbackValue(field, projectContext.MetalType);
    });

    return fallbacks;
  }

  /**
   * Predict missing smelting fields based on project context and provided fields
   */
  async predictSmeltingFields(projectContext, providedFields, missingFields) {
    try {
      const prompt = this.formatSmeltingPrompt(
        projectContext,
        providedFields,
        missingFields
      );

      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("AI prediction timeout")),
            this.timeout
          )
        ),
      ]);

      const response = await result.response;
      const text = response.text();

      const predictions = this.parsePredictionResponse(text, missingFields);
      const validatedPredictions = this.validateSmeltingPredictions(
        predictions,
        missingFields
      );

      return {
        success: true,
        predictions: validatedPredictions,
        metadata: {
          model: process.env.GEMINI_MODEL || "gemini-pro",
          prompt: prompt,
          reasoning: text,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(validatedPredictions),
        },
      };
    } catch (error) {
      console.error("AI Smelting Prediction Error:", error);
      return {
        success: false,
        error: error.message,
        fallbackPredictions: this.getFallbackSmeltingPredictions(
          projectContext,
          missingFields
        ),
      };
    }
  }

  /**
   * Format the smelting prediction prompt
   */
  formatSmeltingPrompt(projectContext, providedFields, missingFields) {
    const metalTypeContext = this.getMetalTypeContext(projectContext.MetalType);
    const processingModeContext = this.getProcessingModeContext(
      projectContext.ProcessingMode
    );

    return `You are an expert metallurgist and LCA specialist. Based on the following smelting/refining project context, predict realistic values for the missing parameters.

PROJECT CONTEXT:
- Metal Type: ${projectContext.MetalType}
- Processing Mode: ${projectContext.ProcessingMode}
- Functional Unit: ${projectContext.FunctionalUnitMassTonnes} tonnes
- Project Name: ${projectContext.ProjectName}

${metalTypeContext}
${processingModeContext}

SMELTING STAGE CONTEXT:
This stage involves high-temperature processing to extract refined metal from concentrate. The process requires significant energy, coke/carbon reductants, fluxes for slag formation, and may include emission control systems. Energy can come from electricity and fossil fuels in varying proportions.

PROVIDED PARAMETERS:
${Object.entries(providedFields)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

MISSING PARAMETERS TO PREDICT:
${missingFields.map((field) => `- ${field}`).join("\n")}

CONSTRAINTS:
- FuelSharePercent: 0-100% (typical range: 20-80% depending on technology)
- FluxesKilogramsPerTonneMetal: 0-500 kg/tonne (typical range: 50-200)
- EmissionControlEfficiencyPercent: 0-100% (typical range: 70-95% for modern facilities)

RELATIONSHIPS TO CONSIDER:
- Higher energy requirements typically correlate with more emission control needs
- Fuel share depends on metal type and smelting technology
- Flux requirements vary by ore composition and desired slag properties
- Emission control efficiency affects environmental compliance and costs

Please provide ONLY a JSON response with the predicted values. Use realistic industry-standard values that are consistent with the provided parameters and metal type. Format:

{
  "FuelSharePercent": <value>,
  "FluxesKilogramsPerTonneMetal": <value>,
  "EmissionControlEfficiencyPercent": <value>
}`;
  }

  /**
   * Validate smelting predictions against constraints
   */
  validateSmeltingPredictions(predictions, missingFields) {
    const constraints = {
      FuelSharePercent: { min: 0, max: 100 },
      FluxesKilogramsPerTonneMetal: { min: 0, max: 500 },
      EmissionControlEfficiencyPercent: { min: 0, max: 100 },
    };

    const validatedPredictions = {};

    Object.entries(predictions).forEach(([field, value]) => {
      if (missingFields.includes(field) && constraints[field]) {
        const constraint = constraints[field];
        const numValue = parseFloat(value);

        if (
          !isNaN(numValue) &&
          numValue >= constraint.min &&
          numValue <= constraint.max
        ) {
          validatedPredictions[field] = numValue;
        } else {
          // Use fallback value if prediction is invalid
          validatedPredictions[field] = this.getFallbackValue(field);
        }
      }
    });

    return validatedPredictions;
  }

  /**
   * Get fallback predictions for smelting stage
   */
  getFallbackSmeltingPredictions(projectContext, missingFields) {
    const fallbacks = {};

    missingFields.forEach((field) => {
      fallbacks[field] = this.getFallbackValue(field, projectContext.MetalType);
    });

    return fallbacks;
  }

  /**
   * Predict missing smelting fields based on project context and provided fields
   */
  async predictSmeltingFields(projectContext, providedFields, missingFields) {
    try {
      const prompt = this.formatSmeltingPrompt(
        projectContext,
        providedFields,
        missingFields
      );

      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("AI prediction timeout")),
            this.timeout
          )
        ),
      ]);

      const response = await result.response;
      const text = response.text();

      const predictions = this.parsePredictionResponse(text, missingFields);
      const validatedPredictions = this.validateSmeltingPredictions(
        predictions,
        missingFields
      );

      return {
        success: true,
        predictions: validatedPredictions,
        metadata: {
          model: process.env.GEMINI_MODEL || "gemini-pro",
          prompt: prompt,
          reasoning: text,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(validatedPredictions),
        },
      };
    } catch (error) {
      console.error("AI Smelting Prediction Error:", error);
      return {
        success: false,
        error: error.message,
        fallbackPredictions: this.getFallbackSmeltingPredictions(
          projectContext,
          missingFields
        ),
      };
    }
  }

  /**
   * Format the smelting prediction prompt
   */
  formatSmeltingPrompt(projectContext, providedFields, missingFields) {
    const metalTypeContext = this.getMetalTypeContext(
      projectContext.MetalType
    );
    const processingModeContext = this.getProcessingModeContext(
      projectContext.ProcessingMode
    );

    return `You are an expert metallurgist and LCA specialist. Based on the following smelting project context, predict realistic values for the missing parameters.

PROJECT CONTEXT:
- Metal Type: ${projectContext.MetalType}
- Processing Mode: ${projectContext.ProcessingMode}
- Functional Unit: ${projectContext.FunctionalUnitMassTonnes} tonnes
- Project Name: ${projectContext.ProjectName}

${metalTypeContext}
${processingModeContext}

SMELTING STAGE CONTEXT:
This stage involves high-temperature processing to extract pure metal from concentrate. The process requires significant energy (electricity and fuel), coke for reduction, fluxes for slag formation, and may include emission control systems. Different metals have different smelting requirements and emission profiles.

PROVIDED PARAMETERS:
${Object.entries(providedFields)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

MISSING PARAMETERS TO PREDICT:
${missingFields.map((field) => `- ${field}`).join("\n")}

CONSTRAINTS:
- FuelSharePercent: 0-100% (typical range: 20-80% depending on process)
- FluxesKilogramsPerTonneMetal: 0-500 kg/tonne (typical range: 50-300)
- EmissionControlEfficiencyPercent: 0-100% (typical range: 70-95% for modern facilities)

RELATIONSHIPS TO CONSIDER:
- Higher energy requirements typically correlate with more stringent emission controls
- Fuel share depends on the specific smelting technology and metal type
- Flux requirements vary significantly by metal type and ore composition
- Emission control efficiency affects air pollutant outputs

Please provide ONLY a JSON response with the predicted values. Use realistic industry-standard values that are consistent with the provided parameters and metal type. Format:

{
  "FuelSharePercent": <value>,
  "FluxesKilogramsPerTonneMetal": <value>,
  "EmissionControlEfficiencyPercent": <value>
}`;
  }

  /**
   * Validate smelting predictions against constraints
   */
  validateSmeltingPredictions(predictions, missingFields) {
    const constraints = {
      FuelSharePercent: { min: 0, max: 100 },
      FluxesKilogramsPerTonneMetal: { min: 0, max: 500 },
      EmissionControlEfficiencyPercent: { min: 0, max: 100 },
    };

    const validatedPredictions = {};

    Object.entries(predictions).forEach(([field, value]) => {
      if (missingFields.includes(field) && constraints[field]) {
        const constraint = constraints[field];
        const numValue = parseFloat(value);

        if (
          !isNaN(numValue) &&
          numValue >= constraint.min &&
          numValue <= constraint.max
        ) {
          validatedPredictions[field] = numValue;
        } else {
          // Use fallback value if prediction is invalid
          validatedPredictions[field] = this.getFallbackValue(field);
        }
      }
    });

    return validatedPredictions;
  }

  /**
   * Get fallback predictions for smelting stage
   */
  getFallbackSmeltingPredictions(projectContext, missingFields) {
    const fallbacks = {};

    missingFields.forEach((field) => {
      fallbacks[field] = this.getFallbackValue(field, projectContext.MetalType);
    });

    return fallbacks;
  }

  /**
   * Predict missing fabrication fields based on project context and provided fields
   */
  async predictFabricationFields(projectContext, providedFields, missingFields) {
    try {
      const prompt = this.formatFabricationPrompt(
        projectContext,
        providedFields,
        missingFields
      );

      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("AI prediction timeout")),
            this.timeout
          )
        ),
      ]);

      const response = await result.response;
      const text = response.text();

      const predictions = this.parsePredictionResponse(text, missingFields);
      const validatedPredictions = this.validateFabricationPredictions(
        predictions,
        missingFields
      );

      return {
        success: true,
        predictions: validatedPredictions,
        metadata: {
          model: process.env.GEMINI_MODEL || "gemini-pro",
          prompt: prompt,
          reasoning: text,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(validatedPredictions),
        },
      };
    } catch (error) {
      console.error("AI Fabrication Prediction Error:", error);
      return {
        success: false,
        error: error.message,
        fallbackPredictions: this.getFallbackFabricationPredictions(
          projectContext,
          missingFields
        ),
      };
    }
  }

  /**
   * Format the fabrication prediction prompt
   */
  formatFabricationPrompt(projectContext, providedFields, missingFields) {
    const metalTypeContext = this.getMetalTypeContext(
      projectContext.MetalType
    );
    const processingModeContext = this.getProcessingModeContext(
      projectContext.ProcessingMode
    );

    return `You are an expert metallurgist and LCA specialist. Based on the following fabrication/manufacturing project context, predict realistic values for the missing parameters.

PROJECT CONTEXT:
- Metal Type: ${projectContext.MetalType}
- Processing Mode: ${projectContext.ProcessingMode}
- Functional Unit: ${projectContext.FunctionalUnitMassTonnes} tonnes
- Project Name: ${projectContext.ProjectName}

${metalTypeContext}
${processingModeContext}

FABRICATION STAGE CONTEXT:
This stage involves manufacturing and fabrication processes to create final products from metal. The process includes energy consumption, use of ancillary materials (lubricants, gases, consumables), water usage, and considerations for renewable energy, scrap input, and yield efficiency. This stage is key for circularity as it determines recycled content and production efficiency.

PROVIDED PARAMETERS:
${Object.entries(providedFields)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

MISSING PARAMETERS TO PREDICT:
${missingFields.map((field) => `- ${field}`).join("\n")}

CONSTRAINTS:
- FabricationElectricityRenewableSharePercent: 0-100% (typical range: 10-80% depending on region and company policy)
- AncillaryMaterialsKilogramsPerTonneProduct: 0-1000 kg/tonne (typical range: 5-100)
- FabricationWaterCubicMetersPerTonneProduct: 0-100 m³/tonne (typical range: 0.5-20)

RELATIONSHIPS TO CONSIDER:
- Higher renewable energy shares indicate more sustainable operations
- Ancillary materials usage varies significantly by fabrication process complexity
- Water usage depends on cooling, cleaning, and surface treatment requirements
- Circular processing modes typically have higher renewable energy adoption
- Scrap input and yield efficiency affect overall resource requirements

Please provide ONLY a JSON response with the predicted values. Use realistic industry-standard values that are consistent with the provided parameters and metal type. Format:

{
  "FabricationElectricityRenewableSharePercent": <value>,
  "AncillaryMaterialsKilogramsPerTonneProduct": <value>,
  "FabricationWaterCubicMetersPerTonneProduct": <value>
}`;
  }

  /**
   * Validate fabrication predictions against constraints
   */
  validateFabricationPredictions(predictions, missingFields) {
    const constraints = {
      FabricationElectricityRenewableSharePercent: { min: 0, max: 100 },
      AncillaryMaterialsKilogramsPerTonneProduct: { min: 0, max: 1000 },
      FabricationWaterCubicMetersPerTonneProduct: { min: 0, max: 100 },
    };

    const validatedPredictions = {};

    Object.entries(predictions).forEach(([field, value]) => {
      if (missingFields.includes(field) && constraints[field]) {
        const constraint = constraints[field];
        const numValue = parseFloat(value);

        if (
          !isNaN(numValue) &&
          numValue >= constraint.min &&
          numValue <= constraint.max
        ) {
          validatedPredictions[field] = numValue;
        } else {
          // Use fallback value if prediction is invalid
          validatedPredictions[field] = this.getFallbackValue(field);
        }
      }
    });

    return validatedPredictions;
  }

  /**
   * Get fallback predictions for fabrication stage
   */
  getFallbackFabricationPredictions(projectContext, missingFields) {
    const fallbacks = {};

    missingFields.forEach((field) => {
      fallbacks[field] = this.getFallbackValue(field, projectContext.MetalType);
    });

    return fallbacks;
  }

  /**
   * Predict missing use phase fields based on project context and provided fields
   */
  async predictUsePhaseFields(projectContext, providedFields, missingFields) {
    try {
      const prompt = this.formatUsePhasePrompt(
        projectContext,
        providedFields,
        missingFields
      );

      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("AI prediction timeout")),
            this.timeout
          )
        ),
      ]);

      const response = await result.response;
      const text = response.text();

      const predictions = this.parsePredictionResponse(text, missingFields);
      const validatedPredictions = this.validateUsePhasePredictions(
        predictions,
        missingFields
      );

      return {
        success: true,
        predictions: validatedPredictions,
        metadata: {
          model: process.env.GEMINI_MODEL || "gemini-pro",
          prompt: prompt,
          reasoning: text,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(validatedPredictions),
        },
      };
    } catch (error) {
      console.error("AI Use Phase Prediction Error:", error);
      return {
        success: false,
        error: error.message,
        fallbackPredictions: this.getFallbackUsePhasePredictions(
          projectContext,
          missingFields
        ),
      };
    }
  }

  /**
   * Format the use phase prediction prompt
   */
  formatUsePhasePrompt(projectContext, providedFields, missingFields) {
    const metalTypeContext = this.getMetalTypeContext(
      projectContext.MetalType
    );
    const processingModeContext = this.getProcessingModeContext(
      projectContext.ProcessingMode
    );

    return `You are an expert metallurgist and LCA specialist. Based on the following use phase project context, predict realistic values for the missing parameters.

PROJECT CONTEXT:
- Metal Type: ${projectContext.MetalType}
- Processing Mode: ${projectContext.ProcessingMode}
- Functional Unit: ${projectContext.FunctionalUnitMassTonnes} tonnes
- Project Name: ${projectContext.ProjectName}

${metalTypeContext}
${processingModeContext}

USE PHASE CONTEXT:
This stage covers the operational lifetime of metal products, including energy consumption during use, maintenance requirements, failure rates, and end-of-life reuse potential. This stage is critical for circularity assessment as it determines product durability, maintenance needs, and reuse opportunities. Different metal products have vastly different use patterns and lifetimes.

PROVIDED PARAMETERS:
${Object.entries(providedFields)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

MISSING PARAMETERS TO PREDICT:
${missingFields.map((field) => `- ${field}`).join("\n")}

CONSTRAINTS:
- MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: 0-10000 kWh/year (typical range: 10-1000)
- MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit: 0-1000 kg/year (typical range: 1-100)
- ReusePotentialPercent: 0-100% (typical range: 20-90% depending on product type)

RELATIONSHIPS TO CONSIDER:
- Longer product lifetimes typically require more maintenance
- Higher failure rates indicate products needing more frequent maintenance
- Operational energy varies significantly by product type and usage intensity
- Reuse potential depends on product design and material degradation
- Circular processing modes typically design for higher reuse potential

METAL-SPECIFIC CONSIDERATIONS:
- Aluminium: Often used in long-lasting applications (buildings, vehicles) with high reuse potential
- Copper: Used in electrical applications with moderate maintenance needs and good reuse potential
- Critical Minerals: Specialized applications with varying maintenance and reuse characteristics

Please provide ONLY a JSON response with the predicted values. Use realistic industry-standard values that are consistent with the provided parameters and metal type. Format:

{
  "MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit": <value>,
  "MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit": <value>,
  "ReusePotentialPercent": <value>
}`;
  }

  /**
   * Validate use phase predictions against constraints
   */
  validateUsePhasePredictions(predictions, missingFields) {
    const constraints = {
      MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: { min: 0, max: 10000 },
      MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit: { min: 0, max: 1000 },
      ReusePotentialPercent: { min: 0, max: 100 },
    };

    const validatedPredictions = {};

    Object.entries(predictions).forEach(([field, value]) => {
      if (missingFields.includes(field) && constraints[field]) {
        const constraint = constraints[field];
        const numValue = parseFloat(value);

        if (
          !isNaN(numValue) &&
          numValue >= constraint.min &&
          numValue <= constraint.max
        ) {
          validatedPredictions[field] = numValue;
        } else {
          // Use fallback value if prediction is invalid
          validatedPredictions[field] = this.getFallbackValue(field);
        }
      }
    });

    return validatedPredictions;
  }

  /**
   * Get fallback predictions for use phase stage
   */
  getFallbackUsePhasePredictions(projectContext, missingFields) {
    const fallbacks = {};

    missingFields.forEach((field) => {
      fallbacks[field] = this.getFallbackValue(field, projectContext.MetalType);
    });

    return fallbacks;
  }

  /**
   * Predict missing end-of-life fields based on project context and provided fields
   */
  async predictEndOfLifeFields(projectContext, providedFields, missingFields) {
    try {
      const prompt = this.formatEndOfLifePrompt(
        projectContext,
        providedFields,
        missingFields
      );

      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("AI prediction timeout")),
            this.timeout
          )
        ),
      ]);

      const response = await result.response;
      const text = response.text();

      const predictions = this.parsePredictionResponse(text, missingFields);
      const validatedPredictions = this.validateEndOfLifePredictions(
        predictions,
        missingFields
      );

      return {
        success: true,
        predictions: validatedPredictions,
        metadata: {
          model: process.env.GEMINI_MODEL || "gemini-pro",
          prompt: prompt,
          reasoning: text,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(validatedPredictions),
        },
      };
    } catch (error) {
      console.error("AI End-of-Life Prediction Error:", error);
      return {
        success: false,
        error: error.message,
        fallbackPredictions: this.getFallbackEndOfLifePredictions(
          projectContext,
          missingFields
        ),
      };
    }
  }

  /**
   * Format the end-of-life prediction prompt
   */
  formatEndOfLifePrompt(projectContext, providedFields, missingFields) {
    const metalTypeContext = this.getMetalTypeContext(
      projectContext.MetalType
    );
    const processingModeContext = this.getProcessingModeContext(
      projectContext.ProcessingMode
    );

    return `You are an expert metallurgist and LCA specialist. Based on the following end-of-life/recycling project context, predict realistic values for the missing parameters.

PROJECT CONTEXT:
- Metal Type: ${projectContext.MetalType}
- Processing Mode: ${projectContext.ProcessingMode}
- Functional Unit: ${projectContext.FunctionalUnitMassTonnes} tonnes
- Project Name: ${projectContext.ProjectName}

${metalTypeContext}
${processingModeContext}

END-OF-LIFE STAGE CONTEXT:
This stage covers the end-of-life management of metal products, including collection, recycling, downcycling, and disposal. This is the most critical stage for circular economy assessment as it determines how much material returns to the production cycle versus being lost to landfill. Different metals have different recycling infrastructures and efficiencies.

PROVIDED PARAMETERS:
${Object.entries(providedFields)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

MISSING PARAMETERS TO PREDICT:
${missingFields.map((field) => `- ${field}`).join("\n")}

CONSTRAINTS:
- TransportDistanceKilometersToRecycler: 0-2000 km (typical range: 50-500)
- DowncyclingFractionPercent: 0-100% (typical range: 10-40% depending on metal)
- LandfillSharePercent: 0-100% (typical range: 5-30% for metals)

RELATIONSHIPS TO CONSIDER:
- Higher collection rates typically correlate with better recycling infrastructure
- Transport distances depend on recycling facility density and geography
- Downcycling rates vary significantly by metal type and application
- Landfill rates are generally inverse to collection rates
- Circular processing modes typically have lower landfill rates and transport distances

METAL-SPECIFIC CONSIDERATIONS:
- Aluminium: Excellent recycling infrastructure, low downcycling, minimal landfilling
- Copper: Good recycling rates, moderate transport distances, some downcycling
- Critical Minerals: Variable recycling depending on specific mineral, often higher transport distances

Please provide ONLY a JSON response with the predicted values. Use realistic industry-standard values that are consistent with the provided parameters and metal type. Format:

{
  "TransportDistanceKilometersToRecycler": <value>,
  "DowncyclingFractionPercent": <value>,
  "LandfillSharePercent": <value>
}`;
  }

  /**
   * Validate end-of-life predictions against constraints
   */
  validateEndOfLifePredictions(predictions, missingFields) {
    const constraints = {
      TransportDistanceKilometersToRecycler: { min: 0, max: 2000 },
      DowncyclingFractionPercent: { min: 0, max: 100 },
      LandfillSharePercent: { min: 0, max: 100 },
    };

    const validatedPredictions = {};

    Object.entries(predictions).forEach(([field, value]) => {
      if (missingFields.includes(field) && constraints[field]) {
        const constraint = constraints[field];
        const numValue = parseFloat(value);

        if (
          !isNaN(numValue) &&
          numValue >= constraint.min &&
          numValue <= constraint.max
        ) {
          validatedPredictions[field] = numValue;
        } else {
          // Use fallback value if prediction is invalid
          validatedPredictions[field] = this.getFallbackValue(field);
        }
      }
    });

    return validatedPredictions;
  }

  /**
   * Get fallback predictions for end-of-life stage
   */
  getFallbackEndOfLifePredictions(projectContext, missingFields) {
    const fallbacks = {};

    missingFields.forEach((field) => {
      fallbacks[field] = this.getFallbackValue(field, projectContext.MetalType);
    });

    return fallbacks;
  }

  /**
   * Get fallback value for a specific field
   */
  getFallbackValue(field, metalType = "Copper") {
    const fallbackValues = {
      Aluminium: {
        // Mining stage
        ReagentsKilogramsPerTonneOre: 8.0,
        WaterWithdrawalCubicMetersPerTonneOre: 3.5,
        TransportDistanceKilometersToConcentrator: 25.0,
        // Concentration stage
        ConcentrationReagentsKilogramsPerTonneConcentrate: 25.0,
        ConcentrationWaterCubicMetersPerTonneConcentrate: 8.0,
        WaterRecycleRatePercent: 85.0,
        // Smelting stage
        FuelSharePercent: 60.0,
        FluxesKilogramsPerTonneMetal: 120.0,
        EmissionControlEfficiencyPercent: 88.0,
        // Fabrication stage
        FabricationElectricityRenewableSharePercent: 45.0,
        AncillaryMaterialsKilogramsPerTonneProduct: 25.0,
        FabricationWaterCubicMetersPerTonneProduct: 3.5,
        // Use Phase stage
        MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: 150.0,
        MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit: 8.0,
        ReusePotentialPercent: 75.0,
        // End-of-Life stage
        TransportDistanceKilometersToRecycler: 150.0,
        DowncyclingFractionPercent: 15.0,
        LandfillSharePercent: 8.0,
      },
      Copper: {
        // Mining stage
        ReagentsKilogramsPerTonneOre: 5.0,
        WaterWithdrawalCubicMetersPerTonneOre: 2.8,
        TransportDistanceKilometersToConcentrator: 15.0,
        // Concentration stage
        ConcentrationReagentsKilogramsPerTonneConcentrate: 15.0,
        ConcentrationWaterCubicMetersPerTonneConcentrate: 6.0,
        WaterRecycleRatePercent: 80.0,
        // Smelting stage
        FuelSharePercent: 45.0,
        FluxesKilogramsPerTonneMetal: 80.0,
        EmissionControlEfficiencyPercent: 85.0,
        // Fabrication stage
        FabricationElectricityRenewableSharePercent: 35.0,
        AncillaryMaterialsKilogramsPerTonneProduct: 20.0,
        FabricationWaterCubicMetersPerTonneProduct: 2.8,
        // Use Phase stage
        MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: 120.0,
        MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit: 6.0,
        ReusePotentialPercent: 65.0,
        // End-of-Life stage
        TransportDistanceKilometersToRecycler: 120.0,
        DowncyclingFractionPercent: 20.0,
        LandfillSharePercent: 12.0,
      },
      CriticalMinerals: {
        // Mining stage
        ReagentsKilogramsPerTonneOre: 12.0,
        WaterWithdrawalCubicMetersPerTonneOre: 4.2,
        TransportDistanceKilometersToConcentrator: 50.0,
        // Concentration stage
        ConcentrationReagentsKilogramsPerTonneConcentrate: 35.0,
        ConcentrationWaterCubicMetersPerTonneConcentrate: 12.0,
        WaterRecycleRatePercent: 75.0,
        // Smelting stage
        FuelSharePercent: 70.0,
        FluxesKilogramsPerTonneMetal: 150.0,
        EmissionControlEfficiencyPercent: 80.0,
        // Fabrication stage
        FabricationElectricityRenewableSharePercent: 30.0,
        AncillaryMaterialsKilogramsPerTonneProduct: 35.0,
        FabricationWaterCubicMetersPerTonneProduct: 4.5,
        // Use Phase stage
        MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: 200.0,
        MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit: 12.0,
        ReusePotentialPercent: 55.0,
        // End-of-Life stage
        TransportDistanceKilometersToRecycler: 250.0,
        DowncyclingFractionPercent: 35.0,
        LandfillSharePercent: 25.0,
      },
    };

    return (
      fallbackValues[metalType]?.[field] || fallbackValues["Copper"][field] || 0
    );
  }

  /**
   * Check if AI prediction is enabled
   */
  isEnabled() {
    return (
      process.env.AI_PREDICTION_ENABLED === "true" && process.env.GEMINI_API_KEY
    );
  }
}

module.exports = new AIPredictionService();
