'use client';
import React, { useState, useEffect } from 'react';
import Field from './Field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STAGES = [
  'Mining',
  'Concentration',
  'Smelting',
  'Fabrication',
  'Use Phase',
  'End-of-Life'
];

// Full set of fields per stage (mandatory + optional) as requested.
const STAGE_FIELDS: Record<string, string[]> = {
  Mining: [
    'OreGradePercent',
    'DieselUseLitersPerTonneOre',
    'ElectricityUseKilowattHoursPerTonneOre',
    'ReagentsKilogramsPerTonneOre',
    'WaterWithdrawalCubicMetersPerTonneOre',
    'TransportDistanceKilometersToConcentrator'
  ],
  Concentration: [
    'RecoveryYieldPercent',
    'GrindingEnergyKilowattHoursPerTonneConcentrate',
    'TailingsVolumeTonnesPerTonneConcentrate',
    'ConcentrationReagentsKilogramsPerTonneConcentrate',
    'ConcentrationWaterCubicMetersPerTonneConcentrate',
    'WaterRecycleRatePercent'
  ],
  Smelting: [
    'SmeltEnergyKilowattHoursPerTonneMetal',
    'SmeltRecoveryPercent',
    'CokeUseKilogramsPerTonneMetal',
    'FuelSharePercent',
    'FluxesKilogramsPerTonneMetal',
    'EmissionControlEfficiencyPercent'
  ],
  Fabrication: [
    'FabricationEnergyKilowattHoursPerTonneProduct',
    'ScrapInputPercent',
    'YieldLossPercent',
    'FabricationElectricityRenewableSharePercent',
    'AncillaryMaterialsKilogramsPerTonneProduct',
    'FabricationWaterCubicMetersPerTonneProduct'
  ],
  'Use Phase': [
    'ProductLifetimeYears',
    'OperationalEnergyKilowattHoursPerYearPerFunctionalUnit',
    'FailureRatePercent',
    'MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit',
    'MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit',
    'ReusePotentialPercent'
  ],
  'End-of-Life': [
    'CollectionRatePercent',
    'RecyclingEfficiencyPercent',
    'RecyclingEnergyKilowattHoursPerTonneRecycled',
    'TransportDistanceKilometersToRecycler',
    'DowncyclingFractionPercent',
    'LandfillSharePercent'
  ]
};

type Result = any;

export default function WhatIfForm({ projectId }: { projectId: string }) {
  const [scenarioName, setScenarioName] = useState('');
  const [stage, setStage] = useState(STAGES[0]);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  // initialize inputs when stage changes
  useEffect(() => {
    const keys = STAGE_FIELDS[stage] || [];
    const obj: Record<string, any> = {};
    keys.forEach(k => {
      obj[k] = inputs[k] !== undefined ? inputs[k] : '';
    });
    setInputs(obj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function handleChange(name: string, value: any) {
    setInputs(prev => ({ ...prev, [name]: value }));
  }

  async function fetchScenarioDetail(scenarioId: string) {
    try {
      const BACKEND_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const resp = await fetch(`${BACKEND_BASE}/api/whatif/${encodeURIComponent(projectId)}/${encodeURIComponent(scenarioId)}`);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setError(err && err.error ? err.error : `Failed to fetch scenario ${scenarioId}`);
        return null;
      }
      const json = await resp.json();
      return json;
    } catch (err: any) {
      setError(err.message || 'Network error while fetching scenario detail');
      return null;
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    if (!scenarioName) {
      setError('Provide a scenario name');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const expectedFields = Object.keys(inputs);
      const body = { scenarioName, inputs, expectedFields, cloneBaseline: false };
      const BACKEND_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const resp = await fetch(`${BACKEND_BASE}/api/whatif/${encodeURIComponent(projectId)}/${encodeURIComponent(stage)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await resp.json();
      if (!resp.ok) {
        setError(json && json.error ? json.error : 'Server error');
      } else {
        // if backend returned scenarioId, fetch authoritative saved record
        if (json && json.scenarioId) {
          const saved = await fetchScenarioDetail(json.scenarioId);
          if (saved) {
            setResult(saved);
          } else {
            // fallback to returned response if fetch failed
            setResult(json);
          }
        } else {
          setResult(json);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    // Outer container styled to match the Projects page theme (soft bluish/purple gradients)
    <div className="relative rounded-xl p-6 overflow-hidden bg-gradient-to-r from-slate-800/30 via-indigo-700/20 to-slate-700/20">
      {/* Ambient blob left/top — bluish, soft and blurred (Projects-like) */}
      <div className="absolute -left-32 -top-24 w-72 h-72 bg-gradient-to-tr from-blue-400/12 to-purple-500/8 rounded-full blur-3xl opacity-55 pointer-events-none" />
      {/* Ambient blob right/bottom — warm purple accent */}
      <div className="absolute -right-36 -bottom-20 w-72 h-72 bg-gradient-to-tr from-pink-400/10 to-indigo-600/10 rounded-full blur-2xl opacity-40 pointer-events-none" />

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-2">
            <label htmlFor="scenarioName" className="text-sm font-medium text-black/90 mb-2 block">Scenario Name</label>
            <input
              id="scenarioName"
              value={scenarioName}
              onChange={e => setScenarioName(e.target.value)}
              placeholder="e.g., Increase Recycled Content to 60%"
              className="w-full rounded-md border border-slate-600 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 bg-slate-900/70 text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm"
            />
          </div>

          <div>
            <label htmlFor="stage" className="text-sm font-medium text-black/90 mb-2 block">Metallurgy Stage</label>
            <select
              id="stage"
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="w-full rounded-md border border-slate-600 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 bg-slate-900/70 text-white transition-all duration-300 backdrop-blur-sm"
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Inputs Card with metallic gradient and inner shadows */}
        <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/60 text-white border border-slate-700 shadow-lg shadow-black/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Inputs for {stage}</CardTitle>
            <CardDescription className="text-white/70">Provide values to simulate. The AI will intelligently predict any missing data.</CardDescription>
          </CardHeader>
          <CardContent>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {(STAGE_FIELDS[stage] || []).map(key => (
    <div key={key} className="p-4 rounded-lg text-white bg-slate-900/70 border border-slate-700 shadow-inner shadow-black/40 transition-all duration-300">
      <Field name={key} label={key.replace(/([A-Z])/g, ' $1')} value={inputs[key] ?? ''} type="number" onChange={handleChange} />
    </div>
  ))}
</div>
</CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-md transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 disabled:bg-slate-600 disabled:saturate-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? 'Running Simulation...' : 'Run Scenario'}
          </Button>

          <Button
            variant="ghost"
            type="button"
            onClick={() => { setInputs(Object.fromEntries(Object.keys(inputs).map(k => [k, '']))); setResult(null); }}
            className="border border-slate-600 text-red-600 px-6 py-2 rounded-md bg-transparent hover:bg-slate-800 transition-colors duration-300"
          >
            Reset
          </Button>

          <div className="ml-auto text-sm">
            <span className="font-medium text-blue-800/80">Project ID:</span> <span className="text-black/90 font-mono">{projectId}</span>
          </div>
        </div>

        {error && <div className="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-md p-3">{error}</div>}

        {result && (
          <div className="space-y-6 pt-4">
            <Card className="bg-gradient-to-tl from-slate-900/70 to-slate-800/60 border border-slate-700 shadow-xl shadow-black/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Simulation Result</CardTitle>
                <CardDescription className="text-white/70">Scenario: "{result.scenarioName}"</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Inputs Panel */}
                  <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700 shadow-inner shadow-black/40 text-white">
                    <h3 className="text-lg font-semibold mb-4 text-white">Final Inputs</h3>
                    <div className="space-y-4 text-sm">
                      {result.inputs && (() => {
                        // Only show inputs that have a non-empty value (avoid printing many empty fields)
                        const entries = Object.entries(result.inputs)
                          .filter(([k, v]) => v !== undefined && v !== null && String(v).trim() !== '')
                          .map(([k, v]) => {
                            const prov = result.inputProvenance?.[k] || 'ai-predicted';
                            const conf = Number(result.inputConfidenceScores?.[k] ?? (prov === 'user' ? 100 : 60));
                            return { key: k, value: v, prov, conf };
                          });

                        if (!entries.length) {
                          return <div className="text-slate-300">No inputs provided or predicted for this stage.</div>;
                        }

                        return entries.map(({ key, value, prov, conf }) => (
                          <div key={key} className="flex flex-col">
                            <div className="flex items-baseline justify-between">
                              <div className="font-medium text-white/90">{key.replace(/([A-Z])/g, ' $1')}</div>
                              <div className="text-base font-mono text-cyan-300">
                                {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 3 }) : String(value)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <div>
                                <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${prov === 'user' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'}`}>
                                  {prov === 'user' ? 'User' : 'AI'}
                                </span>
                              </div>
                              <div className="flex items-center w-1/2">
                                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                    style={{ width: `${Math.max(0, Math.min(100, conf))}%` }}
                                    title={`${conf}% confidence`}
                                  />
                                </div>
                                <div className="ml-2 text-xs text-slate-300 w-10 text-right">{Math.round(conf)}%</div>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
 
                   {/* Key Outputs Panel */}
                  <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-700 shadow-inner shadow-black/40 text-white">
                    <h3 className="text-lg font-semibold mb-4 text-white">Key Outputs</h3>
                    <div className="space-y-3 text-sm">
                      {(() => {
                        const outputs = result.outputs?.Outputs || result.outputs || {};
                        // collect only simple numeric outputs (skip nested objects/arrays)
                        const numericEntries = Object.entries(outputs)
                          .filter(([_, v]) => typeof v === 'number' || (!isNaN(Number(v)) && v !== null && v !== ''))
                          .map(([k, v]) => ({ key: k, value: Number(v) }));

                        // sort by absolute magnitude (largest first) to show the most impactful metrics
                        numericEntries.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

                        const MAX_SHOW = 10;
                        const shown = numericEntries.slice(0, MAX_SHOW);
                        const hiddenCount = Math.max(0, numericEntries.length - shown.length);

                        if (!numericEntries.length) {
                          // fallback: show a small summary of top-level non-object keys
                          const simple = Object.entries(outputs).filter(([_, v]) => typeof v !== 'object');
                          if (!simple.length) return <div className="text-sm text-slate-300">No simple numeric outputs available.</div>;
                          return simple.slice(0, MAX_SHOW).map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center p-2 rounded-md">
                              <span className="text-slate-300">{k.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="font-mono text-base text-green-300">{String(v)}</span>
                            </div>
                          ));
                        }

                        return (
                          <>
                            {shown.map(({ key, value }) => (
                              <div key={key} className="flex justify-between items-center p-2 rounded-md">
                                <span className="text-slate-300">{key.replace(/([A-Z])/g, ' $1').replace('Per Functional Unit', '')}</span>
                                <span className="font-mono text-base text-green-300">{Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 6 }) : String(value)}</span>
                              </div>
                            ))}
                            {hiddenCount > 0 && (
                              <div className="text-xs text-slate-400 mt-2">+ {hiddenCount} more numeric outputs hidden</div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Warnings Section */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mt-6">
                    <div className="text-base font-semibold text-amber-400">Warnings</div>
                    <ul className="list-disc list-inside text-sm text-amber-300 mt-2 space-y-1">
                      {result.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </form>
    </div>
  );
}