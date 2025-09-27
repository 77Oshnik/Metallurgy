'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ConcentrationStageFormProps {
  projectId: string;
  project: any;
  onComplete: (results: any) => void;
  apiEndpoint: string;
}

interface ConcentrationInputs {
  RecoveryYieldPercent: number | '';
  GrindingEnergyKilowattHoursPerTonneConcentrate: number | '';
  TailingsVolumeTonnesPerTonneConcentrate: number | '';
  ConcentrationReagentsKilogramsPerTonneConcentrate: number | '';
  ConcentrationWaterCubicMetersPerTonneConcentrate: number | '';
  WaterRecycleRatePercent: number | '';
}

export default function ConcentrationStageForm({ projectId, project, onComplete, apiEndpoint }: ConcentrationStageFormProps) {
  const [inputs, setInputs] = useState<ConcentrationInputs>({
    RecoveryYieldPercent: '',
    GrindingEnergyKilowattHoursPerTonneConcentrate: '',
    TailingsVolumeTonnesPerTonneConcentrate: '',
    ConcentrationReagentsKilogramsPerTonneConcentrate: '',
    ConcentrationWaterCubicMetersPerTonneConcentrate: '',
    WaterRecycleRatePercent: ''
  });

  const [loading, setLoading] = useState(false);

  const mandatoryFields = [
    'RecoveryYieldPercent',
    'GrindingEnergyKilowattHoursPerTonneConcentrate',
    'TailingsVolumeTonnesPerTonneConcentrate'
  ];

  const optionalFields = [
    'ConcentrationReagentsKilogramsPerTonneConcentrate',
    'ConcentrationWaterCubicMetersPerTonneConcentrate',
    'WaterRecycleRatePercent'
  ];

  const fieldLabels: Record<string, string> = {
    RecoveryYieldPercent: 'Recovery Yield (%)',
    GrindingEnergyKilowattHoursPerTonneConcentrate: 'Grinding Energy (kWh/tonne concentrate)',
    TailingsVolumeTonnesPerTonneConcentrate: 'Tailings Volume (tonnes/tonne concentrate)',
    ConcentrationReagentsKilogramsPerTonneConcentrate: 'Concentration Reagents (kg/tonne concentrate)',
    ConcentrationWaterCubicMetersPerTonneConcentrate: 'Process Water (m³/tonne concentrate)',
    WaterRecycleRatePercent: 'Water Recycle Rate (%)'
  };

  const fieldDescriptions: Record<string, string> = {
    RecoveryYieldPercent: 'Percentage of valuable metal recovered from ore during concentration',
    GrindingEnergyKilowattHoursPerTonneConcentrate: 'Energy required for grinding ore to produce concentrate',
    TailingsVolumeTonnesPerTonneConcentrate: 'Volume of waste tailings generated per tonne of concentrate',
    ConcentrationReagentsKilogramsPerTonneConcentrate: 'Chemical reagents used in flotation and concentration processes',
    ConcentrationWaterCubicMetersPerTonneConcentrate: 'Water consumption for concentration processes per tonne of concentrate',
    WaterRecycleRatePercent: 'Percentage of process water that is recycled and reused'
  };

  const handleInputChange = (field: keyof ConcentrationInputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: value === '' ? '' : parseFloat(value) || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: string[] = [];
    mandatoryFields.forEach(field => {
      if (inputs[field as keyof ConcentrationInputs] === '' || inputs[field as keyof ConcentrationInputs] === 0) {
        errors.push(`${fieldLabels[field]} is required`);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const submitData: any = {};
      Object.entries(inputs).forEach(([key, value]) => {
        if (value !== '') {
          submitData[key] = value;
        }
      });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process concentration stage');
      }

      const result = await response.json();
      onComplete(result);

      toast({
        title: "Concentration Stage Completed",
        description: `Successfully processed with ${result.predictionSummary?.aiPredictedFields || 0} AI-predicted fields`,
      });

    } catch (error) {
      console.error('Error submitting concentration stage:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process concentration stage",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmptyOptionalFields = () => {
    return optionalFields.filter(field => inputs[field as keyof ConcentrationInputs] === '');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {getEmptyOptionalFields().length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
              AI Prediction Enabled
            </CardTitle>
            <CardDescription>
              Missing optional fields will be predicted using AI. 
              Empty fields: {getEmptyOptionalFields().map(field => fieldLabels[field]).join(', ')}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mandatory Fields</CardTitle>
          <CardDescription>These fields are required for concentration stage calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mandatoryFields.map(field => (
            <div key={field} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor={field}>{fieldLabels[field]}</Label>
                <Badge variant="destructive" className="text-xs">Required</Badge>
              </div>
              <Input
                id={field}
                type="number"
                step="0.001"
                min="0"
                placeholder={`Enter ${fieldLabels[field].toLowerCase()}`}
                value={inputs[field as keyof ConcentrationInputs]}
                onChange={(e) => handleInputChange(field as keyof ConcentrationInputs, e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">{fieldDescriptions[field]}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Optional Fields</CardTitle>
          <CardDescription>These fields can be left empty and will be predicted by AI if enabled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optionalFields.map(field => (
            <div key={field} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor={field}>{fieldLabels[field]}</Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
              </div>
              <Input
                id={field}
                type="number"
                step="0.001"
                min="0"
                max={field.includes('Percent') ? "100" : undefined}
                placeholder={`Enter ${fieldLabels[field].toLowerCase()} (optional)`}
                value={inputs[field as keyof ConcentrationInputs]}
                onChange={(e) => handleInputChange(field as keyof ConcentrationInputs, e.target.value)}
              />
              <p className="text-sm text-gray-500">{fieldDescriptions[field]}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Process Concentration Stage
        </Button>
      </div>
    </form>
  );
}