'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Recycle,
  ArrowRight,
  TrendingUp,
  TreePine,
  Droplets,
  Zap,
  Factory,
  BarChart3,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ProjectLayout from '@/components/ProjectLayout';

interface Project {
  _id: string;
  ProjectName: string;
  FunctionalUnitMassTonnes: number;
  MetalType: string;
  ProcessingMode: string;
}

interface ComparisonResult {
  linear: {
    carbonFootprint: number;
    energyFootprint: number;
    waterFootprint: number;
    wasteGenerated: number;
    materialEfficiency: number;
  };
  circular: {
    carbonFootprint: number;
    energyFootprint: number;
    waterFootprint: number;
    wasteGenerated: number;
    materialEfficiency: number;
    recyclingRate: number;
  };
  benefits: {
    carbonReduction: number;
    energySavings: number;
    waterSavings: number;
    wasteReduction: number;
    efficiencyImprovement: number;
  };
}

export default function CircularComparisonPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchComparison();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const result = await response.json();
        setProject(result.project);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    try {
      // This would be replaced with actual API call
      // For now, simulate with mock data
      setTimeout(() => {
        setComparison({
          linear: {
            carbonFootprint: 1250.5,
            energyFootprint: 3200.8,
            waterFootprint: 156.2,
            wasteGenerated: 89.3,
            materialEfficiency: 65.4
          },
          circular: {
            carbonFootprint: 890.3,
            energyFootprint: 2240.6,
            waterFootprint: 109.4,
            wasteGenerated: 23.7,
            materialEfficiency: 87.2,
            recyclingRate: 78.5
          },
          benefits: {
            carbonReduction: 28.8,
            energySavings: 30.0,
            waterSavings: 30.0,
            wasteReduction: 73.5,
            efficiencyImprovement: 33.3
          }
        });
      }, 1000);
    } catch (error) {
      console.error("Error fetching comparison:", error);
    }
  };

  const generateComparison = async () => {
    setIsGenerating(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      fetchComparison();
      toast({
        title: "Success",
        description: "Circular comparison analysis completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate comparison",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getImprovementColor = (percentage: number) => {
    if (percentage >= 50) return "text-green-700 bg-green-100";
    if (percentage >= 25) return "text-blue-700 bg-blue-100";
    if (percentage >= 10) return "text-orange-700 bg-orange-100";
    return "text-gray-700 bg-gray-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <ProjectLayout>
      {/* Feature Banner */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Recycle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-900">Circular vs Linear Comparison</h1>
              <p className="text-sm text-green-700">
                Compare environmental and economic benefits of circular economy approaches
              </p>
            </div>
          </div>
        </div>
      </div>
        {/* Project Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Factory className="h-5 w-5 text-purple-600" />
              <span>Project Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-500">Project Name</span>
                <p className="font-semibold">{project?.ProjectName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Metal Type</span>
                <p className="font-semibold">{project?.MetalType}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Current Mode</span>
                <Badge variant="outline">{project?.ProcessingMode}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Comparison Button */}
        {!comparison && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate Circular Comparison</CardTitle>
              <CardDescription>
                Analyze the differences between linear and circular processing approaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={generateComparison} 
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Comparison...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Comparison Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comparison Results */}
        {comparison && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <TreePine className="h-4 w-4 mr-2 text-green-600" />
                    Carbon Reduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {comparison.benefits.carbonReduction.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(comparison.linear.carbonFootprint - comparison.circular.carbonFootprint).toFixed(1)} kg CO₂-eq saved
                  </div>
                  <Progress value={comparison.benefits.carbonReduction} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Zap className="h-4 w-4 mr-2 text-blue-600" />
                    Energy Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">
                    {comparison.benefits.energySavings.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(comparison.linear.energyFootprint - comparison.circular.energyFootprint).toFixed(1)} MJ saved
                  </div>
                  <Progress value={comparison.benefits.energySavings} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Droplets className="h-4 w-4 mr-2 text-cyan-600" />
                    Water Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-700">
                    {comparison.benefits.waterSavings.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(comparison.linear.waterFootprint - comparison.circular.waterFootprint).toFixed(1)} m³ saved
                  </div>
                  <Progress value={comparison.benefits.waterSavings} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Recycle className="h-4 w-4 mr-2 text-purple-600" />
                    Waste Reduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    {comparison.benefits.wasteReduction.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(comparison.linear.wasteGenerated - comparison.circular.wasteGenerated).toFixed(1)} tonnes reduced
                  </div>
                  <Progress value={comparison.benefits.wasteReduction} className="mt-2 h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Detailed Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Linear Processing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ArrowRight className="h-5 w-5 text-gray-600" />
                    <span>Linear Processing</span>
                  </CardTitle>
                  <CardDescription>
                    Traditional take-make-dispose approach
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Carbon Footprint</span>
                      <span className="font-semibold">{comparison.linear.carbonFootprint.toFixed(2)} kg CO₂-eq</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Energy Footprint</span>
                      <span className="font-semibold">{comparison.linear.energyFootprint.toFixed(2)} MJ</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Water Footprint</span>
                      <span className="font-semibold">{comparison.linear.waterFootprint.toFixed(2)} m³</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Waste Generated</span>
                      <span className="font-semibold">{comparison.linear.wasteGenerated.toFixed(2)} tonnes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Material Efficiency</span>
                      <span className="font-semibold">{comparison.linear.materialEfficiency.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Circular Processing */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Recycle className="h-5 w-5 text-green-600" />
                    <span>Circular Processing</span>
                  </CardTitle>
                  <CardDescription>
                    Regenerative reduce-reuse-recycle approach
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Carbon Footprint</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{comparison.circular.carbonFootprint.toFixed(2)} kg CO₂-eq</span>
                        <Badge className={getImprovementColor(comparison.benefits.carbonReduction)}>
                          -{comparison.benefits.carbonReduction.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Energy Footprint</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{comparison.circular.energyFootprint.toFixed(2)} MJ</span>
                        <Badge className={getImprovementColor(comparison.benefits.energySavings)}>
                          -{comparison.benefits.energySavings.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Water Footprint</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{comparison.circular.waterFootprint.toFixed(2)} m³</span>
                        <Badge className={getImprovementColor(comparison.benefits.waterSavings)}>
                          -{comparison.benefits.waterSavings.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Waste Generated</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{comparison.circular.wasteGenerated.toFixed(2)} tonnes</span>
                        <Badge className={getImprovementColor(comparison.benefits.wasteReduction)}>
                          -{comparison.benefits.wasteReduction.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Material Efficiency</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{comparison.circular.materialEfficiency.toFixed(1)}%</span>
                        <Badge className={getImprovementColor(comparison.benefits.efficiencyImprovement)}>
                          +{comparison.benefits.efficiencyImprovement.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-sm text-gray-600">Recycling Rate</span>
                      <span className="font-semibold text-green-600">{comparison.circular.recyclingRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Key Insights & Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3">Environmental Benefits</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Significant reduction in carbon emissions through recycling and reuse</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Lower energy consumption due to efficient material recovery</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Reduced water usage through closed-loop systems</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-3">Economic Opportunities</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Revenue generation from byproduct valorization</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Reduced raw material costs through recycling</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Long-term cost savings from improved efficiency</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> Consider implementing circular economy principles in your {project?.MetalType} processing. 
                Explore the Byproduct Valorization tool to identify specific opportunities for waste stream optimization.
              </AlertDescription>
            </Alert>
          </div>
        )}
      
    </ProjectLayout>
  );
}