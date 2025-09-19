const mongoose = require('mongoose');

const circularAnalysisSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true,
    },
    totalOutputs: {
        CarbonFootprint: { type: Number },
        EnergyFootprint: { type: Number },
    },
    optimizationInsights: [{
        type: String,
    }],
}, {
    timestamps: true,
    collection: 'circular_analyses'
});

module.exports = mongoose.model('CircularAnalysis', circularAnalysisSchema);
