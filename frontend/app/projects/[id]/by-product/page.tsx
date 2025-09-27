'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Factory, 
  TrendingUp, 
  DollarSign, 
  Leaf, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  PlayCircle,
  RefreshCw,
  Settings,
  Info,
  ExternalLink
} from 'lucide-react';

import { 
  valorizationService, 
  type Byproduct, 
  type ValorizationScenario, 
  type AvailableByproductsResponse,
  type ScenariosResponse,
  type ByproductConstraints 
} from '@/lib/valorizationService';
import { useToast } from '@/hooks/use-toast';
import ProjectLayout from '@/components/ProjectLayout';
import ByproductCard from './components/ByproductCard';
import ScenarioDetailModal from './components/ScenarioDetailModal';
import AnalysisConstraintsForm from './components/AnalysisConstraintsForm';

interface LoadingState {
  availableByproducts: boolean;
  scenarios: boolean;
  analyzing: boolean;
}

interface ErrorState {
  availableByproducts: string | null;
  scenarios: string | null;
  analysis: string | null;
}

export default function ByproductValorizationPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();

  // State management
  const [availableByproducts, setAvailableByproducts] = useState<AvailableByproductsResponse | null>(null);
  const [scenarios, setScenarios] = useState<ScenariosResponse | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ValorizationScenario | null>(null);
  const [showConstraintsForm, setShowConstraintsForm] = useState(false);
  const [selectedByproducts, setSelectedByproducts] = useState<string[]>([]);
  
  const [loading, setLoading] = useState<LoadingState>({
    availableByproducts: true,
    scenarios: true,
    analyzing: false
  });

  const [errors, setErrors] = useState<ErrorState>({
    availableByproducts: null,
    scenarios: null,
    analysis: null
  });

  // Load initial data
  useEffect(() => {
    loadAvailableByproducts();
    loadScenarios();
  }, [projectId]);

  const loadAvailableByproducts = async () => {
    try {
      setLoading(prev => ({ ...prev, availableByproducts: true }));
      setErrors(prev => ({ ...prev, availableByproducts: null }));
      
      const data = await valorizationService.getAvailableByproducts(projectId);
      setAvailableByproducts(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load byproducts';
      setErrors(prev => ({ ...prev, availableByproducts: errorMessage }));
      toast({
        title: 'Error Loading Byproducts',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, availableByproducts: false }));
    }
  };

  const loadScenarios = async () => {
    try {
      setLoading(prev => ({ ...prev, scenarios: true }));
      setErrors(prev => ({ ...prev, scenarios: null }));
      
      const data = await valorizationService.getProjectScenarios(projectId);
      setScenarios(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load scenarios';
      setErrors(prev => ({ ...prev, scenarios: errorMessage }));
      // Don't show toast for scenarios error if it's just "no scenarios found"
      if (!errorMessage.includes('scenarios found')) {
        toast({
          title: 'Error Loading Scenarios',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(prev => ({ ...prev, scenarios: false }));
    }
  };

  const handleAnalyzeByproducts = async (constraints?: ByproductConstraints) => {
    try {
      setLoading(prev => ({ ...prev, analyzing: true }));
      setErrors(prev => ({ ...prev, analysis: null }));
      
      const byproductsToAnalyze = selectedByproducts.length > 0 ? selectedByproducts : undefined;
      
      const result = await valorizationService.analyzeByproducts(
        projectId, 
        byproductsToAnalyze, 
        constraints
      );
      
      toast({
        title: 'Analysis Complete',
        description: `Successfully analyzed ${result.successfulAnalyses} byproducts. ${
          result.failedAnalyses > 0 ? `${result.failedAnalyses} analyses failed.` : ''
        }`,
        variant: result.failedAnalyses > 0 ? 'default' : 'default',
      });

      // Reload scenarios to show new results
      await loadScenarios();
      setShowConstraintsForm(false);
      setSelectedByproducts([]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setErrors(prev => ({ ...prev, analysis: errorMessage }));
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, analyzing: false }));
    }
  };

  const handleByproductSelect = (byproductName: string, selected: boolean) => {
    setSelectedByproducts(prev => 
      selected 
        ? [...prev, byproductName]
        : prev.filter(name => name !== byproductName)
    );
  };

  const getAnalysisStats = () => {
    if (!scenarios || !scenarios.scenariosByStage) return null;
    
    const totalScenarios = scenarios.totalScenarios;
    const stageCount = Object.keys(scenarios.scenariosByStage).length;
    
    const avgConfidence = scenarios.scenarios.length > 0 
      ? scenarios.scenarios.reduce((sum, scenario) => 
          sum + (scenario.TopApplication?.ConfidenceScorePercent || 0), 0
        ) / scenarios.scenarios.length
      : 0;

    const totalRevenue = scenarios.scenarios.reduce((sum, scenario) => 
      sum + (scenario.AggregateBenefits?.TotalPotentialRevenueUsd?.median || 0), 0
    );

    const totalCO2Avoided = scenarios.scenarios.reduce((sum, scenario) => 
      sum + (scenario.AggregateBenefits?.TotalAvoidedEmissionsKilogramsCO2e || 0), 0
    );

    return {
      totalScenarios,
      stageCount,
      avgConfidence,
      totalRevenue,
      totalCO2Avoided
    };
  };

  const stats = getAnalysisStats();

  if (loading.availableByproducts) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Byproduct Valorization</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (errors.availableByproducts) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errors.availableByproducts}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProjectLayout>
      {/* Feature Banner */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-purple-900">Byproduct Valorization Engine</h1>
              <p className="text-sm text-purple-700">
                Transform waste streams into valuable revenue opportunities with AI-powered analysis
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Byproduct Valorization
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Transform waste streams into valuable revenue opportunities
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadAvailableByproducts();
              loadScenarios();
            }}
            disabled={loading.availableByproducts || loading.scenarios}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading.availableByproducts || loading.scenarios ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={showConstraintsForm} onOpenChange={setShowConstraintsForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto">
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configure Valorization Analysis</DialogTitle>
              </DialogHeader>
              <AnalysisConstraintsForm
                availableByproducts={availableByproducts}
                selectedByproducts={selectedByproducts}
                onByproductSelect={handleByproductSelect}
                onAnalyze={handleAnalyzeByproducts}
                isAnalyzing={loading.analyzing}
                onCancel={() => setShowConstraintsForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Factory className="h-4 w-4 text-purple-600" />
                <div className="text-sm font-medium truncate">Total Scenarios</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalScenarios}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="text-sm font-medium truncate">Stages Covered</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.stageCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-medium truncate">Avg Confidence</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{(stats.avgConfidence || 0).toFixed(0)}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <div className="text-sm font-medium truncate">Total Revenue</div>
              </div>
              <div className="text-lg sm:text-2xl font-bold truncate">
                {valorizationService.formatCurrency(stats.totalRevenue || 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <div className="text-sm font-medium truncate">CO₂ Avoided</div>
              </div>
              <div className="text-lg sm:text-2xl font-bold truncate">
                {valorizationService.formatLargeNumber(stats.totalCO2Avoided || 0, 'kg')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Progress */}
      {loading.analyzing && (
        <Alert>
          <Sparkles className="h-4 w-4 animate-pulse" />
          <AlertDescription>
            <div className="flex items-center space-x-2">
              <span>Analyzing byproducts with AI...</span>
              <div className="ml-4 flex-1">
                <Progress value={33} className="w-full" />
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Analysis Error */}
      {errors.analysis && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.analysis}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="available" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <Factory className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Available Byproducts</span>
            <span className="sm:hidden">Available</span>
            {availableByproducts && (
              <Badge variant="secondary" className="text-xs">{availableByproducts.totalByproducts}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Valorization Scenarios</span>
            <span className="sm:hidden">Scenarios</span>
            {scenarios && (
              <Badge variant="secondary" className="text-xs">{scenarios.totalScenarios}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Available Byproducts Tab */}
        <TabsContent value="available" className="space-y-4">
          {availableByproducts && availableByproducts.totalByproducts > 0 ? (
            <div className="space-y-6">
              {Object.entries(availableByproducts.byproductsByStage).map(([stageName, byproducts]) => {
                const stageInfo = valorizationService.getStageInfo(stageName);
                return (
                  <div key={stageName} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{stageInfo.icon}</span>
                      <h3 className="text-xl font-semibold">{stageName}</h3>
                      <Badge variant="outline">{byproducts.length} byproducts</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {byproducts.map((byproduct) => (
                        <ByproductCard
                          key={`${stageName}-${byproduct.ByproductName}`}
                          byproduct={byproduct}
                          isSelected={selectedByproducts.includes(byproduct.ByproductName)}
                          onSelect={(selected) => handleByproductSelect(byproduct.ByproductName, selected)}
                          scenario={scenarios?.scenarios.find(s => 
                            s.StageName === stageName && s.ByproductName === byproduct.ByproductName
                          )}
                          onViewScenario={setSelectedScenario}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Byproducts Available</h3>
                  <p className="text-muted-foreground">
                    Complete your project stages to see available byproducts for valorization.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          {loading.scenarios ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : scenarios && scenarios.totalScenarios > 0 ? (
            <div className="space-y-6">
              {Object.entries(scenarios.scenariosByStage).map(([stageName, stageScenarios]) => {
                const stageInfo = valorizationService.getStageInfo(stageName);
                return (
                  <div key={stageName} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{stageInfo.icon}</span>
                      <h3 className="text-xl font-semibold">{stageName}</h3>
                      <Badge variant="outline">{stageScenarios.length} scenarios</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {stageScenarios.map((scenario) => (
                        <ByproductCard
                          key={scenario._id}
                          byproduct={{
                            StageName: scenario.StageName,
                            ByproductName: scenario.ByproductName,
                            MassTonnesPerFunctionalUnit: scenario.MassTonnesPerFunctionalUnit,
                          }}
                          scenario={scenario}
                          onViewScenario={setSelectedScenario}
                          showAnalysisResult={true}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Valorization Scenarios</h3>
                  <p className="text-muted-foreground mb-4">
                    Run AI analysis on your byproducts to generate valorization scenarios.
                  </p>
                  <Button onClick={() => setShowConstraintsForm(true)}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Scenario Detail Modal */}
      {selectedScenario && (
        <ScenarioDetailModal
          scenario={selectedScenario}
          onClose={() => setSelectedScenario(null)}
          onUpdate={loadScenarios}
        />
      )}
    </ProjectLayout>
  );
}