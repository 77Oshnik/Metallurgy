'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  DollarSign, 
  Leaf, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  Download,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';

import {
  valorizationService,
  type ValorizationScenario,
  type SuggestedApplication,
  type ByproductConstraints
} from '@/lib/valorizationService';
import { useToast } from '@/hooks/use-toast';

interface ScenarioDetailModalProps {
  scenario: ValorizationScenario;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ScenarioDetailModal({
  scenario,
  onClose,
  onUpdate
}: ScenarioDetailModalProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const analysis = scenario.GeminiAnalysis || scenario.DetailedAnalysis;
  const stageInfo = valorizationService.getStageInfo(scenario.StageName);
  
  if (!analysis) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scenario Details</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No detailed analysis available for this scenario.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handleUpdateScenario = async () => {
    try {
      setIsUpdating(true);
      
      // For demo purposes, use default constraints
      const constraints: ByproductConstraints = {
        preferLowCapex: true,
        region: 'North America'
      };
      
      await valorizationService.updateScenario(
        scenario.ProjectIdentifier,
        scenario._id,
        constraints
      );
      
      toast({
        title: 'Scenario Updated',
        description: 'The valorization scenario has been updated with new analysis.',
      });
      
      onUpdate();
      onClose();
      
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update scenario',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const ApplicationCard = ({ application, index }: { application: SuggestedApplication; index: number }) => {
    const feasibilityInfo = valorizationService.getFeasibilityInfo(application.TechnicalFeasibilityRating);
    
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <span>{application.ApplicationName}</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Badge 
                variant="outline" 
                className={`${feasibilityInfo.bgColor} ${feasibilityInfo.color} border-none`}
              >
                {feasibilityInfo.description}
              </Badge>
              <Badge 
                variant="outline"
                className={valorizationService.getConfidenceColor(application.ConfidenceScorePercent)}
              >
                {application.ConfidenceScorePercent}% confidence
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Technical Description */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Technical Process</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {application.TechnicalDescription}
            </p>
          </div>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Leaf className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">CO₂ Avoided</div>
              <div className="text-sm font-semibold">
                {valorizationService.formatLargeNumber(
                  application.AvoidedEmissionsKilogramsCarbonDioxideEquivalentPerTonneByproduct,
                  'kg/t'
                )}
              </div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Market Value</div>
              <div className="text-sm font-semibold">
                {valorizationService.formatCurrency(application.EstimatedMarketValueUsdPerTonne.median)}/t
              </div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600 mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Timeline</div>
              <div className="text-sm font-semibold">
                {application.ImplementationTimeframeMonths.min}-{application.ImplementationTimeframeMonths.max} months
              </div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600 mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Substitution</div>
              <div className="text-sm font-semibold">
                {application.ExpectedSubstitutionRateTonnesPerTonneByproduct.toFixed(1)}:1
              </div>
            </div>
          </div>
          
          {/* Economics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h5 className="text-sm font-semibold">Market Value ($/tonne)</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low:</span>
                  <span>{valorizationService.formatCurrency(application.EstimatedMarketValueUsdPerTonne.low)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Median:</span>
                  <span className="font-semibold">{valorizationService.formatCurrency(application.EstimatedMarketValueUsdPerTonne.median)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High:</span>
                  <span>{valorizationService.formatCurrency(application.EstimatedMarketValueUsdPerTonne.high)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-sm font-semibold">Processing OPEX ($/tonne)</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low:</span>
                  <span>{valorizationService.formatCurrency(application.EstimatedProcessingOpexUsdPerTonne.low)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Median:</span>
                  <span className="font-semibold">{valorizationService.formatCurrency(application.EstimatedProcessingOpexUsdPerTonne.median)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High:</span>
                  <span>{valorizationService.formatCurrency(application.EstimatedProcessingOpexUsdPerTonne.high)}</span>
                </div>
              </div>
            </div>
            
            {application.EstimatedProcessingCapexUsdPerTonne && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold">Processing CAPEX ($/tonne)</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Low:</span>
                    <span>{valorizationService.formatCurrency(application.EstimatedProcessingCapexUsdPerTonne.low)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Median:</span>
                    <span className="font-semibold">{valorizationService.formatCurrency(application.EstimatedProcessingCapexUsdPerTonne.median)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">High:</span>
                    <span>{valorizationService.formatCurrency(application.EstimatedProcessingCapexUsdPerTonne.high)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
              {/* Quality Requirements */}
              {application.TypicalQualityRequirements && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold">Quality Requirements</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                    {application.TypicalQualityRequirements.moisturePercent !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Moisture:</span> {application.TypicalQualityRequirements.moisturePercent}%
                      </div>
                    )}
                    {application.TypicalQualityRequirements.particleSizeMm !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Particle Size:</span> {application.TypicalQualityRequirements.particleSizeMm}mm
                      </div>
                    )}
                    {application.TypicalQualityRequirements.heavyMetalThresholdsPpm !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Heavy Metals:</span> &lt;{application.TypicalQualityRequirements.heavyMetalThresholdsPpm}ppm
                      </div>
                    )}
                    {application.TypicalQualityRequirements.pHRange && (
                      <div>
                        <span className="text-muted-foreground">pH Range:</span> {application.TypicalQualityRequirements.pHRange.min}-{application.TypicalQualityRequirements.pHRange.max}
                      </div>
                    )}
                  </div>
                  {application.TypicalQualityRequirements.other && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {application.TypicalQualityRequirements.other}
                    </p>
                  )}
                </div>
              )}
          
          {/* Regulatory Notes */}
          {application.RegulatoryNotes && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold">Regulatory Considerations</h5>
              <p className="text-sm text-muted-foreground">
                {application.RegulatoryNotes}
              </p>
            </div>
          )}
          
          {/* Evidence and References */}
          {application.EvidenceAndReferences && application.EvidenceAndReferences.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold">Evidence & References</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {application.EvidenceAndReferences.map((ref, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Confidence Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold">Analysis Confidence</h5>
              <span className={`text-sm ${valorizationService.getConfidenceColor(application.ConfidenceScorePercent)}`}>
                {application.ConfidenceScorePercent}%
              </span>
            </div>
            <Progress value={application.ConfidenceScorePercent} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <DialogTitle className="flex items-center space-x-3">
                <span className="text-2xl">{stageInfo.icon}</span>
                <div>
                  <div className="text-lg sm:text-xl">{scenario.ByproductName}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {scenario.StageName} • {scenario.MassTonnesPerFunctionalUnit.toFixed(2)} t/FU
                  </div>
                </div>
              </DialogTitle>
              
              {analysis.OverallRecommendationSummary && (
                <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
                  {analysis.OverallRecommendationSummary}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdateScenario}
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                Update Analysis
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="w-full sm:w-auto">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="applications" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="applications">
              Applications ({analysis.SuggestedApplications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="summary">
              Summary & Benefits
            </TabsTrigger>
            <TabsTrigger value="metadata">
              Analysis Metadata
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="applications" className="h-full overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {analysis.SuggestedApplications?.map((application, index) => (
                    <ApplicationCard
                      key={index}
                      application={application}
                      index={index}
                    />
                  )) || (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No applications found in the analysis.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="summary" className="h-full overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  {/* Aggregate Benefits */}
                  {analysis.ScenarioAggregateBenefits && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Aggregate Benefits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Environmental Impact</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">CO₂ Avoided:</span>
                                  <span className="font-semibold">
                                    {valorizationService.formatLargeNumber(
                                      analysis.ScenarioAggregateBenefits.TotalAvoidedEmissionsKilogramsCO2e,
                                      'kg'
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Landfill Avoided:</span>
                                  <span className="font-semibold">
                                    {analysis.ScenarioAggregateBenefits.TotalAvoidedLandfillCubicMeters.toFixed(1)} m³
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Economic Benefits</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Revenue (Low):</span>
                                  <span>{valorizationService.formatCurrency(analysis.ScenarioAggregateBenefits.TotalPotentialRevenueUsd.low)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Revenue (Median):</span>
                                  <span className="font-semibold">{valorizationService.formatCurrency(analysis.ScenarioAggregateBenefits.TotalPotentialRevenueUsd.median)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Revenue (High):</span>
                                  <span>{valorizationService.formatCurrency(analysis.ScenarioAggregateBenefits.TotalPotentialRevenueUsd.high)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Net Benefit (Est.):</span>
                                  <span className="font-semibold text-green-600">
                                    {valorizationService.formatCurrency(analysis.ScenarioAggregateBenefits.EstimatedNetBenefitUsd.median)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Overall Recommendation */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Overall Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {analysis.OverallRecommendationSummary}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="metadata" className="h-full overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Provenance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Model:</span>
                          <div className="font-medium">{analysis.Provenance.ModelName}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prompt Version:</span>
                          <div className="font-medium">{analysis.Provenance.PromptVersion}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Generated:</span>
                          <div className="font-medium">
                            {new Date(analysis.Provenance.GeneratedAtUtc).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Scenario ID:</span>
                          <div className="font-medium font-mono text-xs">{scenario._id}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}