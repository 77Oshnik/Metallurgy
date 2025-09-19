'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, TrendingUp, Zap, Droplets } from 'lucide-react';

interface StageResultsProps {
  stageName: string;
  results: any;
}

export default function StageResults({ stageName, results }: StageResultsProps) {
  const outputs = results.Outputs || {};
  const predictionSummary = results.predictionSummary;
  const fieldSources = results.FieldSources || {};

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toFixed(3);
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/Per Functional Unit/g, '(per FU)')
      .replace(/Kilowatt Hours/g, 'kWh')
      .replace(/Kilograms/g, 'kg')
      .replace(/Carbon Dioxide Equivalent/g, 'CO₂-eq')
      .replace(/Cubic Meters/g, 'm³')
      .replace(/Megajoules/g, 'MJ');
  };

  const getFieldIcon = (fieldName: string) => {
    if (fieldName.includes('Carbon') || fieldName.includes('CO2')) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    if (fieldName.includes('Energy')) {
      return <Zap className="h-4 w-4 text-yellow-600" />;
    }
    if (fieldName.includes('Water')) {
      return <Droplets className="h-4 w-4 text-blue-600" />;
    }
    return null;
  };

  const getUnit = (fieldName: string): string => {
    if (fieldName.includes('CarbonFootprint')) return 'kg CO₂-eq';
    if (fieldName.includes('EnergyFootprint')) return 'MJ';
    if (fieldName.includes('WaterFootprint')) return 'm³';
    if (fieldName.includes('Percent')) return '%';
    if (fieldName.includes('Fraction')) return '';
    if (fieldName.includes('Mass') && fieldName.includes('Tonnes')) return 'tonnes';
    if (fieldName.includes('Years')) return 'years';
    return '';
  };

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center text-green-800">
          <CheckCircle className="h-5 w-5 mr-2" />
          {stageName} Stage Results
        </CardTitle>
        <CardDescription>
          Stage completed successfully with comprehensive calculations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Prediction Summary */}
        {predictionSummary && predictionSummary.aiPredictedFields > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Prediction Summary
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{predictionSummary.totalFields}</div>
                <div className="text-blue-600">Total Fields</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{predictionSummary.userProvidedFields}</div>
                <div className="text-green-600">User Provided</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-700">{predictionSummary.aiPredictedFields}</div>
                <div className="text-purple-600">AI Predicted</div>
              </div>
            </div>
            {predictionSummary.predictedFieldNames && predictionSummary.predictedFieldNames.length > 0 && (
              <div>
                <span className="text-blue-700 text-sm font-medium">AI-Predicted Fields:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {predictionSummary.predictedFieldNames.map((field: string) => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {formatFieldName(field)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Outputs */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Key Outputs</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(outputs).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg p-4 border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getFieldIcon(key)}
                      <h5 className="font-medium text-gray-900 text-sm">
                        {formatFieldName(key)}
                      </h5>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatValue(value)}
                    </div>
                    {getUnit(key) && (
                      <div className="text-sm text-gray-500 mt-1">
                        {getUnit(key)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Summary with Field Sources */}
        {results.Inputs && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Input Summary</h4>
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="divide-y divide-gray-200">
                {Object.entries(results.Inputs).map(([key, value]) => (
                  <div key={key} className="px-4 py-3 flex justify-between items-center">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {formatFieldName(key)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-mono text-gray-700">
                        {formatValue(value)}
                      </span>
                      {fieldSources[key] && (
                        <Badge 
                          variant={fieldSources[key] === 'user' ? 'default' : 
                                  fieldSources[key] === 'ai-predicted' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {fieldSources[key] === 'user' ? 'User' : 
                           fieldSources[key] === 'ai-predicted' ? 'AI' : 
                           fieldSources[key] === 'fallback' ? 'Fallback' : fieldSources[key]}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Computation Metadata */}
        {results.ComputationMetadata && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Computation Details</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(results.ComputationMetadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}