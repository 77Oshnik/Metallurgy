'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, 
  Factory, 
  MapPin, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Play,
  X
} from 'lucide-react';

import {
  valorizationService,
  type ByproductConstraints,
  type AvailableByproductsResponse,
  type Byproduct
} from '@/lib/valorizationService';

interface AnalysisConstraintsFormProps {
  availableByproducts: AvailableByproductsResponse | null;
  selectedByproducts: string[];
  onByproductSelect: (byproductName: string, selected: boolean) => void;
  onAnalyze: (constraints?: ByproductConstraints) => void;
  isAnalyzing: boolean;
  onCancel: () => void;
}

export default function AnalysisConstraintsForm({
  availableByproducts,
  selectedByproducts,
  onByproductSelect,
  onAnalyze,
  isAnalyzing,
  onCancel
}: AnalysisConstraintsFormProps) {
  const [constraints, setConstraints] = useState<ByproductConstraints>({
    preferLowCapex: false,
    quickPayback: false,
    region: '',
    exportRestrictions: false,
    localMarketPreferences: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleConstraintChange = (key: keyof ByproductConstraints, value: any) => {
    setConstraints(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate region if provided
    if (constraints.region && constraints.region.length < 2) {
      newErrors.region = 'Region must be at least 2 characters long';
    }
    
    // Validate local market preferences if provided
    if (constraints.localMarketPreferences && constraints.localMarketPreferences.length > 200) {
      newErrors.localMarketPreferences = 'Local market preferences must be less than 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    // Filter out empty string values
    const cleanConstraints = Object.entries(constraints).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        acc[key as keyof ByproductConstraints] = value;
      }
      return acc;
    }, {} as ByproductConstraints);
    
    onAnalyze(Object.keys(cleanConstraints).length > 0 ? cleanConstraints : undefined);
  };

  const handleSelectAll = () => {
    if (!availableByproducts) return;
    
    const allByproductNames = Object.values(availableByproducts.byproductsByStage)
      .flat()
      .map(bp => bp.ByproductName);
    
    const allSelected = allByproductNames.every(name => selectedByproducts.includes(name));
    
    allByproductNames.forEach(name => {
      onByproductSelect(name, !allSelected);
    });
  };

  const getAnalysisEstimate = () => {
    const totalByproducts = selectedByproducts.length > 0 
      ? selectedByproducts.length 
      : availableByproducts?.totalByproducts || 0;
    
    const estimatedTimeMinutes = Math.ceil(totalByproducts * 0.5); // ~30 seconds per byproduct
    
    return {
      totalByproducts,
      estimatedTimeMinutes
    };
  };

  const estimate = getAnalysisEstimate();

  if (!availableByproducts) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No byproducts available for analysis. Please complete your project stages first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">AI-Powered Valorization Analysis</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure analysis parameters and select byproducts for AI-driven valorization recommendations
        </p>
      </div>

      {/* Byproduct Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Factory className="h-5 w-5" />
              <span>Select Byproducts</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {selectedByproducts.length} of {availableByproducts.totalByproducts} selected
              </Badge>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedByproducts.length === availableByproducts.totalByproducts ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-4">
              {Object.entries(availableByproducts.byproductsByStage).map(([stageName, byproducts]) => {
                const stageInfo = valorizationService.getStageInfo(stageName);
                return (
                  <div key={stageName} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{stageInfo.icon}</span>
                      <h4 className="font-medium">{stageName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {byproducts.length} byproducts
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 ml-6">
                      {byproducts.map((byproduct) => (
                        <div
                          key={byproduct.ByproductName}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={selectedByproducts.includes(byproduct.ByproductName)}
                            onCheckedChange={(checked) => 
                              onByproductSelect(byproduct.ByproductName, checked as boolean)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{byproduct.ByproductName}</div>
                            <div className="text-xs text-muted-foreground">
                              {byproduct.MassTonnesPerFunctionalUnit.toFixed(2)} t/FU
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          {selectedByproducts.length === 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Select byproducts to analyze, or leave empty to analyze all available byproducts.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Constraints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Analysis Constraints (Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Economic Preferences */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Economic Preferences</span>
            </Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preferLowCapex"
                  checked={constraints.preferLowCapex}
                  onCheckedChange={(checked) => 
                    handleConstraintChange('preferLowCapex', checked as boolean)
                  }
                />
                <Label htmlFor="preferLowCapex" className="text-sm">
                  Prefer low CAPEX solutions
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quickPayback"
                  checked={constraints.quickPayback}
                  onCheckedChange={(checked) => 
                    handleConstraintChange('quickPayback', checked as boolean)
                  }
                />
                <Label htmlFor="quickPayback" className="text-sm">
                  Need quick payback period
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Geographic and Market Constraints */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Geographic & Market Constraints</span>
            </Label>
            
            <div className="space-y-4 ml-6">
              <div className="space-y-2">
                <Label htmlFor="region" className="text-sm">Region/Location</Label>
                <Input
                  id="region"
                  placeholder="e.g., North America, Europe, Asia-Pacific"
                  value={constraints.region}
                  onChange={(e) => handleConstraintChange('region', e.target.value)}
                  className={errors.region ? 'border-red-500' : ''}
                />
                {errors.region && (
                  <p className="text-xs text-red-500">{errors.region}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exportRestrictions"
                  checked={constraints.exportRestrictions}
                  onCheckedChange={(checked) => 
                    handleConstraintChange('exportRestrictions', checked as boolean)
                  }
                />
                <Label htmlFor="exportRestrictions" className="text-sm">
                  Export restrictions apply
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="localMarketPreferences" className="text-sm">
                  Local Market Preferences
                </Label>
                <Textarea
                  id="localMarketPreferences"
                  placeholder="e.g., construction materials, chemical feedstock, agricultural applications"
                  value={constraints.localMarketPreferences}
                  onChange={(e) => handleConstraintChange('localMarketPreferences', e.target.value)}
                  className={`resize-none ${errors.localMarketPreferences ? 'border-red-500' : ''}`}
                  rows={2}
                />
                {errors.localMarketPreferences && (
                  <p className="text-xs text-red-500">{errors.localMarketPreferences}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {(constraints.localMarketPreferences || '').length}/200 characters
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Analysis Overview</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {estimate.totalByproducts} byproducts • ~{estimate.estimatedTimeMinutes} minutes estimated
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isAnalyzing}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start AI Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Our AI will analyze each byproduct and generate professional valorization recommendations including 
          technical processes, economic estimates, environmental benefits, and implementation timelines.
        </AlertDescription>
      </Alert>
    </div>
  );
}