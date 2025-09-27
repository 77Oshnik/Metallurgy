'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  const fieldDescriptions: Record<string, string> = {
    ProductLifetimeYears: 'Expected operational lifetime of the product before replacement',
    OperationalEnergyKilowattHoursPerYearPerFunctionalUnit: 'Energy consumed during normal operation per functional unit per year',
    FailureRatePercent: 'Percentage of products expected to fail during their lifetime',
    MaintenanceEnergyKilowattHoursPerYearPerFunctionalUnit: 'Energy required for maintenance activities per functional unit per year',
    MaintenanceMaterialsKilogramsPerYearPerFunctionalUnit: 'Materials consumed for maintenance and repairs per functional unit per year',
    ReusePotentialPercent: 'Percentage of the product that can be reused at end of life'
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
        <CardHeader>
          <CardTitle>Mandatory Fields</CardTitle>
          <CardDescription>These fields are required for use phase stage calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mandatoryFields.map(field => (
            <div key={field} className="space-y-2">
              <Label>{fieldLabels[field]} <Badge variant="destructive" className="text-xs ml-2">Required</Badge></Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                max={field.includes('Percent') ? "100" : undefined}
                placeholder={`Enter ${fieldLabels[field].toLowerCase()}`}
                value={inputs[field as keyof typeof inputs]}
                onChange={(e) => setInputs(prev => ({ ...prev, [field]: e.target.value }))}
                required
              />
              <p className="text-sm text-gray-500">{fieldDescriptions[field]}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optional Fields</CardTitle>
          <CardDescription>These fields can be left empty if not applicable</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optionalFields.map(field => (
            <div key={field} className="space-y-2">
              <Label>{fieldLabels[field]} <Badge variant="secondary" className="text-xs ml-2">Optional</Badge></Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                max={field.includes('Percent') ? "100" : undefined}
                placeholder={`Enter ${fieldLabels[field].toLowerCase()} (optional)`}
                value={inputs[field as keyof typeof inputs]}
                onChange={(e) => setInputs(prev => ({ ...prev, [field]: e.target.value }))}
              />
              <p className="text-sm text-gray-500">{fieldDescriptions[field]}</p>
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