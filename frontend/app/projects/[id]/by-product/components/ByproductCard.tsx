'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Leaf, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Sparkles
} from 'lucide-react';

import { 
  valorizationService,
  type Byproduct,
  type ValorizationScenario 
} from '@/lib/valorizationService';

interface ByproductCardProps {
  byproduct: Byproduct;
  scenario?: ValorizationScenario;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onViewScenario?: (scenario: ValorizationScenario) => void;
  showAnalysisResult?: boolean;
}

export default function ByproductCard({
  byproduct,
  scenario,
  isSelected = false,
  onSelect,
  onViewScenario,
  showAnalysisResult = false
}: ByproductCardProps) {
  const stageInfo = valorizationService.getStageInfo(byproduct.StageName);
  const hasScenario = !!scenario;
  
  // Get top application from scenario
  const topApplication = scenario?.GeminiAnalysis?.SuggestedApplications?.[0] || scenario?.TopApplication;
  const aggregateBenefits = scenario?.GeminiAnalysis?.ScenarioAggregateBenefits || scenario?.AggregateBenefits;
  
  const confidence = topApplication?.ConfidenceScorePercent || 0;
  const feasibilityInfo = topApplication?.TechnicalFeasibilityRating 
    ? valorizationService.getFeasibilityInfo(topApplication.TechnicalFeasibilityRating)
    : null;

  const handleCardClick = () => {
    if (hasScenario && onViewScenario) {
      onViewScenario(scenario);
    }
  };

  const handleSelectChange = (checked: boolean) => {
    onSelect?.(checked);
  };

  return (
    <Card 
      className={`relative transition-all duration-200 hover:shadow-lg group ${
        hasScenario ? 'cursor-pointer hover:shadow-purple-100 dark:hover:shadow-purple-900/20' : ''
      } ${
        isSelected ? 'ring-2 ring-purple-500 shadow-purple-100 dark:shadow-purple-900/20' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div 
          className="absolute top-3 left-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectChange}
            className="bg-background border-2"
          />
        </div>
      )}

      {/* Stage Badge */}
      <div className="absolute top-3 right-3">
        <Badge 
          variant="outline" 
          className={`${stageInfo.bgColor} ${stageInfo.color} border-none`}
        >
          <span className="mr-1">{stageInfo.icon}</span>
          {byproduct.StageName}
        </Badge>
      </div>

      <CardHeader className={`pb-3 ${onSelect ? 'pt-12' : 'pt-12'}`}>
        <CardTitle className="text-base sm:text-lg font-semibold flex items-start justify-between">
          <span className="line-clamp-2 pr-2">{byproduct.ByproductName}</span>
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground gap-2">
          <span>{byproduct.MassTonnesPerFunctionalUnit.toFixed(2)} t/FU</span>
          {hasScenario && (
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-purple-500" />
              <span className="text-purple-600 dark:text-purple-400 font-medium">Analyzed</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Analysis Results */}
        {hasScenario && showAnalysisResult ? (
          <div className="space-y-3">
            {/* Top Application */}
            {topApplication && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Top Application</span>
                  <Badge variant="outline" className={confidence >= 70 ? 'text-green-600' : confidence >= 50 ? 'text-orange-600' : 'text-red-600'}>
                    {confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {typeof topApplication.ApplicationName === 'string' 
                    ? topApplication.ApplicationName 
                    : 'Application details available'}
                </p>
                
                {feasibilityInfo && (
                  <Badge 
                    variant="outline" 
                    className={`${feasibilityInfo.bgColor} ${feasibilityInfo.color} border-none text-xs`}
                  >
                    {feasibilityInfo.description}
                  </Badge>
                )}
              </div>
            )}

            {/* Key Metrics */}
            {aggregateBenefits && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>Revenue</span>
                  </div>
                  <div className="font-medium text-xs sm:text-sm">
                    {valorizationService.formatCurrency(
                      aggregateBenefits.TotalPotentialRevenueUsd?.median || 0
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Leaf className="h-3 w-3" />
                    <span>CO₂ Avoided</span>
                  </div>
                  <div className="font-medium text-xs sm:text-sm">
                    {valorizationService.formatLargeNumber(
                      aggregateBenefits.TotalAvoidedEmissionsKilogramsCO2e || 0, 
                      'kg'
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Confidence Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Analysis Confidence</span>
                <span className={valorizationService.getConfidenceColor(confidence)}>
                  {confidence}%
                </span>
              </div>
              <Progress 
                value={confidence} 
                className="h-1.5"
                // className={`h-1.5 ${confidence >= 70 ? '[&>div]:bg-green-500' : confidence >= 50 ? '[&>div]:bg-orange-500' : '[&>div]:bg-red-500'}`}
              />
            </div>

            {/* View Details Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20"
              onClick={(e) => {
                e.stopPropagation();
                onViewScenario?.(scenario);
              }}
            >
              <Eye className="h-3 w-3 mr-2" />
              View Analysis
            </Button>
          </div>
        ) : hasScenario ? (
          // Minimal view for available byproducts tab when scenario exists
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Analyzed
              </Badge>
              {topApplication && (
                <Badge variant="outline" className={valorizationService.getConfidenceColor(confidence)}>
                  {confidence}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Click to view valorization analysis
            </p>
          </div>
        ) : (
          // No scenario available
          <div className="space-y-2">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">No analysis available</span>
            </div>
            
            {/* Measured Properties */}
            {byproduct.measuredProperties && (
              <div className="text-xs text-muted-foreground">
                <div className="space-y-1">
                  {byproduct.measuredProperties.moisturePercent && (
                    <div>Moisture: {byproduct.measuredProperties.moisturePercent}%</div>
                  )}
                  {byproduct.measuredProperties.pH && (
                    <div>pH: {byproduct.measuredProperties.pH}</div>
                  )}
                  {byproduct.measuredProperties.densityKgM3 && (
                    <div>Density: {byproduct.measuredProperties.densityKgM3} kg/m³</div>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Select for AI-powered valorization analysis
            </p>
          </div>
        )}

        {/* Mass Information */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Mass per Functional Unit</span>
            <span className="font-medium">{byproduct.MassTonnesPerFunctionalUnit.toFixed(3)} tonnes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}