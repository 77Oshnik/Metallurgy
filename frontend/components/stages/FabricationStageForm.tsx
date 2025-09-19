'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FabricationStageFormProps {
  projectId: string;
  project: any;
  onComplete: (results: any) => void;
  apiEndpoint: string;
}

export default function FabricationStageForm({ projectId, project, onComplete, apiEndpoint }: FabricationStageFormProps) {
  const [inputs, setInputs] = useState({
    FabricationEnergyKilowattHoursPerTonneProduct: '',
    ScrapInputPercent: '',
    YieldLossPercent: '',
    FabricationElectricityRenewableSharePercent: '',
    AncillaryMaterialsKilogramsPerTonneProduct: '',
    FabricationWaterCubicMetersPerTonneProduct: ''
  });

  const [loading, setLoading] = useState(false);

  const mandatoryFields = ['FabricationEnergyKilowattHoursPerTonneProduct', 'ScrapInputPercent', 'YieldLossPercent'];
  const optionalFields = ['FabricationElectricityRenewableSharePercent', 'AncillaryMaterialsKilogramsPerTonneProduct', 'FabricationWaterCubicMetersPerTonneProduct'];

  const fieldLabels: Record<string, string> = {
    FabricationEnergyKilowattHoursPerTonneProduct: 'Fabrication Energy (kWh/tonne product)',
    ScrapInputPercent: 'Scrap Input (%)',
    YieldLossPercent: 'Yield Loss (%)',
    FabricationElectricityRenewableSharePercent: 'Renewable Energy Share (%)',
    AncillaryMaterialsKilogramsPerTonneProduct: 'Ancillary Materials (kg/tonne product)',
    FabricationWaterCubicMetersPerTonneProduct: 'Water Use (m³/tonne product)'
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

      if (!response.ok) throw new Error('Failed to process fabrication stage');

      const result = await response.json();
      onComplete(result);
      toast({ title: "Fabrication Stage Completed", description: "Successfully processed" });

    } catch (error) {
      toast({ title: "Error", description: "Failed to process fabrication stage", variant: "destructive" });
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
        Process Fabrication Stage
      </Button>
    </form>
  );
}