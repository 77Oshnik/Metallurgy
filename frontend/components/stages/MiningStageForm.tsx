'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface MiningStageFormProps {
  projectId: string;
  project: any;
  onComplete: (results: any) => void;
  apiEndpoint: string;
}

interface MiningInputs {
  OreGradePercent: number | '';
  DieselUseLitersPerTonneOre: number | '';
  ElectricityUseKilowattHoursPerTonneOre: number | '';
  ReagentsKilogramsPerTonneOre: number | '';
  WaterWithdrawalCubicMetersPerTonneOre: number | '';
  TransportDistanceKilometersToConcentrator: number | '';
}

export default function MiningStageForm({ projectId, project, onComplete, apiEndpoint }: MiningStageFormProps) {
  const [inputs, setInputs] = useState<MiningInputs>({
    OreGradePercent: '',
    DieselUseLitersPerTonneOre: '',
    ElectricityUseKilowattHoursPerTonneOre: '',
    ReagentsKilogramsPerTonneOre: '',
    WaterWithdrawalCubicMetersPerTonneOre: '',
    TransportDistanceKilometersToConcentrator: ''
  });

  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);

  const mandatoryFields = [
    'OreGradePercent',
    'DieselUseLitersPerTonneOre',
    'ElectricityUseKilowattHoursPerTonneOre'
  ];

  const optionalFields = [
    'ReagentsKilogramsPerTonneOre',
    'WaterWithdrawalCubicMetersPerTonneOre',
    'TransportDistanceKilometersToConcentrator'
  ];

  const fieldLabels: Record<string, string> = {
    OreGradePercent: 'Ore Grade (%)',
    DieselUseLitersPerTonneOre: 'Diesel Use (L/tonne ore)',
    ElectricityUseKilowattHoursPerTonneOre: 'Electricity Use (kWh/tonne ore)',
    ReagentsKilogramsPerTonneOre: 'Reagents (kg/tonne ore)',
    WaterWithdrawalCubicMetersPerTonneOre: 'Water Withdrawal (m³/tonne ore)',
    TransportDistanceKilometersToConcentrator: 'Transport Distance (km)'
  };

  const fieldDescriptions: Record<string, string> = {
    OreGradePercent: 'Percentage of metal content in the ore',
    DieselUseLitersPerTonneOre: 'Diesel fuel consumption per tonne of ore processed',
    ElectricityUseKilowattHoursPerTonneOre: 'Electrical energy consumption per tonne of ore',
    ReagentsKilogramsPerTonneOre: 'Chemical reagents used in processing per tonne of ore',
    WaterWithdrawalCubicMetersPerTonneOre: 'Water consumption per tonne of ore processed',
    TransportDistanceKilometersToConcentrator: 'Distance to transport ore to concentration facility'
  };

  const handleInputChange = (field: keyof MiningInputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: value === '' ? '' : parseFloat(value) || ''
    }));
  };

  const validateInputs = () => {
    const errors: string[] = [];
    
    mandatoryFields.forEach(field => {
      if (inputs[field as keyof MiningInputs] === '' || inputs[field as keyof MiningInputs] === 0) {
        errors.push(`${fieldLabels[field]} is required`);
      }
    });

    if (inputs.OreGradePercent !== '' && (inputs.OreGradePercent as number) > 100) {
      errors.push('Ore Grade cannot exceed 100%');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateInputs();
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
      // Prepare data - only include non-empty values
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
        throw new Error(errorData.message || 'Failed to process mining stage');
      }

      const result = await response.json();
      onComplete(result);

      toast({
        title: "Mining Stage Completed",
        description: `Successfully processed with ${result.predictionSummary?.aiPredictedFields || 0} AI-predicted fields`,
      });

    } catch (error) {
      console.error('Error submitting mining stage:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process mining stage",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmptyOptionalFields = () => {
    return optionalFields.filter(field => inputs[field as keyof MiningInputs] === '');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Prediction Info */}
      {useAI && getEmptyOptionalFields().length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
              AI Prediction Enabled
            </CardTitle>
            <CardDescription>
              Missing optional fields will be predicted using AI based on your project context ({project.MetalType}, {project.ProcessingMode}).
              Empty fields: {getEmptyOptionalFields().map(field => fieldLabels[field]).join(', ')}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Mandatory Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mandatory Fields</CardTitle>
          <CardDescription>These fields are required for mining stage calculations</CardDescription>
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
                value={inputs[field as keyof MiningInputs]}
                onChange={(e) => handleInputChange(field as keyof MiningInputs, e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">{fieldDescriptions[field]}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optional Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Optional Fields</CardTitle>
          <CardDescription>
            These fields can be left empty and will be predicted by AI if enabled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optionalFields.map(field => (
            <div key={field} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor={field}>{fieldLabels[field]}</Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
                {useAI && inputs[field as keyof MiningInputs] === '' && (
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Will be AI-predicted
                  </Badge>
                )}
              </div>
              <Input
                id={field}
                type="number"
                step="0.001"
                min="0"
                placeholder={`Enter ${fieldLabels[field].toLowerCase()} (optional)`}
                value={inputs[field as keyof MiningInputs]}
                onChange={(e) => handleInputChange(field as keyof MiningInputs, e.target.value)}
              />
              <p className="text-sm text-gray-500">{fieldDescriptions[field]}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Process Mining Stage
        </Button>
      </div>
    </form>
  );
}