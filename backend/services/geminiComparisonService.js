const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const callGemini = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-pro"});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonString = text.replace(/```json\n/g, "").replace(/```/g, "");
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis from AI service.");
    }
};

const getLinearAnalysis = async (aggregatedData) => {
    const prompt = `
        Given the aggregated LCA data for the first 5 stages of a linear metallurgy process: ${JSON.stringify(aggregatedData)}.
        Your tasks are:
        1. Predict the inputs for Stage 6 (End-of-Life) based on this data. The fields to predict are: CollectionRatePercent, RecyclingEfficiencyPercent, RecyclingEnergyKilowattHoursPerTonneRecycled, TransportDistanceKilometersToRecycler, DowncyclingFractionPercent, LandfillSharePercent.
        2. Predict the outputs for Stage 6. The fields to predict are: EndOfLifeRecyclingRatePercent, RecycledMassTonnesPerFunctionalUnit, LandfilledMassTonnesPerFunctionalUnit, CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForEndOfLife, ScrapUtilizationFraction.
        3. Provide 3-5 bullet points describing how implementing this predicted end-of-life stage improves the process's sustainability compared to just the first 5 stages.
        4. Provide proper units for all predicted numerical values along with the values and give them together in same line the JSON response.

        Return a single JSON object with three keys: "predictedInputs", "predictedOutputs", and "improvements" (which should be an array of strings).
    `;
    return await callGemini(prompt);
};

const getCircularAnalysis = async (aggregatedData) => {
    const prompt = `
        Given the aggregated LCA data for all 6 stages of a circular metallurgy process: ${JSON.stringify(aggregatedData)}.
        Your task is to provide 3-5 bullet points describing the key sustainability benefits and advantages of this circular process, based on the provided data.
        
        Return a single JSON object with one key: "improvements" (which should be an array of strings).
    `;
    return await callGemini(prompt);
};

module.exports = { getLinearAnalysis, getCircularAnalysis };
