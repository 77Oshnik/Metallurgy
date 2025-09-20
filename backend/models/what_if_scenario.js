const mongoose = require('mongoose');
const { Schema } = mongoose;

const KPIFields = {
	CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnit: { type: Number },
	EnergyDemandMegajoulesPerFunctionalUnit: { type: Number },
	WaterUseCubicMetersPerFunctionalUnit: { type: Number },
	AcidificationPotentialKilogramsSulfurDioxideEquivalentPerFunctionalUnit: { type: Number },
	HumanToxicityIndex: { type: Number },
	RecycledContentPercent: { type: Number },
	RecyclabilityRatePercent: { type: Number },
	LoopCount: { type: Number },
	ResourceEfficiencyPercent: { type: Number }
};

const ProbabilityRangeSchema = new Schema({
	mean: Number,
	lower95: Number,
	upper95: Number
}, { _id: false });

const WhatIfSchema = new Schema({
	projectIdentifier: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
	stageName: { type: String, required: true }, // e.g., Mining, Concentration, ...
	scenarioName: { type: String, required: true },
	inputs: { type: Schema.Types.Mixed }, // full field set for that stage
	inputProvenance: { type: Schema.Types.Mixed }, // { fieldName: "user" | "ai-predicted" }
	inputConfidenceScores: { type: Schema.Types.Mixed }, // { fieldName: confidenceValue }
	outputs: { type: Schema.Types.Mixed }, // computed outputs for that stage
	stageRouteUrl: { type: String }, // e.g. "http://localhost:5000/api/mining/PROJECTID"
	stageRouteStatus: { type: Number },
	stageRouteResponse: { type: Schema.Types.Mixed },
	aggregateKPIs: { type: Schema.Types.Mixed, default: {} },
	hotspotRanking: [{ // ranked list of contributions
		parameter: String,
		stage: String,
		impactScore: Number,
		description: String
	}],
	probabilityDistributions: { // for each KPI: { mean, lower95, upper95 }
		type: Map,
		of: ProbabilityRangeSchema
	},
	createdAtUtc: { type: Date, default: () => new Date() },
	updatedAtUtc: { type: Date, default: () => new Date() },
	warnings: [String]
}, { collection: 'what_if_scenarios' });

WhatIfSchema.pre('save', function (next) {
	this.updatedAtUtc = new Date();
	if (!this.createdAtUtc) this.createdAtUtc = this.updatedAtUtc;
	next();
});

module.exports = mongoose.model('WhatIfScenario', WhatIfSchema);
