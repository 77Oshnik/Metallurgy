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

export default function WhatIfForm({ projectId, onScenarioCreated }: { projectId: string; onScenarioCreated?: () => void }) {
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
            // Call the callback to refresh previous scenarios
            if (onScenarioCreated) {
              onScenarioCreated();
            }
          } else {
            // fallback to returned response if fetch failed
            setResult(json);
            if (onScenarioCreated) {
              onScenarioCreated();
            }
          }
        } else {
          setResult(json);
          if (onScenarioCreated) {
            onScenarioCreated();
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative rounded-2xl p-8 overflow-hidden  border border-green-200/50 shadow-xl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-200/20 to-transparent rounded-full blur-3xl -translate-x-48 -translate-y-48 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-green-200/15 to-transparent rounded-full blur-2xl translate-x-40 translate-y-40 animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-green-200/10 to-transparent rounded-full blur-2xl -translate-x-36 -translate-y-36 animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {/* Configuration Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="scenarioName" className="text-sm font-semibold text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Scenario Name
            </label>
            <input
              id="scenarioName"
              value={scenarioName}
              onChange={e => setScenarioName(e.target.value)}
              placeholder="e.g., Increase Recycled Content to 60%"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-400 transition-all duration-300 placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="stage" className="text-sm font-semibold text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Metallurgy Stage
            </label>
            <select
              id="stage"
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-400 transition-all duration-300"
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Inputs Section */}
        <Card className="bg-white/60 backdrop-blur-md border border-white/20 shadow-xl shadow-gray-200/50">
          <CardHeader className="pb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Parameters for {stage}</CardTitle>
                <CardDescription className="text-gray-600 mt-1">Enter values to simulate. AI will predict missing parameters intelligently.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(STAGE_FIELDS[stage] || []).map(key => (
                <div key={key} className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 shadow-inner transition-all duration-300 hover:shadow-md hover:border-gray-300/50">
                  <Field 
                    name={key} 
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                    value={inputs[key] ?? ''} 
                    type="number" 
                    onChange={handleChange} 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running Simulation...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Run Scenario
              </>
            )}
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={() => { setInputs(Object.fromEntries(Object.keys(inputs).map(k => [k, '']))); setResult(null); }}
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </Button>

          <div className="ml-auto text-sm bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
            <span className="font-semibold text-gray-700">Project:</span> 
            <span className="text-green-600 font-mono ml-2">{projectId}</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Simulation Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6 pt-4">
            <Card className="bg-gradient-to-tl from-slate-50 to-gray-100 border border-green-300 shadow-xl shadow-green-200/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Simulation Result</CardTitle>
                <CardDescription className="text-gray-600">Scenario: "{result.scenarioName}"</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Inputs Panel */}
                  <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Final Inputs</h3>
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
                          return <div className="text-gray-500">No inputs provided or predicted for this stage.</div>;
                        }

                        return entries.map(({ key, value, prov, conf }) => (
                          <div key={key} className="bg-green-50/50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-baseline justify-between mb-3">
                              <div className="font-semibold text-gray-800">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </div>
                              <div className="text-lg font-mono text-green-600 font-bold">
                                {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 3 }) : String(value)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                                  prov === 'user' 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {prov === 'user' ? (
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                  )}
                                  {prov === 'user' ? 'User Input' : 'AI Predicted'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-20 bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      conf >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                      conf >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                                      'bg-gradient-to-r from-red-400 to-red-500'
                                    }`}
                                    style={{ width: `${Math.max(0, Math.min(100, conf))}%` }}
                                  />
                                </div>
                                <div className="text-xs font-semibold text-gray-700 w-12 text-right">
                                  {Math.round(conf)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
 
                  {/* Enhanced Key Outputs Panel */}
                  <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Key Results</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {(() => {
                        const outputs = result.outputs?.Outputs || result.outputs || {};
                        const numericEntries = Object.entries(outputs)
                          .filter(([_, v]) => typeof v === 'number' || (!isNaN(Number(v)) && v !== null && v !== ''))
                          .map(([k, v]) => ({ key: k, value: Number(v) }));

                        numericEntries.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
                        const MAX_SHOW = 10;
                        const shown = numericEntries.slice(0, MAX_SHOW);
                        const hiddenCount = Math.max(0, numericEntries.length - shown.length);

                        if (!numericEntries.length) {
                          const simple = Object.entries(outputs).filter(([_, v]) => typeof v !== 'object');
                          if (!simple.length) return (
                            <div className="text-center py-8 text-gray-600">
                              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              No numeric outputs available.
                            </div>
                          );
                          return simple.slice(0, MAX_SHOW).map(([k, v]) => (
                            <div key={k} className="bg-green-50/30 rounded-xl p-4 flex justify-between items-center border border-green-200">
                              <span className="font-medium text-gray-800">{k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                              <span className="font-mono text-base font-bold text-green-600">{String(v)}</span>
                            </div>
                          ));
                        }

                        return (
                          <>
                            {shown.map(({ key, value }) => (
                              <div key={key} className="bg-green-50/30 rounded-xl p-4 flex justify-between items-center border border-green-200 transition-all duration-200 hover:bg-green-50/50">
                                <span className="font-medium text-gray-800">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('Per Functional Unit', '')}
                                </span>
                                <span className="font-mono text-base font-bold text-green-600">
                                  {Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 6 }) : String(value)}
                                </span>
                              </div>
                            ))}
                            {hiddenCount > 0 && (
                              <div className="text-center py-2">
                                <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                  + {hiddenCount} more results hidden
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Enhanced Warnings Section */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-bold text-yellow-800 mb-3 text-lg">Important Warnings</h4>
                        <ul className="space-y-2">
                          {result.warnings.map((w: string, i: number) => (
                            <li key={i} className="flex items-start">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                              <span className="text-yellow-800 font-medium">{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
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