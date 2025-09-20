const util = require('util');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;
const AI_PREDICTION_TIMEOUT = Number(process.env.AI_PREDICTION_TIMEOUT || 30000);
const AI_PREDICTION_ENABLED = (process.env.AI_PREDICTION_ENABLED || 'true').toLowerCase() !== 'false';

/**
 * imputeMissingInputs(projectContext, stageName, providedInputs, expectedFields)
 * - projectContext: object with project metadata (optional)
 * - stageName: string
 * - providedInputs: object with user-supplied inputs
 * - expectedFields: array of field names expected for that stage
 *
 * Returns:
 * {
 *   mergedInputs: { ... },
 *   provenance: { field: "user" | "ai-predicted" },
 *   confidences: { field: number 0-100 },
 *   warnings: [ ... ],
 *   aiReasoning: { field: "short reasoning" }
 * }
 */
async function imputeMissingInputs(projectContext, stageName, providedInputs = {}, expectedFields = []) {
	const merged = Object.assign({}, providedInputs);
	const provenance = {};
	const confidences = {};
	const aiReasoning = {};
	let warnings = [];

	// safe push that always leaves `warnings` as an array of strings
	function pushWarning(msg) {
		if (!Array.isArray(warnings)) warnings = [];
		if (msg === undefined || msg === null) {
			warnings.push(String(msg));
			return;
		}
		if (Array.isArray(msg)) {
			for (const m of msg) pushWarning(m);
			return;
		}
		if (typeof msg === 'string') {
			warnings.push(msg);
			return;
		}
		try {
			warnings.push(JSON.stringify(msg));
		} catch (e) {
			warnings.push(String(msg));
		}
	}

	// Identify missing fields
	const missing = expectedFields.filter(f => merged[f] === undefined || merged[f] === null || merged[f] === '');

	if (missing.length === 0) {
		for (const k of expectedFields) {
			provenance[k] = providedInputs[k] !== undefined ? 'user' : 'ai-predicted';
			confidences[k] = provenance[k] === 'user' ? 100 : 50;
			aiReasoning[k] = provenance[k] === 'user' ? 'provided by user' : 'default imputed';
		}
		return { mergedInputs: merged, provenance, confidences, warnings, aiReasoning };
	}

	// If AI predictions globally disabled, fallback deterministically
	if (!AI_PREDICTION_ENABLED) {
		pushWarning('AI prediction disabled by configuration (AI_PREDICTION_ENABLED=false)');
		for (const f of missing) {
			if (/percent|rate|share/i.test(f)) {
				merged[f] = 50;
				confidences[f] = 60;
			} else if (/mass|kg|g|ton|unit|units|count/i.test(f)) {
				merged[f] = 1;
				confidences[f] = 60;
			} else {
				merged[f] = 0;
				confidences[f] = 50;
			}
			provenance[f] = 'ai-predicted';
			aiReasoning[f] = 'default-fallback';
		}
		for (const k of Object.keys(providedInputs)) {
			provenance[k] = 'user';
			confidences[k] = 100;
			aiReasoning[k] = 'provided by user';
		}
		return { mergedInputs: merged, provenance, confidences, warnings, aiReasoning };
	}

	// If API key or model missing, fallback to simple imputation
	if (!GEMINI_API_KEY || !GEMINI_MODEL) {
		pushWarning('AI prediction disabled: GEMINI_API_KEY or GEMINI_MODEL not configured');
		// simple deterministic defaults
		for (const f of missing) {
			if (/percent|rate|share/i.test(f)) {
				merged[f] = 50;
				confidences[f] = 60;
			} else if (/mass|kg|g|ton|unit|units|count/i.test(f)) {
				merged[f] = 1;
				confidences[f] = 60;
			} else {
				merged[f] = 0;
				confidences[f] = 50;
			}
			provenance[f] = 'ai-predicted';
			aiReasoning[f] = 'default-fallback';
		}
		for (const k of Object.keys(providedInputs)) {
			provenance[k] = 'user';
			confidences[k] = 100;
			aiReasoning[k] = 'provided by user';
		}
		return { mergedInputs: merged, provenance, confidences, warnings, aiReasoning };
	}

	// Build prompt instructing the model to return strict JSON
	const promptText = [
		`You are an expert LCA assistant.`,
		`Project context: ${JSON.stringify(projectContext || {})}`,
		`Stage: ${stageName}`,
		`User provided inputs: ${JSON.stringify(providedInputs)}`,
		`Missing fields: ${JSON.stringify(missing)}`,
		`For each missing field return a JSON object with the schema:`,
		`{ "predictions": { "<fieldName>": { "value": <number|string>, "confidence": <0-100>, "reasoning": "<short explanation>" } } }`,
		`Return only valid JSON in the response body (no additional commentary).`
	].join('\n\n');

	// Use the project's geminiComparisonService approach (GoogleGenerativeAI client)
	async function callGeminiWithClient(prompt) {
		let genAI;
		try {
			const { GoogleGenerativeAI } = require('@google/generative-ai');
			genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
		} catch (err) {
			throw new Error('Google Generative AI client not available: ' + (err && err.message ? err.message : String(err)));
		}

		const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
		// model.generateContent accepts a string in geminiComparisonService usage
		const result = await model.generateContent(prompt);
		// result.response is a Promise-like in their pattern
		const response = await result.response;
		const text = response.text();

		// remove fenced code blocks if any
		const cleaned = String(text).replace(/```json\s*/gi, '').replace(/```/g, '').trim();
		return cleaned;
	}

	let geminiText;
	try {
		geminiText = await callGeminiWithClient(promptText);
	} catch (err) {
		pushWarning(`AI imputation failed: ${err && err.message ? err.message : String(err)}`);
		for (const f of missing) {
			if (/percent|rate|share/i.test(f)) {
				merged[f] = 50;
				confidences[f] = 30;
			} else {
				merged[f] = 1;
				confidences[f] = 30;
			}
			provenance[f] = 'ai-predicted';
			aiReasoning[f] = 'ai-imputation-failed';
		}
		for (const k of Object.keys(providedInputs)) {
			provenance[k] = 'user';
			confidences[k] = 100;
			aiReasoning[k] = 'provided by user';
		}
		return { mergedInputs: merged, provenance, confidences, warnings, aiReasoning };
	}

	// Attempt to extract JSON substring from model text
	let parsed;
	try {
		let jsonStr = null;
		const codeBlockMatch = geminiText.match(/```(?:json)?\s*([\s\S]*?)```/i);
		if (codeBlockMatch && codeBlockMatch[1]) {
			jsonStr = codeBlockMatch[1];
		} else {
			const jsonMatch = geminiText.match(/(\{[\s\S]*\})/);
			jsonStr = jsonMatch ? jsonMatch[0] : null;
		}
		if (!jsonStr) jsonStr = geminiText;
		parsed = JSON.parse(jsonStr);
	} catch (err) {
		pushWarning('AI response parsing failed; expected JSON. Falling back to defaults.');
		for (const f of missing) {
			if (/percent|rate|share/i.test(f)) {
				merged[f] = 50;
				confidences[f] = 40;
			} else {
				merged[f] = 1;
				confidences[f] = 40;
			}
			provenance[f] = 'ai-predicted';
			aiReasoning[f] = 'ai-response-parse-error';
		}
		for (const k of Object.keys(providedInputs)) {
			provenance[k] = 'user';
			confidences[k] = 100;
			aiReasoning[k] = 'provided by user';
		}
		return { mergedInputs: merged, provenance, confidences, warnings, aiReasoning };
	}

	// Merge predictions if present
	if (parsed && parsed.predictions && typeof parsed.predictions === 'object') {
		for (const f of missing) {
			const pred = parsed.predictions[f];
			if (pred && pred.value !== undefined) {
				// try to coerce numeric-like strings to numbers (remove units if present)
				let value = pred.value;
				if (typeof value === 'string') {
					const numMatch = value.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
					if (numMatch) {
						value = Number(numMatch[0]);
					}
				}
				merged[f] = value;
				// store provisional provenance/confidence here but finalize later
				provenance[f] = 'ai-predicted';
				confidences[f] = Math.max(0, Math.min(100, Number(pred.confidence || 60)));
				aiReasoning[f] = pred.reasoning || 'ai-predicted';
			} else {
				// no prediction for this field - mark and leave for later normalization
				provenance[f] = 'ai-predicted';
				confidences[f] = 0;
				aiReasoning[f] = 'no_prediction';
				pushWarning(`Missing inputs: ${stageName} ${f} not available`);
			}
		}
	} else {
		// Unexpected structure
		pushWarning('AI returned unexpected JSON structure for predictions');
		for (const f of missing) {
			provenance[f] = 'ai-predicted';
			confidences[f] = 0;
			aiReasoning[f] = 'no_prediction';
			pushWarning(`Missing inputs: ${stageName} ${f} not available`);
		}
	}

	// Ensure fields provided by user are tagged and *do not* get overridden to ai-provenance/confidence
	// Also finalize provenance/confidences for all expected fields (use providedInputs presence as source of truth)
	function isUserProvided(key) {
		return Object.prototype.hasOwnProperty.call(providedInputs, key) && providedInputs[key] !== undefined && providedInputs[key] !== null && providedInputs[key] !== '';
	}

	// Finalize for all expected fields (not only missing) so caller receives a complete map
	for (const k of expectedFields) {
		if (isUserProvided(k)) {
			provenance[k] = 'user';
			confidences[k] = 100;
			aiReasoning[k] = 'provided by user';
			// ensure merged contains the user-provided value (coerce numeric if possible)
			let v = providedInputs[k];
			if (typeof v === 'string') {
				const numMatch = v.replace(/,/g, '').match(/^-?\d+(\.\d+)?$/);
				if (numMatch) v = Number(v);
			}
			merged[k] = v;
		} else {
			// not provided by user -> must be ai-predicted (or missing)
			// if already have ai prediction set above, keep it; otherwise try sensible defaults
			if (provenance[k] !== 'ai-predicted') provenance[k] = 'ai-predicted';
			if (confidences[k] === undefined || confidences[k] === null) {
				confidences[k] = 60; // default confidence for AI-imputed values
			} else {
				// clamp to 0-100 and ensure not 100 by default for AI
				confidences[k] = Math.max(0, Math.min(100, Number(confidences[k])));
				if (confidences[k] === 100) confidences[k] = 95; // avoid misleading perfect confidence
			}
			if (!aiReasoning[k]) aiReasoning[k] = 'ai-predicted';
			// coerce merged value if it is a numeric-like string
			if (merged[k] !== undefined && typeof merged[k] === 'string') {
				const numMatch = merged[k].replace(/,/g, '').match(/-?\d+(\.\d+)?/);
				if (numMatch) merged[k] = Number(numMatch[0]);
			}
		}
	}

	// Attempt to compute stage outputs by calling existing stage controller if available
	let stageOutputs = null;
	let stageControllerInfo = null;
	try {
		const loaded = tryLoadStageModule(stageName);
		if (loaded && loaded.method) {
			const fn = loaded.module[loaded.method];
			stageControllerInfo = { source: loaded.source, method: loaded.method };
			const maybePromise = fn(merged, projectContext);
			stageOutputs = (maybePromise && typeof maybePromise.then === 'function') ? await maybePromise : maybePromise;
		}
	} catch (err) {
		pushWarning(`Stage controller output computation failed: ${err && err.message ? err.message : String(err)}`);
		stageOutputs = null;
		stageControllerInfo = null;
	}

	// return stageOutputs alongside imputation results
	return { mergedInputs: merged, provenance, confidences, warnings, aiReasoning, stageOutputs, stageControllerInfo };
}

// helper: attempt to load a stage controller/model to compute outputs
function tryLoadStageModule(stageName) {
	const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
	const base = norm(stageName);
	const candidates = [
		`../controllers/${base}Controller`,
		`../controllers/stages/${base}Controller`,
		`../controllers/${base}`,
		`../models/${base}`,
		`../models/stages/${base}`,
	];
	for (const p of candidates) {
		try {
			const mod = require(p);
			// detect available compute method names
			const methods = ['computeOutputs', 'calculateOutputs', 'getOutputs', 'processInputs', 'outputsForInputs'];
			for (const m of methods) {
				if (mod && typeof mod[m] === 'function') {
					return { module: mod, method: m, source: p };
				}
			}
			// if it's a mongoose model, expose schema paths
			if (mod && mod.schema && mod.schema.paths) {
				return { module: mod, method: null, source: p };
			}
			// generic module found
			return { module: mod, method: null, source: p };
		} catch (e) {
			// ignore require errors
		}
	}
	return null;
}

module.exports = { imputeMissingInputs };
