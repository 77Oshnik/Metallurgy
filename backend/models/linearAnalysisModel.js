const mongoose = require('mongoose');

const linearAnalysisSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true,
    },
    totalOutputsStages1to5: {
        CarbonFootprint: { type: Number },
        EnergyFootprint: { type: Number },
    },
    predictedEndOfLifeInputs: {
        CollectionRatePercent: { type: Number },
        RecyclingEfficiencyPercent: { type: Number },
        RecyclingEnergyKilowattHoursPerTonneRecycled: { type: Number },
        TransportDistanceKilometersToRecycler: { type: Number },
        DowncyclingFractionPercent: { type: Number },
        LandfillSharePercent: { type: Number },
    },
    predictedEndOfLifeOutputs: {
        EndOfLifeRecyclingRatePercent: { type: Number },
        RecycledMassTonnesPerFunctionalUnit: { type: Number },
        LandfilledMassTonnesPerFunctionalUnit: { type: Number },
        CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnitForEndOfLife: { type: Number },
        ScrapUtilizationFraction: { type: Number },
    },
    totalOutputsWithPrediction: {
        CarbonFootprint: { type: Number },
        EnergyFootprint: { type: Number },
    },
    improvementInsights: [{
        type: String,
    }],
}, {
    timestamps: true,
    collection: 'linear_analyses'
});

module.exports = mongoose.model('LinearAnalysis', linearAnalysisSchema);
