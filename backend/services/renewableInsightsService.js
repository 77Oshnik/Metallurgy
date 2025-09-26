const { GoogleGenerativeAI } = require('@google/generative-ai');

class RenewableInsightsService {
  constructor() {
    // Use the same API key as the main AI service
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_CHATBOT_API_KEY;
    if (!apiKey) {
      console.warn('No Gemini API key found. AI insights will be disabled.');
      this.enabled = false;
      return;
    }

    this.enabled = true;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || process.env.CHATBOT_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    });
  }

  /**
   * Generate detailed insights for renewable energy transition scenarios
   * @param {Object} scenarioData - The energy transition scenario data
   * @param {Object} projectContext - Project context information
   * @returns {Promise<Object>} AI-generated insights
   */
  async generateRenewableInsights(scenarioData, projectContext) {
    if (!this.enabled) {
      return this.getFallbackInsights(scenarioData, projectContext);
    }

    try {
      const prompt = this.formatInsightsPrompt(scenarioData, projectContext);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const insights = this.parseInsightsResponse(text);
      
      return {
        success: true,
        insights: insights,
        metadata: {
          model: process.env.GEMINI_MODEL || process.env.CHATBOT_MODEL || 'gemini-1.5-flash',
          prompt: prompt,
          timestamp: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('AI Insights Generation Error:', error);
      return {
        success: false,
        error: error.message,
        fallbackInsights: this.getFallbackInsights(scenarioData, projectContext),
      };
    }
  }

  /**
   * Format the prompt for generating insights
   */
  formatInsightsPrompt(scenarioData, projectContext) {
    return `You are an expert sustainability consultant and metallurgist. Based on the following renewable energy transition scenario, provide 5 detailed, realistic insights about the environmental and economic impacts of this transition.

PROJECT CONTEXT:
- Project Name: ${projectContext.ProjectName}
- Metal Type: ${projectContext.MetalType}
- Processing Mode: ${projectContext.ProcessingMode}
- Stage: ${scenarioData.StageName}
- Functional Unit: ${projectContext.FunctionalUnitMassTonnes} tonnes

RENEWABLE ENERGY TRANSITION SCENARIO:
- Baseline Carbon Footprint: ${scenarioData.BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit.toFixed(2)} kg CO₂e/FU
- Scenario Carbon Footprint: ${scenarioData.ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit.toFixed(2)} kg CO₂e/FU
- Carbon Reduction: ${scenarioData.CarbonReductionPercent.toFixed(1)}%
- Renewable Energy Share: ${scenarioData.UserScenario.RenewableSharePercent}%
- Energy Mix:
  * Grid (Fossil): ${scenarioData.UserScenario.EnergySourceMix.grid}%
  * Solar: ${scenarioData.UserScenario.EnergySourceMix.solar}%
  * Wind: ${scenarioData.UserScenario.EnergySourceMix.wind}%
  * Hydro: ${scenarioData.UserScenario.EnergySourceMix.hydro}%
  * Geothermal: ${scenarioData.UserScenario.EnergySourceMix.geothermal}%
  * Biomass: ${scenarioData.UserScenario.EnergySourceMix.biomass}%

Please provide 5 detailed insights in the following JSON format. Each insight should be realistic, specific, and actionable. Include quantifiable benefits where possible:

{
  "insights": [
    {
      "title": "Descriptive title of the insight",
      "description": "Detailed explanation of the insight with specific numbers and real-world context",
      "category": "environmental|economic|technical|regulatory|social",
      "impact": "quantified impact with units where applicable",
      "confidence": "high|medium|low"
    }
  ]
}

INSIGHT CATEGORIES:
1. Environmental: Focus on emissions reductions, resource conservation, pollution prevention
2. Economic: Focus on cost savings, investment requirements, ROI, operational expenses
3. Technical: Focus on implementation challenges, technology requirements, infrastructure needs
4. Regulatory: Focus on compliance benefits, policy alignment, certification advantages
5. Social: Focus on community benefits, job creation, health improvements

EXAMPLE RESPONSE FORMAT:
{
  "insights": [
    {
      "title": "Significant CO₂ Emission Reductions Achieved",
      "description": "Transitioning to ${scenarioData.UserScenario.RenewableSharePercent}% renewable energy in the ${scenarioData.StageName} stage reduces CO₂ emissions by ${scenarioData.CarbonReductionPercent.toFixed(1)}%, equivalent to removing approximately X passenger vehicles from the road annually for a facility processing ${projectContext.FunctionalUnitMassTonnes} tonnes per year.",
      "category": "environmental",
      "impact": "${(scenarioData.BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit - scenarioData.ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit).toFixed(2)} kg CO₂e/FU reduction",
      "confidence": "high"
    }
  ]
}

Provide exactly 5 insights, one for each category. Make them specific to metallurgy and the ${projectContext.MetalType} industry. Include realistic numbers and practical implications.`;
  }

  /**
   * Parse the AI response and extract insights
   */
  parseInsightsResponse(text) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const response = JSON.parse(jsonMatch[0]);
        return response.insights || [];
      }
    } catch (error) {
      console.error("Error parsing AI insights response:", error);
    }

    // Fallback to extracting insights from plain text
    return this.extractInsightsFromText(text);
  }

  /**
   * Extract insights from plain text response
   */
  extractInsightsFromText(text) {
    // Simple extraction - in a real implementation, this would be more sophisticated
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const insights = [];
    
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      insights.push({
        title: `Insight ${i + 1}`,
        description: lines[i].trim(),
        category: ["environmental", "economic", "technical", "regulatory", "social"][i % 5],
        impact: "N/A",
        confidence: "medium"
      });
    }
    
    return insights;
  }

  /**
   * Get fallback insights when AI is disabled or fails
   */
  getFallbackInsights(scenarioData, projectContext) {
    const reductionAmount = scenarioData.BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit - 
                           scenarioData.ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit;
    
    return [
      {
        title: "Significant Carbon Footprint Reduction",
        description: `Transitioning to ${scenarioData.UserScenario.RenewableSharePercent}% renewable energy reduces CO₂ emissions by ${scenarioData.CarbonReductionPercent.toFixed(1)}%. For a facility processing ${projectContext.FunctionalUnitMassTonnes} tonnes annually, this translates to approximately ${(reductionAmount * projectContext.FunctionalUnitMassTonnes).toFixed(0)} kg of CO₂ avoided per year.`,
        category: "environmental",
        impact: `${reductionAmount.toFixed(2)} kg CO₂e/FU reduction`,
        confidence: "high"
      },
      {
        title: "Economic Benefits Through Energy Cost Savings",
        description: `Renewable energy sources typically have lower operational costs than fossil fuels once infrastructure is installed. Based on current energy prices, this transition could reduce electricity costs by 15-30% in the ${scenarioData.StageName} stage, with payback periods of 3-7 years depending on local incentives.`,
        category: "economic",
        impact: "15-30% energy cost reduction potential",
        confidence: "medium"
      },
      {
        title: "Enhanced Corporate Sustainability Profile",
        description: `This renewable energy transition aligns with ESG (Environmental, Social, Governance) goals and can improve your company's sustainability ratings. Many ${projectContext.MetalType} producers see 5-15% premium pricing for products from certified green facilities.`,
        category: "social",
        impact: "5-15% potential premium pricing",
        confidence: "medium"
      },
      {
        title: "Regulatory Compliance Advantages",
        description: `With increasing carbon pricing and emissions regulations, this transition positions your facility ahead of compliance requirements. Many jurisdictions offer tax incentives and grants for renewable energy adoption in metallurgy sectors.`,
        category: "regulatory",
        impact: "Future regulatory compliance assurance",
        confidence: "high"
      },
      {
        title: "Technology Infrastructure Requirements",
        description: `Implementation will require upgrading electrical infrastructure to accommodate renewable sources. Solar installations typically require 2-5 acres per MW capacity, while wind may need 30-40 acres per MW. Energy storage systems may be needed for consistent supply.`,
        category: "technical",
        impact: "Infrastructure upgrade requirements",
        confidence: "high"
      }
    ];
  }
}

module.exports = new RenewableInsightsService();