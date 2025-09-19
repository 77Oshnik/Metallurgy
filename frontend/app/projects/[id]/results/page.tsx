'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Recycle, Zap, Droplets, TreePine, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

interface Project {
  _id: string;
  ProjectName: string;
  FunctionalUnitMassTonnes: number;
  MetalType: string;
  ProcessingMode: string;
}

interface StageResult {
  stageName: string;
  data: any;
  outputs: any;
  predictionSummary?: any;
}

export default function ResultsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [results, setResults] = useState<StageResult[]>([]);
  const [loading, setLoading] = useState(true);

  const stageEndpoints = [
    { name: 'Mining', endpoint: 'mining' },
    { name: 'Concentration', endpoint: 'concentration' },
    { name: 'Smelting', endpoint: 'smelting' },
    { name: 'Fabrication', endpoint: 'fabrication' },
    { name: 'Use Phase', endpoint: 'use-phase' },
    { name: 'End-of-Life', endpoint: 'end-of-life' }
  ];

  useEffect(() => {
    fetchProjectAndResults();
  }, [projectId]);

  const fetchProjectAndResults = async () => {
    try {
      // Fetch project details
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (projectResponse.ok) {
        const projectResult = await projectResponse.json();
        setProject(projectResult.project);
      }

      // Fetch results for each stage
      const stageResults: StageResult[] = [];
      
      for (const stage of stageEndpoints) {
        try {
          const response = await fetch(`/api/${stage.endpoint}/${projectId}`);
          if (response.ok) {
            const data = await response.json();
            stageResults.push({
              stageName: stage.name,
              data: data,
              outputs: data.Outputs || {},
              predictionSummary: data.predictionSummary
            });
          }
        } catch (error) {
          console.log(`No data found for ${stage.name} stage`);
        }
      }

      setResults(stageResults);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({
        title: "Error",
        description: "Failed to load project results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalImpacts = () => {
    let totalCarbon = 0;
    let totalEnergy = 0;
    let totalWater = 0;

    results.forEach(result => {
      const outputs = result.outputs;
      
      // Sum carbon footprints
      Object.keys(outputs).forEach(key => {
        if (key.includes('CarbonFootprint') && typeof outputs[key] === 'number') {
          totalCarbon += outputs[key];
        }
        if (key.includes('EnergyFootprint') && typeof outputs[key] === 'number') {
          totalEnergy += outputs[key];
        }
        if (key.includes('WaterFootprint') && typeof outputs[key] === 'number') {
          totalWater += outputs[key];
        }
      });
    });

    return { totalCarbon, totalEnergy, totalWater };
  };

  const getCircularityIndicators = () => {
    const indicators: any = {};
    
    results.forEach(result => {
      const outputs = result.outputs;
      const metadata = result.data.ComputationMetadata;
      
      // Extract circularity indicators
      if (outputs.RecycledContentPercent !== undefined) {
        indicators.recycledContent = outputs.RecycledContentPercent;
      }
      if (outputs.YieldEfficiencyPercent !== undefined) {
        indicators.yieldEfficiency = outputs.YieldEfficiencyPercent;
      }
      if (outputs.ReuseFactorPercent !== undefined) {
        indicators.reuseFactorPercent = outputs.ReuseFactorPercent;
      }
      if (outputs.EndOfLifeRecyclingRatePercent !== undefined) {
        indicators.endOfLifeRecyclingRate = outputs.EndOfLifeRecyclingRatePercent;
      }
      if (outputs.ScrapUtilizationFraction !== undefined) {
        indicators.scrapUtilization = outputs.ScrapUtilizationFraction * 100;
      }
      
      // Extract from metadata
      if (metadata?.circularityIndicators) {
        Object.assign(indicators, metadata.circularityIndicators);
      }
    });

    return indicators;
  };

  const exportResults = () => {
    const exportData = {
      project,
      results,
      totalImpacts: calculateTotalImpacts(),
      circularityIndicators: getCircularityIndicators(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.ProjectName || 'project'}_lca_results.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Results have been exported successfully",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalImpacts = calculateTotalImpacts();
  const circularityIndicators = getCircularityIndicators();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/projects/${projectId}/workflow`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Workflow
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LCA Results</h1>
                <p className="text-sm text-gray-500">
                  {project?.ProjectName} • {project?.MetalType} • {project?.ProcessingMode}
                </p>
              </div>
            </div>
            <Button onClick={exportResults}>
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Carbon Footprint</CardTitle>
              <TreePine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpacts.totalCarbon.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">kg CO₂-eq per functional unit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Energy Footprint</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpacts.totalEnergy.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">MJ per functional unit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Water Footprint</CardTitle>
              <Droplets className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpacts.totalWater.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">m³ per functional unit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stages Completed</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground">out of {project?.ProcessingMode === 'Circular' ? 6 : 5} stages</p>
            </CardContent>
          </Card>
        </div>

        {/* Circularity Indicators */}
        {Object.keys(circularityIndicators).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Recycle className="h-5 w-5 mr-2 text-green-600" />
                Circularity Indicators
              </CardTitle>
              <CardDescription>
                Key metrics for circular economy assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {circularityIndicators.recycledContent !== undefined && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {circularityIndicators.recycledContent.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600">Recycled Content</div>
                  </div>
                )}
                {circularityIndicators.yieldEfficiency !== undefined && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {circularityIndicators.yieldEfficiency.toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-600">Yield Efficiency</div>
                  </div>
                )}
                {circularityIndicators.endOfLifeRecyclingRate !== undefined && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {circularityIndicators.endOfLifeRecyclingRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-600">End-of-Life Recycling Rate</div>
                  </div>
                )}
                {circularityIndicators.scrapUtilization !== undefined && (
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-700">
                      {circularityIndicators.scrapUtilization.toFixed(1)}%
                    </div>
                    <div className="text-sm text-orange-600">Scrap Utilization</div>
                  </div>
                )}
                {circularityIndicators.reuseFactorPercent !== undefined && (
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-700">
                      {circularityIndicators.reuseFactorPercent.toFixed(1)}%
                    </div>
                    <div className="text-sm text-teal-600">Reuse Potential</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Stage Results</CardTitle>
            <CardDescription>
              Comprehensive results for each completed stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={results[0]?.stageName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mining'}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {results.map((result) => (
                  <TabsTrigger 
                    key={result.stageName} 
                    value={result.stageName.toLowerCase().replace(/[^a-z0-9]/g, '')}
                    className="text-xs"
                  >
                    {result.stageName}
                  </TabsTrigger>
                ))}
              </TabsList>

              {results.map((result) => (
                <TabsContent 
                  key={result.stageName} 
                  value={result.stageName.toLowerCase().replace(/[^a-z0-9]/g, '')}
                  className="space-y-4"
                >
                  {/* AI Prediction Summary */}
                  {result.predictionSummary && result.predictionSummary.aiPredictedFields > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">AI Prediction Summary</h4>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">Total Fields:</span>
                          <span className="ml-2 font-medium">{result.predictionSummary.totalFields}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">User Provided:</span>
                          <span className="ml-2 font-medium">{result.predictionSummary.userProvidedFields}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">AI Predicted:</span>
                          <span className="ml-2 font-medium">{result.predictionSummary.aiPredictedFields}</span>
                        </div>
                      </div>
                      {result.predictionSummary.predictedFieldNames.length > 0 && (
                        <div className="mt-2">
                          <span className="text-blue-700 text-sm">Predicted Fields:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.predictionSummary.predictedFieldNames.map((field: string) => (
                              <Badge key={field} variant="secondary" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stage Outputs */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Key Outputs</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {Object.entries(result.outputs).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 flex-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                            <span className="font-medium text-right">
                              {typeof value === 'number' ? value.toFixed(3) : 
                               typeof value === 'object' ? JSON.stringify(value) : 
                               String(value)}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Input Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.data.Inputs && Object.entries(result.data.Inputs).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 flex-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                            <div className="text-right">
                              <span className="font-medium">
                                {typeof value === 'number' ? value.toFixed(3) : String(value)}
                              </span>
                              {result.data.FieldSources && result.data.FieldSources[key] && (
                                <Badge 
                                  variant={result.data.FieldSources[key] === 'user' ? 'default' : 'secondary'}
                                  className="ml-2 text-xs"
                                >
                                  {result.data.FieldSources[key]}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}