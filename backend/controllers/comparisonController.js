const Project = require('../models/projectModel');
const LinearAnalysis = require('../models/linearAnalysisModel');
const CircularAnalysis = require('../models/circularAnalysisModel');
const { aggregateStageData } = require('../utils/dataAggregator');
const { getLinearAnalysis, getCircularAnalysis } = require('../services/geminiComparisonService');

const handleComparisonRequest = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.ProcessingMode === 'Linear') {
            // Fetch and aggregate data for stages 1-5
            const { aggregatedOutputs: totalOutputsStages1to5, warnings } = await aggregateStageData(projectId, 5);

            if (warnings.length > 0) {
                return res.status(400).json({ message: 'Missing stage data, cannot perform analysis.', warnings });
            }

            // Get Stage 6 predictions and improvement insights from Gemini
            const { predictedInputs, predictedOutputs, improvements } = await getLinearAnalysis(totalOutputsStages1to5);

            // Calculate final totals including predicted Stage 6
            const totalOutputsStages1to6 = {
                CarbonFootprint: totalOutputsStages1to5.CarbonFootprint + predictedOutputs.CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForEndOfLife,
                EnergyFootprint: totalOutputsStages1to5.EnergyFootprint + (predictedOutputs.EnergyFootprintMegajoulesPerFunctionalUnitForEndOfLife || 0), // Assuming energy might not always be predicted
            };

            const analysisData = {
                projectId,
                totalOutputsStages1to5,
                predictedEndOfLifeInputs: predictedInputs,
                predictedEndOfLifeOutputs: predictedOutputs,
                totalOutputsWithPrediction: totalOutputsStages1to6,
                improvementInsights: improvements,
            };

            const savedAnalysis = await LinearAnalysis.findOneAndUpdate(
                { projectId },
                analysisData,
                { new: true, upsert: true }
            );
            return res.json(savedAnalysis);

        } else if (project.ProcessingMode === 'Circular') {
            // Fetch and aggregate data for all 6 stages
            const { aggregatedOutputs, warnings } = await aggregateStageData(projectId, 6);

            if (warnings.length > 0) {
                return res.status(400).json({ message: 'Missing stage data, cannot perform analysis.', warnings });
            }

            // Get optimization insights from Gemini
            const { improvements } = await getCircularAnalysis(aggregatedOutputs);

            const analysisData = {
                projectId,
                totalOutputs: aggregatedOutputs,
                optimizationInsights: improvements,
            };

            const savedAnalysis = await CircularAnalysis.findOneAndUpdate(
                { projectId },
                analysisData,
                { new: true, upsert: true }
            );
            return res.json(savedAnalysis);
        } else {
            return res.status(400).json({ message: 'Invalid project processing mode.' });
        }

    } catch (error) {
        console.error('Comparison Controller Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// New: GET handler moved to controller
const getComparison = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Try to find a linear analysis result first
    const linear = await LinearAnalysis.findOne({ projectId }).lean();
    if (linear) {
      return res.status(200).json(linear);
    }

    // Otherwise try to find a circular analysis result
    const circular = await CircularAnalysis.findOne({ projectId }).lean();
    if (circular) {
      return res.status(200).json(circular);
    }

    // Not found
    return res.status(404).json({ message: 'No comparison analysis found for this project.' });
  } catch (error) {
    console.error('Error fetching comparison result:', error);
    return res.status(500).json({ message: 'Server error fetching comparison result.' });
  }
};

module.exports = {
  handleComparisonRequest,
  getComparison
};
