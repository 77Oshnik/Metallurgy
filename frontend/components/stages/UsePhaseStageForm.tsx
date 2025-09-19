'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface UsePhaseStageFormProps {
  projectId: string;
  project: any;
  onComplete: (results: any) => void;
  apiEndpoint: string;
}

export default function UsePhaseStageForm({ projectId, project, onComplete, apiEndpoint }: UsePhaseStageFormProps) {
  const [inputs, setInputs] = useState({
    ProductLifetimeYears: '',
    OperationalEnergyKilowattHoursPerYearPerFunctionalUnit: '',
    FailureRatePercent: '',
    MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: '',
    MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit: '',
    ReusePotentialPercent: ''
  });

  const [loading, setLoading] = useState(false);

  const mandatoryFields = ['ProductLifetimeYears', 'OperationalEnergyKilowattHoursPerYearPerFunctionalUnit', 'FailureRatePercent'];
  const optionalFields = ['MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit', 'MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit', 'ReusePotentialPercent'];

  const fieldLabels: Record<string, string> = {
    ProductLifetimeYears: 'Product Lifetime (years)',
    OperationalEnergyKilowattHoursPerYearPerFunctionalUnit: 'Operational Energy (kWh/year/FU)',
    FailureRatePercent: 'Failure Rate (%)',
    MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: 'Maintenance Energy (kWh/year/FU)',
    MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit: 'Maintenance Materials (kg/year/FU)',
    ReusePotentialPercent: 'Reuse Potential (%)'
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

      if (!response.ok) throw new Error('Failed to process use phase stage');

      const result = await response.json();
      onComplete(result);
      toast({ title: "Use Phase Stage Completed", description: "Successfully processed" });

    } catch (error) {
      toast({ title: "Error", description: "Failed to process use phase stage", variant: "destructive" });
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
        Process Use Phase Stage
      </Button>
    </form>
  );
}