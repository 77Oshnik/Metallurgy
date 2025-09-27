"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Trash2,
  Zap,
  Flame,
  Droplets,
  Wind,
  Eye,
  Activity,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import ProjectLayout from "@/components/ProjectLayout";
import { 
  analyzeHarmfulEffects, 
  getHarmfulEffectScenarios, 
  deleteHarmfulEffectScenario,
  HarmfulEffectScenario,
  GeminiAnalysisItem
} from "@/lib/harmfulEffectsService";

interface Project {
  _id: string;
  ProjectName: string;
  FunctionalUnitMassTonnes: number;
  MetalType: string;
  ProcessingMode: string;
}

export default function HarmfulEffectsAnalyzerPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<string[]>([
    "Mining",
    "Concentration",
    "Smelting and Refining",
    "Fabrication",
    "Use Phase",
    "End of Life",
  ]);
  const [selectedStage, setSelectedStage] = useState<string>("Smelting and Refining");
  const [analysisResult, setAnalysisResult] = useState<HarmfulEffectScenario | null>(null);
  const [previousScenarios, setPreviousScenarios] = useState<HarmfulEffectScenario[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchPreviousScenarios();
  }, [projectId]);

  // Reset results when stage changes
  useEffect(() => {
    setAnalysisResult(null);
  }, [selectedStage]);

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

  const fetchPreviousScenarios = async () => {
    try {
      const scenarios = await getHarmfulEffectScenarios(projectId);
      setPreviousScenarios(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      toast({
        title: "Error",
        description: "Failed to load previous scenarios",
        variant: "destructive",
      });
    }
  };

  const deleteScenario = async (scenarioId: string) => {
    setIsDeleting(true);
    try {
      await deleteHarmfulEffectScenario(projectId, scenarioId);
      // Refresh the scenarios list
      fetchPreviousScenarios();
      toast({
        title: "Success",
        description: "Scenario deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting scenario:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete scenario",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeHarmfulEffects(projectId, selectedStage);
      setAnalysisResult(result);
      fetchPreviousScenarios(); // Refresh the list
      toast({
        title: "Success",
        description: "Harmful effects analysis completed successfully",
      });
    } catch (error: any) {
      console.error("Error running analysis:", error);
      let errorMessage = error.message || "Failed to run analysis";
      
      // Provide more specific error messages
      if (errorMessage.includes("No data found for stage")) {
        errorMessage = `No data available for ${selectedStage}. Please ensure you have entered data for this stage in your project.`;
      } else if (errorMessage.includes("Network error")) {
        errorMessage = "Unable to connect to the server. Please check your internet connection and ensure the backend is running.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Very High": return "bg-red-500";
      case "High": return "bg-orange-500";
      case "Medium": return "bg-yellow-500";
      case "Safe": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case "Very High": return "text-red-800 bg-red-100";
      case "High": return "text-orange-800 bg-orange-100";
      case "Medium": return "text-yellow-800 bg-yellow-100";
      case "Safe": return "text-green-800 bg-green-100";
      default: return "text-gray-800 bg-gray-100";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Very High": return <Flame className="h-4 w-4 text-red-500" />;
      case "High": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "Medium": return <Activity className="h-4 w-4 text-yellow-500" />;
      case "Safe": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderThresholdResults = (thresholdResults: { [key: string]: string }) => {
    return Object.entries(thresholdResults).map(([field, severity]) => (
      <div key={field} className="flex items-center justify-between py-2 border-b">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getSeverityColor(severity)}`}></div>
          <span className="font-medium">{field}</span>
        </div>
        <Badge className={getSeverityTextColor(severity)}>
          <div className="flex items-center">
            {getSeverityIcon(severity)}
            <span className="ml-1">{severity}</span>
          </div>
        </Badge>
      </div>
    ));
  };

  const renderGeminiAnalysis = (analysis: GeminiAnalysisItem[]) => {
    return analysis.map((item, index) => (
      <Card key={index} className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{item.Field}</CardTitle>
            <Badge className={getSeverityTextColor(item.Severity)}>
              <div className="flex items-center">
                {getSeverityIcon(item.Severity)}
                <span className="ml-1">{item.Severity}</span>
              </div>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                <h4 className="font-semibold">Harmful Effects</h4>
              </div>
              <ul className="space-y-2">
                {item.HarmfulEffects.map((effect, idx) => (
                  <li key={idx} className="text-sm border border-red-200 rounded-lg p-3 bg-red-50">
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <Zap className="h-4 w-4 text-blue-500 mr-2" />
                <h4 className="font-semibold">Remedies</h4>
              </div>
              <ul className="space-y-2">
                {item.Remedies.map((remedy, idx) => (
                  <li key={idx} className="text-sm border border-blue-200 rounded-lg p-3 bg-blue-50">
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                <h4 className="font-semibold">Benefits</h4>
              </div>
              <ul className="space-y-2">
                {item.Benefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm border border-green-200 rounded-lg p-3 bg-green-50">
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProjectLayout>
      {/* Feature Banner */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-900">Harmful Effects Analyzer</h1>
              <p className="text-sm text-red-700">
                Identify environmental and operational impacts with AI-powered insights and remedies
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Harmful Effects Analysis</CardTitle>
                <CardDescription>
                  Select a stage to analyze potential harmful effects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Stage</Label>
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={runAnalysis} 
                  className="w-full"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Analyze Stage
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Previous Scenarios */}
            {previousScenarios.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Previous Analyses</CardTitle>
                  <CardDescription>
                    Your saved harmful effects analyses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {previousScenarios.map((scenario) => (
                    <div
                      key={scenario._id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setSelectedStage(scenario.StageName);
                            setAnalysisResult(scenario);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{scenario.StageName}</span>
                            <div className="flex space-x-1">
                              {Object.values(scenario.ThresholdResults).map((severity, idx) => (
                                severity !== "Safe" && (
                                  <div 
                                    key={idx} 
                                    className={`w-2 h-2 rounded-full ${getSeverityColor(severity)}`}
                                    title={`${severity} severity`}
                                  ></div>
                                )
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-400 mt-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {scenario.CreatedAtUtc ? new Date(scenario.CreatedAtUtc).toLocaleDateString() : 'Unknown date'}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (scenario._id) {
              deleteScenario(scenario._id);
            }
                          }}
                          disabled={isDeleting}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {analysisResult ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>
                      Harmful effects analysis for {selectedStage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Stage Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Project:</span>
                            <span className="font-medium">{project?.ProjectName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stage:</span>
                            <span className="font-medium">{analysisResult.StageName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Metal Type:</span>
                            <span className="font-medium">{project?.MetalType}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Severity Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Very High:</span>
                            <Badge className="bg-red-500 text-white">
                              {Object.values(analysisResult.ThresholdResults).filter(s => s === "Very High").length}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">High:</span>
                            <Badge className="bg-orange-500 text-white">
                              {Object.values(analysisResult.ThresholdResults).filter(s => s === "High").length}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Medium:</span>
                            <Badge className="bg-yellow-500 text-white">
                              {Object.values(analysisResult.ThresholdResults).filter(s => s === "Medium").length}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Threshold Analysis</h3>
                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                        {renderThresholdResults(analysisResult.ThresholdResults)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {analysisResult.GeminiAnalysis && analysisResult.GeminiAnalysis.length > 0 ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                      <h2 className="text-xl font-bold">AI-Powered Analysis</h2>
                    </div>
                    {renderGeminiAnalysis(analysisResult.GeminiAnalysis)}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Concerning Values Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <p className="text-gray-600">
                          No fields exceeded threshold values in the {selectedStage} stage. 
                          All parameters are within acceptable ranges.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Run Analysis</CardTitle>
                  <CardDescription>
                    Select a stage and click "Analyze Stage" to identify potential harmful effects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Eye className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Analysis Results Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Select a metallurgy stage and run the analysis to identify potential harmful effects 
                      and receive professional recommendations.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="border rounded-lg p-4 text-center">
                        <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                        <h4 className="font-semibold">Harmful Effects</h4>
                        <p className="text-sm text-gray-600 mt-1">Identify environmental and operational risks</p>
                      </div>
                      <div className="border rounded-lg p-4 text-center">
                        <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h4 className="font-semibold">Remedies</h4>
                        <p className="text-sm text-gray-600 mt-1">Get actionable solutions with technical details</p>
                      </div>
                      <div className="border rounded-lg p-4 text-center">
                        <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h4 className="font-semibold">Benefits</h4>
                        <p className="text-sm text-gray-600 mt-1">Understand the impact of implementing solutions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </ProjectLayout>
  );
}