const mongoose = require('mongoose');
const WhatIfScenario = require('../models/what_if_scenario');
const aiImputer = require('../services/aiImputer');
const kpiCalc = require('../services/kpiCalculator');

// Attempt to require Project model if present (not mandatory for this feature)
let Project;
try {
	Project = require('../models/project');
} catch (e) {
	Project = null;
}

/**
 * POST /api/whatif/:ProjectIdentifier/:StageName
 * Body: { scenarioName, inputs: { ... }, cloneBaseline: boolean, expectedFields: [ ... ] (optional) }
 */
async function createScenario(req, res) {
	const { ProjectIdentifier, StageName } = req.params;
	const { scenarioName, inputs = {}, cloneBaseline = false, expectedFields = [] } = req.body || {};

	if (!ProjectIdentifier || !StageName) {
		return res.status(400).json({ error: 'ProjectIdentifier and StageName required' });
	}
	if (!scenarioName) {
		return res.status(400).json({ error: 'scenarioName required' });
	}

	// Load baseline stage inputs if cloneBaseline or for context
	let baselineStageInputs = {};
	if (Project && cloneBaseline) {
		try {
			// Replace with your project's baseline retrieval logic.
			const project = await Project.findById(ProjectIdentifier).lean();
			if (project && project.stages && project.stages[StageName]) {
				baselineStageInputs = project.stages[StageName].inputs || {};
			}
		} catch (err) {
			// ignore, continue without baseline
		}
	}

	// Determine expected fields: prefer provided expectedFields, else union of baseline + provided inputs keys
	let expected = Array.isArray(expectedFields) && expectedFields.length ? expectedFields : Array.from(new Set([...(Object.keys(baselineStageInputs || {})), ...(Object.keys(inputs || {}))]));

	// AI imputation for missing fields
	const projectContext = {}; // populate with project metadata if available
	const imputeResult = await aiImputer.imputeMissingInputs(projectContext, StageName, inputs, expected);
	const mergedInputs = imputeResult.mergedInputs;
	const inputProvenance = imputeResult.provenance;
	const inputConfidenceScores = imputeResult.confidences;
	const warnings = imputeResult.warnings || [];

	// If imputation failed to fill required fields, return a warning (but still save scenario)
	const missingNow = expected.filter(f => mergedInputs[f] === undefined || mergedInputs[f] === null || mergedInputs[f] === '');
	if (missingNow.length > 0) {
		warnings.push(`Missing inputs: ${StageName} ${missingNow.join(', ')}`);
	}

	// Map stage display name to mounted API route base
	const stageRouteMap = {
		'Mining': 'mining',
		'Concentration': 'concentration',
		'Smelting': 'smelting',
		'Fabrication': 'fabrication',
		'Use Phase': 'usePhase',
		'End-of-Life': 'endOfLife'
	};
	const routeBase = stageRouteMap[StageName] || StageName.toLowerCase().replace(/\s+/g, '');

	// Build a URL for the stage route using the current request host/port
	const hostBase = `${req.protocol}://${req.get('host')}`;
	const routeUrl = `${hostBase}/api/${routeBase}/${encodeURIComponent(ProjectIdentifier)}`;

	// Attempt to POST mergedInputs to the stage route to get authoritative outputs
	let stageOutputs = null;
	let stageRouteStatus = null;
	let stageRouteResponse = null;

	// pick fetch implementation
	let fetchFn = global.fetch;
	if (!fetchFn) {
		try { fetchFn = require('node-fetch'); } catch (e) { fetchFn = null; }
	}

	if (fetchFn) {
		try {
			// Many stage endpoints expect fields directly in the JSON body; send mergedInputs as top-level body
			const resp = await fetchFn(routeUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(mergedInputs),
				// do not follow redirects automatically - default behaviour acceptable
			});
			stageRouteStatus = resp.status;
			let bodyJson = null;
			try {
				bodyJson = await resp.json();
			} catch (e) {
				const txt = await resp.text().catch(() => '');
				bodyJson = { text: txt };
			}
			stageRouteResponse = bodyJson;

			if (resp.ok) {
				// The stage endpoint may return outputs directly or wrap them; attempt to locate outputs
				// Prefer a property named outputs, else use the full response body
				if (bodyJson && typeof bodyJson === 'object' && (bodyJson.outputs || bodyJson.stageOutputs || bodyJson.result)) {
					stageOutputs = bodyJson.outputs || bodyJson.stageOutputs || bodyJson.result;
				} else {
					stageOutputs = bodyJson;
				}
			} else {
				// Non-OK: leave stageOutputs null so fallback will compute
				warnings.push(`Stage route returned ${resp.status} for ${routeUrl}`);
			}
		} catch (err) {
			warnings.push(`Failed calling stage route ${routeUrl}: ${err && err.message ? err.message : String(err)}`);
		}
	} else {
		warnings.push('No fetch available in runtime to call stage routes; will compute outputs locally.');
	}

	// Fallback to local compute if route did not yield outputs
	if (!stageOutputs) {
		try {
			stageOutputs = await kpiCalc.computeStageOutputs(StageName, mergedInputs);
		} catch (err) {
			stageOutputs = { stageName: StageName, error: 'failed to compute outputs' };
			warnings.push(`Failed to compute stage outputs for ${StageName}: ${err && err.message ? err.message : String(err)}`);
		}
	}

	// Do not compute or persist aggregate KPIs here (per request). Store empty placeholders.
	const aggregateKPIs = {};
	const probabilityDistributions = {};
	const hotspotRanking = [];

	// Persist scenario
	// Ensure we construct an ObjectId safely and handle save errors gracefully
	let projectObjectId = ProjectIdentifier;
	try {
		if (mongoose.Types.ObjectId.isValid(ProjectIdentifier)) {
			// Use the constructor form which is safe in modern mongoose builds
			projectObjectId = new mongoose.Types.ObjectId(ProjectIdentifier);
		} else {
			// keep original value (will let Mongoose attempt to cast or fail)
			projectObjectId = ProjectIdentifier;
		}
	} catch (err) {
		// If coercion fails, keep raw value and proceed to let Mongoose validate on save
		projectObjectId = ProjectIdentifier;
	}

	let scenario;
	try {
		scenario = new WhatIfScenario({
			projectIdentifier: projectObjectId,
			stageName: StageName,
			scenarioName,
			inputs: mergedInputs,
			inputProvenance,
			inputConfidenceScores,
			outputs: stageOutputs,
			// store stage route metadata for traceability
			stageRouteUrl: routeUrl,
			stageRouteStatus: stageRouteStatus,
			stageRouteResponse: stageRouteResponse,
			aggregateKPIs, // empty placeholder
			hotspotRanking, // empty placeholder
			probabilityDistributions, // empty placeholder
			warnings
		});
		await scenario.save();
	} catch (err) {
		// Log full error server-side and return a safe message to client
		console.error('Failed to create/save WhatIfScenario:', err);
		return res.status(500).json({
			error: 'Failed to save scenario',
			details: err && err.message ? err.message : String(err)
		});
	}

	// Prepare response per spec (include scenarioId and Location header)
	const response = {
		scenarioId: scenario._id,
		scenarioName: scenario.scenarioName,
		inputs: scenario.inputs,
		inputProvenance: scenario.inputProvenance,
		inputConfidenceScores: scenario.inputConfidenceScores,
		outputs: scenario.outputs,
		stageRoute: {
			url: scenario.stageRouteUrl,
			status: scenario.stageRouteStatus,
			response: scenario.stageRouteResponse
		},
		aggregateKPIs: {}, // intentionally empty
		hotspotRanking: [],
		probabilityDistributions: {},
		warnings: scenario.warnings || []
	};

	// set Location header to the GET detail endpoint
	try {
		res.setHeader('Location', `/api/whatif/${ProjectIdentifier}/${scenario._id}`);
	} catch (e) {
		// ignore header set errors
	}

	return res.status(201).json(response);
}

async function listScenarios(req, res) {
	const { ProjectIdentifier } = req.params;
	if (!ProjectIdentifier) return res.status(400).json({ error: 'ProjectIdentifier required' });
	const scenarios = await WhatIfScenario.find({ projectIdentifier: ProjectIdentifier }).select('scenarioName stageName createdAtUtc updatedAtUtc').lean();
	return res.json({ scenarios });
}

async function getScenario(req, res) {
	const { ProjectIdentifier, ScenarioId } = req.params;
	if (!ProjectIdentifier || !ScenarioId) return res.status(400).json({ error: 'ProjectIdentifier and ScenarioId required' });
	const scenario = await WhatIfScenario.findOne({ _id: ScenarioId, projectIdentifier: ProjectIdentifier }).lean();
	if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
	// Ensure probabilityDistributions serialized as plain object
	const prob = scenario.probabilityDistributions && typeof scenario.probabilityDistributions.toObject === 'function'
		? scenario.probabilityDistributions.toObject()
		: scenario.probabilityDistributions;
	return res.json(Object.assign({}, scenario, { probabilityDistributions: prob }));
}

async function deleteScenario(req, res) {
	const { ProjectIdentifier, ScenarioId } = req.params;
	console.log('Delete scenario request:', { ProjectIdentifier, ScenarioId });
	
	if (!ProjectIdentifier || !ScenarioId) {
		console.log('Missing required parameters');
		return res.status(400).json({ error: 'ProjectIdentifier and ScenarioId required' });
	}
	
	try {
		console.log('Attempting to find and delete scenario...');
		const result = await WhatIfScenario.findOneAndDelete({ 
			_id: ScenarioId, 
			projectIdentifier: ProjectIdentifier 
		});
		
		console.log('Delete result:', result ? 'Found and deleted' : 'Not found');
		
		if (!result) {
			console.log('Scenario not found for deletion');
			return res.status(404).json({ error: 'Scenario not found' });
		}
		
		console.log('Scenario deleted successfully');
		return res.json({ message: 'Scenario deleted successfully' });
	} catch (err) {
		console.error('Error deleting scenario:', err);
		return res.status(500).json({ error: 'Failed to delete scenario', details: err.message });
	}
}

module.exports = { createScenario, listScenarios, getScenario, deleteScenario };
