'use client';
import React, { useState, useEffect } from 'react';
import Field from './Field';

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
    // Mandatory
    'OreGradePercent',
    'DieselUseLitersPerTonneOre',
    'ElectricityUseKilowattHoursPerTonneOre',
    // Optional
    'ReagentsKilogramsPerTonneOre',
    'WaterWithdrawalCubicMetersPerTonneOre',
    'TransportDistanceKilometersToConcentrator'
  ],
  Concentration: [
    // Mandatory
    'RecoveryYieldPercent',
    'GrindingEnergyKilowattHoursPerTonneConcentrate',
    'TailingsVolumeTonnesPerTonneConcentrate',
    // Optional
    'ConcentrationReagentsKilogramsPerTonneConcentrate',
    'ConcentrationWaterCubicMetersPerTonneConcentrate',
    'WaterRecycleRatePercent'
  ],
  Smelting: [
    // Mandatory
    'SmeltEnergyKilowattHoursPerTonneMetal',
    'SmeltRecoveryPercent',
    'CokeUseKilogramsPerTonneMetal',
    // Optional
    'FuelSharePercent',
    'FluxesKilogramsPerTonneMetal',
    'EmissionControlEfficiencyPercent'
  ],
  Fabrication: [
    // Mandatory
    'FabricationEnergyKilowattHoursPerTonneProduct',
    'ScrapInputPercent',
    'YieldLossPercent',
    // Optional
    'FabricationElectricityRenewableSharePercent',
    'AncillaryMaterialsKilogramsPerTonneProduct',
    'FabricationWaterCubicMetersPerTonneProduct'
  ],
  'Use Phase': [
    // Mandatory
    'ProductLifetimeYears',
    'OperationalEnergyKilowattHoursPerYearPerFunctionalUnit',
    'FailureRatePercent',
    // Optional
    'MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit',
    'MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit',
    'ReusePotentialPercent'
  ],
  'End-of-Life': [
    // Mandatory
    'CollectionRatePercent',
    'RecyclingEfficiencyPercent',
    'RecyclingEnergyKilowattHoursPerTonneRecycled',
    // Optional
    'TransportDistanceKilometersToRecycler',
    'DowncyclingFractionPercent',
    'LandfillSharePercent'
  ]
};

type Result = any;

// Add this near the top (after imports) to pick backend base URL from env or default to localhost:5000
const BACKEND_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

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
    <form onSubmit={handleSubmit} style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h2>What‑If Simulation</h2>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Scenario name</label>
        <input value={scenarioName} onChange={e => setScenarioName(e.target.value)} style={{ padding: 8, width: '100%' }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Stage</label>
        <select value={stage} onChange={e => setStage(e.target.value)} style={{ padding: 8, width: '100%' }}>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <fieldset style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
        <legend style={{ fontWeight: 600 }}>Inputs for {stage}</legend>
        {(STAGE_FIELDS[stage] || []).map(key => (
          <Field key={key} name={key} label={key} value={inputs[key] ?? ''} type="number" onChange={handleChange} />
        ))}
      </fieldset>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>{loading ? 'Running...' : 'Run Scenario'}</button>
        <button type="button" onClick={() => { setInputs(Object.fromEntries(Object.keys(inputs).map(k => [k, '']))); setResult(null); }} style={{ padding: '8px 16px' }}>
          Reset Inputs
        </button>
      </div>

      {error && <div style={{ marginTop: 12, color: 'crimson' }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 16, background: '#f9f9f9', padding: 12 }}>
          <h3>Result: {result.scenarioName}</h3>
          <div style={{ marginBottom: 8 }}>
            <strong>Inputs (with provenance & confidence):</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify({ inputs: result.inputs, provenance: result.inputProvenance, confidences: result.inputConfidenceScores }, null, 2)}</pre>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Stage Outputs:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.outputs, null, 2)}</pre>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Aggregate KPIs:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.aggregateKPIs, null, 2)}</pre>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Hotspot Ranking:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.hotspotRanking, null, 2)}</pre>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Probability Distributions:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.probabilityDistributions, null, 2)}</pre>
          </div>
          {result.warnings && result.warnings.length > 0 && (
            <div style={{ color: '#b35b00' }}>
              <strong>Warnings:</strong>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.warnings, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
