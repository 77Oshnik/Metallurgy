/**
 * computeStageOutputs(stageName, inputs)
 * computeAggregateKPIs(projectContext, allStageValues)
 *
 * These are intentionally light-weight and contain clear integration points where your existing
 * deterministic stage calculation functions should be called. Replace the stubbed computations
 * with calls to the real formulas.
 */
async function computeStageOutputs(stageName, inputs) {
	// TODO: Call into existing deterministic formulas for the given stage.
	// Example: const outputs = StageCalculators[stageName].computeOutputs(inputs);
	// For now return a small stub based on inputs.
	const outputs = {
		stageName,
		calculatedMassKg: (inputs.massKg || 1) * (inputs.yieldPercent ? (inputs.yieldPercent / 100) : 1),
		energyConsumedMJ: (inputs.energyPerUnitMJ || 0) * (inputs.units || 1),
		otherMetrics: {}
	};
	return outputs;
}

function simpleMonteCarloEstimate(n = 200, deterministicFn, inputs) {
	const samples = [];
	for (let i = 0; i < n; i++) {
		// Simple perturbation around deterministic inputs for demo
		const jittered = {};
		for (const k of Object.keys(inputs)) {
			const v = inputs[k];
			if (typeof v === 'number') {
				const sd = Math.max(1e-6, Math.abs(v) * 0.05); // 5% noise
				const sample = v + (randomNormal() * sd);
				jittered[k] = sample;
			} else {
				jittered[k] = v;
			}
		}
		const out = deterministicFn(jittered);
		samples.push(out);
	}
	// For simplicity assume deterministicFn returns an object of KPI numbers
	const aggregated = {};
	const keys = Object.keys(samples[0] || {});
	for (const key of keys) {
		const arr = samples.map(s => s[key] || 0);
		arr.sort((a, b) => a - b);
		const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
		const lower95 = arr[Math.floor(0.025 * arr.length)] || arr[0];
		const upper95 = arr[Math.floor(0.975 * arr.length)] || arr[arr.length - 1];
		aggregated[key] = { mean, lower95, upper95 };
	}
	return aggregated;
}

function randomNormal() {
	// Box-Muller
	let u = 0, v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

async function computeAggregateKPIs(projectContext, stageName, stageOutputs) {
	// TODO: Replace with your project's KPI aggregation functions that combine across stages.
	// Here we synthesize aggregate KPIs from stageOutputs.
	const aggregateKPIs = {
		CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnit: (stageOutputs.energyConsumedMJ || 0) * 0.05,
		EnergyDemandMegajoulesPerFunctionalUnit: stageOutputs.energyConsumedMJ || 0,
		WaterUseCubicMetersPerFunctionalUnit: (stageOutputs.calculatedMassKg || 0) * 0.001,
		AcidificationPotentialKilogramsSulfurDioxideEquivalentPerFunctionalUnit: (stageOutputs.energyConsumedMJ || 0) * 0.001,
		HumanToxicityIndex: (stageOutputs.calculatedMassKg || 0) * 0.01,
		RecycledContentPercent: stageOutputs.recycledContentPercent || 0,
		RecyclabilityRatePercent: stageOutputs.recyclabilityRatePercent || 0,
		LoopCount: stageOutputs.loopCount || 1,
		ResourceEfficiencyPercent: stageOutputs.resourceEfficiencyPercent || 0
	};

	// Probability distributions via Monte Carlo using a simple wrapper.
	const deterministicKPIfn = (inputs) => {
		// map inputs to KPI object similar to aggregateKPIs
		const so = {
			calculatedMassKg: inputs.calculatedMassKg || stageOutputs.calculatedMassKg,
			energyConsumedMJ: inputs.energyConsumedMJ || stageOutputs.energyConsumedMJ
		};
		return {
			CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnit: (so.energyConsumedMJ || 0) * 0.05,
			EnergyDemandMegajoulesPerFunctionalUnit: so.energyConsumedMJ || 0,
			WaterUseCubicMetersPerFunctionalUnit: (so.calculatedMassKg || 0) * 0.001
		};
	};
	const probabilityDistributions = simpleMonteCarloEstimate(200, deterministicKPIfn, stageOutputs);

	// Hotspot ranking: simple ranking by sensitivity (difference if input +/- 5%)
	const hotspotRanking = [];
	const numericInputs = Object.entries(stageOutputs).filter(([k, v]) => typeof v === 'number');
	for (const [k, base] of numericInputs) {
		const up = deterministicKPIfn(Object.assign({}, stageOutputs, { [k]: base * 1.05 }));
		const down = deterministicKPIfn(Object.assign({}, stageOutputs, { [k]: base * 0.95 }));
		// measure impact on primary KPI: Carbon
		const impact = Math.abs((up.CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnit || 0) - (down.CarbonFootprintKilogramsCarbonDioxideEquivalentPerFunctionalUnit || 0)) / 2;
		hotspotRanking.push({ parameter: k, stage: stageName, impactScore: impact, description: `Sensitivity of ${k} on carbon` });
	}
	hotspotRanking.sort((a, b) => b.impactScore - a.impactScore);

	return { aggregateKPIs, probabilityDistributions, hotspotRanking };
}

module.exports = { computeStageOutputs, computeAggregateKPIs };
