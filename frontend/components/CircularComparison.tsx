'use client';

import { useEffect, useState } from "react";

interface ComparisonResult {
	Mode?: string;
	Warnings?: string[];
	PredictedInputs?: Record<string, any>;
	PredictedOutputs?: Record<string, any>;
	Improvements?: Array<{ Field?: string; SuggestedChange?: string; Benefit?: string }>;
	StageRecommendations?: Array<{ StageName?: string; Field?: string; SuggestedChange?: string; Benefit?: string }>;
	OverallBenefits?: string[];
	// Allow other keys
	[key: string]: any;
}

const SummaryCard = ({ title, data }: { title: string, data: Record<string, any> | null }) => {
	if (!data) return null;
	return (
		<div className="p-4 rounded-lg bg-background border">
			<h4 className="font-semibold text-md mb-2">{title}</h4>
			<div className="space-y-1 text-sm">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Carbon Footprint (kg CO₂e):</span>
					<span>{data.CarbonFootprint?.toFixed(2) ?? 'N/A'}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Energy Footprint (MJ):</span>
					<span>{data.EnergyFootprint?.toFixed(2) ?? 'N/A'}</span>
				</div>
			</div>
		</div>
	);
};

const DataTable = ({ title, data }: { title: string, data: Record<string, any> | null }) => {
	if (!data) return null;
	return (
		<div>
			<h4 className="font-semibold text-md mb-2">{title}</h4>
			<div className="overflow-x-auto rounded-lg border">
				<table className="w-full table-auto">
					<thead className="bg-background">
						<tr className="text-left">
							<th className="py-2 px-4 font-medium">Field</th>
							<th className="py-2 px-4 font-medium">Value</th>
						</tr>
					</thead>
					<tbody>
						{Object.entries(data).map(([k, v]) => (
							<tr key={k} className="border-t">
								<td className="py-2 px-4 text-sm">{k}</td>
								<td className="py-2 px-4 text-sm">{v === null || v === undefined ? "—" : String(v)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

const InsightsList = ({ title, insights }: { title: string, insights: string[] | null }) => {
	if (!insights || insights.length === 0) return null;
	return (
		<div>
			<h4 className="font-semibold text-md mb-2">{title}</h4>
			<ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
				{insights.map((insight, idx) => (
					<li key={idx} className="bg-background p-3 rounded-md border">{insight}</li>
				))}
			</ul>
		</div>
	);
};


export default function CircularComparison({ ProjectIdentifier }: { ProjectIdentifier: string }) {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<ComparisonResult | null>(null);

	useEffect(() => {
		if (!ProjectIdentifier) {
			setError("No ProjectIdentifier provided.");
			setLoading(false);
			return;
		}

		const controller = new AbortController();
		const signal = controller.signal;

		const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				// Build absolute backend base (prefer NEXT_PUBLIC_BACKEND_URL)
				const envBase = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) : undefined;
				const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
				const backendBase = (envBase && envBase.trim()) ? envBase.replace(/\/$/, '') : runtimeOrigin.replace(/\/$/, '');
				const postUrl = `${backendBase}/api/comparison/projects/${ProjectIdentifier}`;
				const getUrl = postUrl; // same endpoint for GET

				// 1) Trigger calculation (POST)
				const postRes = await fetch(postUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					// optional body can be empty; kept for future extensibility
					body: JSON.stringify({}),
					signal
				});

				if (!postRes.ok) {
					// If server returns an error, try to parse message
					let errText = `POST failed with status ${postRes.status}`;
					try {
						const errJson = await postRes.json();
						if (errJson?.message) errText = errJson.message;
					} catch (_) {}
					throw new Error(errText);
				}

				// Try to use POST response if it already includes saved analysis
				let postJson: any = null;
				try {
					postJson = await postRes.json();
				} catch (_) {
					postJson = null;
				}

				if (postJson && Object.keys(postJson).length > 0 && (postJson.projectId || postJson._id)) {
					// If POST returned the analysis, use it
					setData(postJson);
					setLoading(false);
					return;
				}

				// 2) Fetch saved analysis via GET with a short retry loop
				let attempts = 0;
				let maxAttempts = 6;
				let got = false;
				let lastJson: any = null;

				while (attempts < maxAttempts && !got) {
					attempts++;
					const getRes = await fetch(getUrl, { signal });
					if (getRes.ok) {
						try {
							const json = await getRes.json();
							if (json && Object.keys(json).length > 0) {
								lastJson = json;
								got = true;
								break;
							}
						} catch (e) {
							// continue to retry
						}
					} else if (getRes.status === 404) {
						// not ready yet, wait and retry
						await wait(1000);
						continue;
					} else {
						// unexpected error - break and surface
						let msg = `GET failed with status ${getRes.status}`;
						try {
							const errJson = await getRes.json();
							if (errJson?.message) msg = errJson.message;
						} catch (_) {}
						throw new Error(msg);
					}
				}

				if (got && lastJson) {
					setData(lastJson);
				} else {
					// no data after retries
					setData(null);
				}
			} catch (err: any) {
				if (err.name === "AbortError") return;
				console.error("Failed to fetch comparison:", err);
				setError("Failed to load comparison results.");
				setData(null);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
		return () => controller.abort();
	}, [ProjectIdentifier]);

	if (loading) {
		return <div className="p-6 bg-card rounded-md text-center">Loading comparison results...</div>;
	}

	if (error) {
		return <div className="p-6 bg-destructive/10 rounded-md text-center text-destructive">Failed to load comparison results.</div>;
	}

	if (!data) {
		return <div className="p-6 bg-card rounded-md text-center">Loading comparison results...</div>;
	}

	// Warnings
	const warnings = data.warnings || [];

	// Determine mode by checking for a key unique to the linear analysis response
	const isLinear = !!data.totalOutputsStages1to5;

	return (
		<div className="space-y-6">
			{warnings.length > 0 && (
				<div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700">
					<div className="font-semibold mb-2">Warnings</div>
					<ul className="list-disc list-inside">
						{warnings.map((w: string, i: number) => (
							<li key={i}>{w}</li>
						))}
					</ul>
				</div>
			)}

			{isLinear ? (
				<div className="bg-card p-6 rounded-lg border space-y-6">
					<h3 className="text-xl font-bold text-center">Linear Process Implementing Circular Stage 6 - EndOfLife Stage </h3>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<SummaryCard title="Initial Impact (Stages 1-5)" data={data.totalOutputsStages1to5} />
						<SummaryCard title="Total Lifecycle Impact (with Prediction)" data={data.totalOutputsWithPrediction} />
					</div>

					<DataTable title="Predicted End-of-Life Inputs" data={data.predictedEndOfLifeInputs} />
					<DataTable title="Predicted End-of-Life Outputs" data={data.predictedEndOfLifeOutputs} />
					<InsightsList title="Improvement Insights" insights={data.improvementInsights} />
				</div>
			) : (
				// Circular mode UI
				<div className="bg-card p-6 rounded-lg border space-y-6">
					<h3 className="text-xl font-bold text-center">Circular Process Analysis</h3>
					<SummaryCard title="Total Lifecycle Impact" data={data.totalOutputs} />
					<InsightsList title="Optimization Insights" insights={data.optimizationInsights} />
				</div>
			)}
		</div>
	);
}
