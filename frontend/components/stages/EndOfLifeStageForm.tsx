'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface EndOfLifeStageFormProps {
  projectId: string;
  project: any;
  onComplete: (results: any) => void;
  apiEndpoint: string;
}

export default function EndOfLifeStageForm({ projectId, project, onComplete, apiEndpoint }: EndOfLifeStageFormProps) {
  const [inputs, setInputs] = useState({
    CollectionRatePercent: '',
    RecyclingEfficiencyPercent: '',
    RecyclingEnergyKilowattHoursPerTonneRecycled: '',
    TransportDistanceKilometersToRecycler: '',
    DowncyclingFractionPercent: '',
    LandfillSharePercent: ''
  });

  const [loading, setLoading] = useState(false);

  const mandatoryFields = ['CollectionRatePercent', 'RecyclingEfficiencyPercent', 'RecyclingEnergyKilowattHoursPerTonneRecycled'];
  const optionalFields = ['TransportDistanceKilometersToRecycler', 'DowncyclingFractionPercent', 'LandfillSharePercent'];

  const fieldLabels: Record<string, string> = {
    CollectionRatePercent: 'Collection Rate (%)',
    RecyclingEfficiencyPercent: 'Recycling Efficiency (%)',
    RecyclingEnergyKilowattHoursPerTonneRecycled: 'Recycling Energy (kWh/tonne recycled)',
    TransportDistanceKilometersToRecycler: 'Transport Distance to Recycler (km)',
    DowncyclingFractionPercent: 'Downcycling Fraction (%)',
    LandfillSharePercent: 'Landfill Share (%)'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {};
      Object.entries(inputs).forEach(([key, value]) => {
        if (value !== '') {
          submitData[key] = parseFloat(value);
        }
      });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error('Failed to process end-of-life stage');

      const result = await response.json();
      onComplete(result);
      toast({ title: "End-of-Life Stage Completed", description: "Successfully processed" });

    } catch (error) {
      toast({ title: "Error", description: "Failed to process end-of-life stage", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Mandatory Fields</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {mandatoryFields.map(field => (
            <div key={field} className="space-y-2">
              <Label>{fieldLabels[field]} <Badge variant="destructive" className="text-xs ml-2">Required</Badge></Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                max={field.includes('Percent') ? "100" : undefined}
                value={inputs[field as keyof typeof inputs]}
                onChange={(e) => setInputs(prev => ({ ...prev, [field]: e.target.value }))}
                required
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Optional Fields</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {optionalFields.map(field => (
            <div key={field} className="space-y-2">
              <Label>{fieldLabels[field]} <Badge variant="secondary" className="text-xs ml-2">Optional</Badge></Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                max={field.includes('Percent') ? "100" : undefined}
                value={inputs[field as keyof typeof inputs]}
                onChange={(e) => setInputs(prev => ({ ...prev, [field]: e.target.value }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Process End-of-Life Stage
      </Button>
    </form>
  );
}