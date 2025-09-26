const { GoogleGenerativeAI } = require('@google/generative-ai');

class RenewableInsightsService {
  constructor() {
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
        temperature: 0.6,
        maxOutputTokens: 1800,
      }
    });
  }

  async generateRenewableInsights(scenarioData, projectContext) {
    if (!this.enabled) {
      return this.getFallbackInsights(scenarioData, projectContext);
    }

    try {
      const prompt = this.formatInsightsPrompt(scenarioData, projectContext);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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
   * 📌 Improved Prompt for Renewable Energy Insights
   */
  formatInsightsPrompt(scenarioData, projectContext) {
    return `You are a professional sustainability and metallurgy consultant.
You specialize in Life Cycle Assessment (LCA), industrial decarbonization, and renewable integration in metallurgy.

We are analyzing a renewable energy transition scenario in a ${projectContext.MetalType} project.

---
PROJECT CONTEXT:
- Project Name: ${projectContext.ProjectName}
- Metal Type: ${projectContext.MetalType}
- Processing Mode: ${projectContext.ProcessingMode}
- Stage: ${scenarioData.StageName}
- Functional Unit: ${projectContext.FunctionalUnitMassTonnes} tonnes

SCENARIO DATA:
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

---
TASK:
Provide **exactly 5 detailed insights** in JSON format.
Each must be:
- Industry-specific, realistic, and professionally written.
- Include **quantitative values** (e.g., % reduction, kg CO₂/t, $/t, MW, hectares).
- Contextualized to metallurgy (smelting, refining, manufacturing).
- Categorized under: environmental, economic, technical, regulatory, social.

---
RESPONSE FORMAT (STRICT JSON):
{
  "insights": [
    {
      "title": "Descriptive professional title",
      "description": "Detailed explanation with real-world metallurgy context, specific numbers, technologies, and benchmarks.",
      "category": "environmental|economic|technical|regulatory|social",
      "impact": "Quantified measurable impact (kg CO₂e, %, $/t, etc.)",
      "confidence": "high|medium|low"
    }
  ]
}

---
INSIGHT CATEGORIES & EXPECTED DEPTH:
1. Environmental → emission reductions, water use, air quality (e.g., “Reduction of 1,200 kg CO₂/t aluminum smelted by switching 50% to hydropower”).
2. Economic → OPEX, CAPEX, ROI, carbon pricing savings, premium pricing potential.
3. Technical → infrastructure, technology readiness (TRL), efficiency improvements, reliability.
4. Regulatory → compliance with EU ETS, CBAM, ISO 14040/44, tax credits, green certification.
5. Social → community jobs, ESG scores, worker health, customer perception.

Provide values where possible, e.g., “Energy savings of 3.5–4.2 GJ/t steel”, “Payback period ~5 years under EU carbon price of €90/t CO₂”.

Return JSON only.`;
  }

  parseInsightsResponse(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const response = JSON.parse(jsonMatch[0]);
        return response.insights || [];
      }
    } catch (error) {
      console.error("Error parsing AI insights response:", error);
    }
    return this.extractInsightsFromText(text);
  }

  extractInsightsFromText(text) {
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
