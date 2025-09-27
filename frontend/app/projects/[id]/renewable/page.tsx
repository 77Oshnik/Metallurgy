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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Zap,
  Sun,
  Wind,
  Waves,
  Mountain,
  Sprout,
  BarChart3,
  Trash2,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import ProjectLayout from "@/components/ProjectLayout";
import { createEnergyTransitionScenario, getEnergyTransitionScenarios, deleteEnergyTransitionScenario } from "@/lib/energyTransitionService";

interface Project {
  _id: string;
  ProjectName: string;
  FunctionalUnitMassTonnes: number;
  MetalType: string;
  ProcessingMode: string;
}

interface EnergyTransitionScenario {
  _id?: string;
  StageName: string;
  BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit: number;
  ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit: number;
  CarbonReductionPercent: number;
  UserScenario: {
    RenewableSharePercent: number;
    FossilSharePercent: number;
    EnergySourceMix: {
      grid: number;
      solar: number;
      wind: number;
      hydro: number;
      geothermal: number;
      biomass: number;
    };
  };
  AIInsights?: AIInsight[];
  CreatedAtUtc?: string;
}

interface AIInsight {
  title: string;
  description: string;
  category: 'environmental' | 'economic' | 'technical' | 'regulatory' | 'social';
  impact: string;
  confidence: 'high' | 'medium' | 'low';
}

export default function RenewableTransitionPage() {
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
  const [renewableShare, setRenewableShare] = useState<number>(50);
  const [energyMix, setEnergyMix] = useState({
    solar: 40,
    wind: 30,
    hydro: 20,
    geothermal: 5,
    biomass: 5,
  });

  // Default energy source mix for display
  const defaultEnergySourceMix = {
    grid: 0,
    solar: 0,
    wind: 0,
    hydro: 0,
    geothermal: 0,
    biomass: 0,
  };

  const [scenarioResult, setScenarioResult] = useState<EnergyTransitionScenario | null>(null);
  const [previousScenarios, setPreviousScenarios] = useState<EnergyTransitionScenario[]>([]);

  useEffect(() => {
    fetchProject();
    fetchPreviousScenarios();
  }, [projectId]);

  // Reset results and energy mix when stage changes
  useEffect(() => {
    setScenarioResult(null);
    // Reset energy mix to default values
    setEnergyMix({
      solar: 40,
      wind: 30,
      hydro: 20,
      geothermal: 5,
      biomass: 5,
    });
    setRenewableShare(50);
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
      const scenarios = await getEnergyTransitionScenarios(projectId);
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
    try {
      await deleteEnergyTransitionScenario(projectId, scenarioId);
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
    }
  };

  const handleEnergyMixChange = (source: string, value: number) => {
    const totalOthers = Object.entries(energyMix)
      .filter(([key]) => key !== source)
      .reduce((sum, [, val]) => sum + val, 0);
    
    if (totalOthers === 0) return;
    
    const newValue = Math.min(value, 100);
    const remaining = 100 - newValue;
    const ratio = remaining / totalOthers;
    
    setEnergyMix(prev => {
      const updated = { ...prev };
      updated[source as keyof typeof energyMix] = newValue;
      
      Object.keys(updated).forEach(key => {
        if (key !== source) {
          updated[key as keyof typeof energyMix] = Math.round(
            (prev[key as keyof typeof energyMix] * ratio)
          );
        }
      });
      
      // Adjust for rounding errors
      const total = Object.values(updated).reduce((sum, val) => sum + val, 0);
      if (total !== 100) {
        const diff = 100 - total;
        const firstKey = Object.keys(updated)[0] as keyof typeof updated;
        updated[firstKey] = Math.max(0, updated[firstKey] + diff);
      }
      
      return updated;
    });
  };

  const runSimulation = async () => {
    try {
      const result = await createEnergyTransitionScenario(
        projectId,
        selectedStage,
        renewableShare,
        {
          grid: 100 - renewableShare,
          ...energyMix,
        }
      );
      
      setScenarioResult(result);
      fetchPreviousScenarios(); // Refresh the list
      toast({
        title: "Success",
        description: "Energy transition simulation completed successfully",
      });
    } catch (error: any) {
      console.error("Error running simulation:", error);
      let errorMessage = error.message || "Failed to run simulation";
      
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Feature Banner */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-900">Renewable Energy Transition</h1>
              <p className="text-sm text-green-700">
                Simulate renewable energy adoption and analyze environmental impact reduction
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
                <CardTitle>Energy Transition Simulation</CardTitle>
                <CardDescription>
                  Configure your renewable energy scenario
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

                <div>
                  <Label className="flex items-center justify-between">
                    <span>Renewable Energy Share: {renewableShare}%</span>
                    <span>Fossil Energy Share: {100 - renewableShare}%</span>
                  </Label>
                  <Slider
                    value={[renewableShare]}
                    onValueChange={([value]) => setRenewableShare(value)}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Renewable Energy Mix</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 text-yellow-500 mr-2" />
                        <span>Solar</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[energyMix.solar]}
                          onValueChange={([value]) => handleEnergyMixChange("solar", value)}
                          max={100}
                          step={1}
                          className="w-32"
                        />
                        <span className="w-10 text-right">{energyMix.solar}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wind className="h-4 w-4 text-blue-500 mr-2" />
                        <span>Wind</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[energyMix.wind]}
                          onValueChange={([value]) => handleEnergyMixChange("wind", value)}
                          max={100}
                          step={1}
                          className="w-32"
                        />
                        <span className="w-10 text-right">{energyMix.wind}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Waves className="h-4 w-4 text-cyan-500 mr-2" />
                        <span>Hydro</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[energyMix.hydro]}
                          onValueChange={([value]) => handleEnergyMixChange("hydro", value)}
                          max={100}
                          step={1}
                          className="w-32"
                        />
                        <span className="w-10 text-right">{energyMix.hydro}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mountain className="h-4 w-4 text-orange-500 mr-2" />
                        <span>Geothermal</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[energyMix.geothermal]}
                          onValueChange={([value]) => handleEnergyMixChange("geothermal", value)}
                          max={100}
                          step={1}
                          className="w-32"
                        />
                        <span className="w-10 text-right">{energyMix.geothermal}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Sprout className="h-4 w-4 text-green-500 mr-2" />
                        <span>Biomass</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[energyMix.biomass]}
                          onValueChange={([value]) => handleEnergyMixChange("biomass", value)}
                          max={100}
                          step={1}
                          className="w-32"
                        />
                        <span className="w-10 text-right">{energyMix.biomass}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={runSimulation} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Run Simulation
                </Button>
              </CardContent>
            </Card>

            {/* Previous Scenarios */}
            {previousScenarios.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Previous Scenarios</CardTitle>
                  <CardDescription>
                    Your saved energy transition simulations
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
                            setRenewableShare(scenario.UserScenario.RenewableSharePercent);
                            setEnergyMix({
                              solar: scenario.UserScenario.EnergySourceMix.solar,
                              wind: scenario.UserScenario.EnergySourceMix.wind,
                              hydro: scenario.UserScenario.EnergySourceMix.hydro,
                              geothermal: scenario.UserScenario.EnergySourceMix.geothermal,
                              biomass: scenario.UserScenario.EnergySourceMix.biomass,
                            });
                            setScenarioResult(scenario);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{scenario.StageName}</span>
                            <Badge variant="secondary">
                              {(scenario.CarbonReductionPercent || 0).toFixed(1)}% reduction
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {(scenario.UserScenario?.RenewableSharePercent || 0)}% renewable
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
            {scenarioResult ? (
              <Card>
                <CardHeader>
                  <CardTitle>Simulation Results</CardTitle>
                  <CardDescription>
                    Impact of transitioning to {renewableShare}% renewable energy in {selectedStage}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm">Baseline CO₂</p>
                            <p className="text-2xl font-bold">
                              {(scenarioResult.BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit || 0).toFixed(
                                1
                              )}
                            </p>
                            <p className="text-blue-100 text-xs">kg CO₂e / FU</p>
                          </div>
                          <Zap className="h-8 w-8 text-blue-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm">Scenario CO₂</p>
                            <p className="text-2xl font-bold">
                              {(scenarioResult.ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit || 0).toFixed(
                                1
                              )}
                            </p>
                            <p className="text-green-100 text-xs">kg CO₂e / FU</p>
                          </div>
                          <Sprout className="h-8 w-8 text-green-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm">Reduction</p>
                            <p className="text-2xl font-bold">
                              {(scenarioResult.CarbonReductionPercent || 0).toFixed(1)}%
                            </p>
                            <p className="text-purple-100 text-xs">CO₂ reduction</p>
                          </div>
                          <BarChart3 className="h-8 w-8 text-purple-200" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Energy Mix Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                          <span className="text-sm">Grid (Fossil)</span>
                        </div>
                        <p className="font-semibold mt-1">
                          {100 - (scenarioResult.UserScenario?.RenewableSharePercent || 0)}%
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                          <span className="text-sm">Solar</span>
                        </div>
                        <p className="font-semibold mt-1">
                          {(scenarioResult.UserScenario?.EnergySourceMix?.solar || 0)}%
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                          <span className="text-sm">Wind</span>
                        </div>
                        <p className="font-semibold mt-1">
                          {(scenarioResult.UserScenario?.EnergySourceMix?.wind || 0)}%
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-cyan-400 rounded-full mr-2"></div>
                          <span className="text-sm">Hydro</span>
                        </div>
                        <p className="font-semibold mt-1">
                          {(scenarioResult.UserScenario?.EnergySourceMix?.hydro || 0)}%
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                          <span className="text-sm">Geothermal</span>
                        </div>
                        <p className="font-semibold mt-1">
                          {(scenarioResult.UserScenario?.EnergySourceMix?.geothermal || 0)}%
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                          <span className="text-sm">Biomass</span>
                        </div>
                        <p className="font-semibold mt-1">
                          {(scenarioResult.UserScenario?.EnergySourceMix?.biomass || 0)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Key Insights</h4>
                    
                    {scenarioResult.AIInsights && scenarioResult.AIInsights.length > 0 ? (
                      <div className="space-y-4">
                        {scenarioResult.AIInsights.map((insight, index) => (
                          <div key={index} className="border-b border-blue-100 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between">
                              <h5 className="font-medium text-blue-900">{insight.title}</h5>
                              <Badge 
                                variant={insight.confidence === 'high' ? 'default' : insight.confidence === 'medium' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {insight.confidence}
                              </Badge>
                            </div>
                            <p className="text-blue-700 text-sm mt-1">{insight.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs capitalize"
                              >
                                {insight.category}
                              </Badge>
                              <span className="text-xs font-medium text-blue-600">{insight.impact}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="list-disc list-inside text-blue-700 space-y-1">
                        <li>
                          Transitioning to {renewableShare}% renewable energy in {selectedStage} reduces CO₂
                          emissions by {(scenarioResult.CarbonReductionPercent || 0).toFixed(1)}%
                        </li>
                        <li>
                          This translates to a reduction of{" "}
                          {(
                            (scenarioResult.BaselineCarbonFootprintKilogramsCO2ePerFunctionalUnit || 0) -
                            (scenarioResult.ScenarioCarbonFootprintKilogramsCO2ePerFunctionalUnit || 0)
                          ).toFixed(1)}{" "}
                          kg CO₂e per functional unit
                        </li>
                        <li>
                          Solar and wind contribute the most to emission reductions in this scenario
                        </li>
                        <li>
                          Increasing renewable energy share to {renewableShare}% can lead to significant long-term cost savings
                          through reduced energy expenses and potential government incentives
                        </li>
                        <li>
                          This transition supports your company's sustainability goals and enhances corporate responsibility profile
                        </li>
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Run a Simulation</CardTitle>
                  <CardDescription>
                    Configure your renewable energy scenario and click "Run Simulation" to see the
                    impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Zap className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Simulation Results Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Configure your energy transition scenario and run the simulation to see the
                      potential carbon footprint reduction.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
  );
}