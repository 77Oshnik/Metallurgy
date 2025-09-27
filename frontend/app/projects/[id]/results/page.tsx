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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Recycle,
  Zap,
  Droplets,
  TreePine,
  BarChart3,
  Sun,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import CircularComparison from "@/components/CircularComparison";

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
  const [showComparison, setShowComparison] = useState(false);

  const stageEndpoints = [
    { name: "Mining", endpoint: "mining" },
    { name: "Concentration", endpoint: "concentration" },
    { name: "Smelting", endpoint: "smelting" },
    { name: "Fabrication", endpoint: "fabrication" },
    { name: "Use Phase", endpoint: "use-phase" },
    { name: "End-of-Life", endpoint: "end-of-life" },
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
              predictionSummary: data.predictionSummary,
            });
          }
        } catch (error) {
          console.log(`No data found for ${stage.name} stage`);
        }
      }

      setResults(stageResults);
    } catch (error) {
      console.error("Error fetching results:", error);
      toast({
        title: "Error",
        description: "Failed to load project results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalImpacts = () => {
    let totalCarbon = 0;
    let totalEnergy = 0;
    let totalWater = 0;

    results.forEach((result) => {
      const outputs = result.outputs;

      // Sum carbon footprints
      Object.keys(outputs).forEach((key) => {
        if (
          key.includes("CarbonFootprint") &&
          typeof outputs[key] === "number"
        ) {
          totalCarbon += outputs[key];
        }
        if (
          key.includes("EnergyFootprint") &&
          typeof outputs[key] === "number"
        ) {
          totalEnergy += outputs[key];
        }
        if (
          key.includes("WaterFootprint") &&
          typeof outputs[key] === "number"
        ) {
          totalWater += outputs[key];
        }
      });
    });

    return { totalCarbon, totalEnergy, totalWater };
  };

  const getCircularityIndicators = () => {
    const indicators: any = {};

    results.forEach((result) => {
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
        indicators.endOfLifeRecyclingRate =
          outputs.EndOfLifeRecyclingRatePercent;
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

  // Helper to render complex output values (numbers, objects, arrays) in a readable way
  const renderOutputValue = (value: any) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "number") return value.toFixed(3);
    if (typeof value === "string") return value;

    if (Array.isArray(value)) {
      // Array of primitives or objects
      return (
        <ul className="list-disc list-inside text-sm">
          {value.map((item, idx) => (
            <li key={idx} className="py-1">
              {typeof item === "object" ? (
                <div className="text-sm">
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{typeof v === 'number' ? v.toFixed(3) : String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                String(item)
              )}
            </li>
          ))}
        </ul>
      );
    }

    // Plain object -> render inner key/value pairs
    if (typeof value === "object") {
      return (
        <div className="space-y-1 text-sm">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-muted-foreground">{k.replace(/([A-Z])/g, ' $1')}</span>
              <span>{typeof v === 'number' ? v.toFixed(3) : String(v)}</span>
            </div>
          ))}
        </div>
      );
    }

    return String(value);
  };

  const exportResults = () => {
    const exportData = {
      project,
      results,
      totalImpacts: calculateTotalImpacts(),
      circularityIndicators: getCircularityIndicators(),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.ProjectName || "project"}_lca_results.json`;
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
                <h1 className="text-2xl font-bold text-gray-900">
                  LCA Results
                </h1>
                <p className="text-sm text-gray-500">
                  {project?.ProjectName} • {project?.MetalType} •{" "}
                  {project?.ProcessingMode}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards with Enhanced Visuals */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Carbon Footprint
              </CardTitle>
              <TreePine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {totalImpacts.totalCarbon.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                kg CO₂-eq per functional unit
              </p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(
                      (totalImpacts.totalCarbon / 1000) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Energy Footprint
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {totalImpacts.totalEnergy.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                MJ per functional unit
              </p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(
                      (totalImpacts.totalEnergy / 5000) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Water Footprint
              </CardTitle>
              <Droplets className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {totalImpacts.totalWater.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                m³ per functional unit
              </p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(
                      (totalImpacts.totalWater / 100) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stages Completed
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                {results.length}
              </div>
              <p className="text-xs text-muted-foreground">
                out of {project?.ProcessingMode === "Circular" ? 6 : 5} stages
              </p>
              <div className="mt-3 flex justify-center">
                <div className="relative w-12 h-12">
                  <svg
                    className="w-12 h-12 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-600"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${
                        (results.length /
                          (project?.ProcessingMode === "Circular" ? 6 : 5)) *
                        100
                      }, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-purple-600">
                      {Math.round(
                        (results.length /
                          (project?.ProcessingMode === "Circular" ? 6 : 5)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart - Environmental Impact by Stage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Environmental Impact by Stage
              </CardTitle>
              <CardDescription>
                Carbon footprint comparison across lifecycle stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <svg viewBox="0 0 400 300" className="w-full h-full">
                  {/* Chart Background */}
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                      <stop
                        offset="100%"
                        stopColor="#1E40AF"
                        stopOpacity="0.9"
                      />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="60"
                      y1={50 + i * 50}
                      x2="380"
                      y2={50 + i * 50}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Y-axis */}
                  <line
                    x1="60"
                    y1="50"
                    x2="60"
                    y2="250"
                    stroke="#374151"
                    strokeWidth="2"
                  />

                  {/* X-axis */}
                  <line
                    x1="60"
                    y1="250"
                    x2="380"
                    y2="250"
                    stroke="#374151"
                    strokeWidth="2"
                  />

                  {/* Bars */}
                  {results.map((result, index) => {
                    const carbonValue =
                      (Object.entries(result.outputs).find(([key]) =>
                        key.includes("CarbonFootprint")
                      )?.[1] as number) || 0;
                    const maxCarbon = Math.max(
                      ...results.map(
                        (r) =>
                          (Object.entries(r.outputs).find(([key]) =>
                            key.includes("CarbonFootprint")
                          )?.[1] as number) || 0
                      )
                    );
                    const barHeight =
                      maxCarbon > 0 ? (carbonValue / maxCarbon) * 180 : 0;
                    const barWidth = 40;
                    const barX = 80 + index * 50;
                    const barY = 250 - barHeight;

                    return (
                      <g key={result.stageName}>
                        {/* Bar */}
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          fill="url(#barGradient)"
                          className="transition-all duration-1000 ease-out hover:opacity-80"
                        />

                        {/* Value Label */}
                        <text
                          x={barX + barWidth / 2}
                          y={barY - 5}
                          textAnchor="middle"
                          className="text-xs fill-gray-700 font-medium"
                        >
                          {carbonValue.toFixed(1)}
                        </text>

                        {/* Stage Label */}
                        <text
                          x={barX + barWidth / 2}
                          y={270}
                          textAnchor="middle"
                          className="text-xs fill-gray-600"
                          transform={`rotate(-45, ${barX + barWidth / 2}, 270)`}
                        >
                          {result.stageName}
                        </text>
                      </g>
                    );
                  })}

                  {/* Y-axis Label */}
                  <text
                    x="25"
                    y="150"
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                    transform="rotate(-90, 25, 150)"
                  >
                    Carbon Footprint (kg CO₂-eq)
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart - Impact Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TreePine className="h-5 w-5 mr-2 text-green-600" />
                Impact Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of environmental impacts by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <svg viewBox="0 0 300 300" className="w-full h-full max-w-xs">
                  {(() => {
                    const total =
                      totalImpacts.totalCarbon +
                      totalImpacts.totalEnergy / 100 +
                      totalImpacts.totalWater * 10;
                    const carbonPercent =
                      (totalImpacts.totalCarbon / total) * 100;
                    const energyPercent =
                      (totalImpacts.totalEnergy / 100 / total) * 100;
                    const waterPercent =
                      ((totalImpacts.totalWater * 10) / total) * 100;

                    let cumulativePercent = 0;
                    const radius = 80;
                    const centerX = 150;
                    const centerY = 150;

                    const createArc = (
                      startAngle: number,
                      endAngle: number
                    ) => {
                      const start = polarToCartesian(
                        centerX,
                        centerY,
                        radius,
                        endAngle
                      );
                      const end = polarToCartesian(
                        centerX,
                        centerY,
                        radius,
                        startAngle
                      );
                      const largeArcFlag =
                        endAngle - startAngle <= 180 ? "0" : "1";
                      return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
                    };

                    function polarToCartesian(
                      centerX: number,
                      centerY: number,
                      radius: number,
                      angleInDegrees: number
                    ) {
                      const angleInRadians =
                        ((angleInDegrees - 90) * Math.PI) / 180.0;
                      return {
                        x: centerX + radius * Math.cos(angleInRadians),
                        y: centerY + radius * Math.sin(angleInRadians),
                      };
                    }

                    const segments = [
                      {
                        percent: carbonPercent,
                        color: "#10B981",
                        label: "Carbon",
                      },
                      {
                        percent: energyPercent,
                        color: "#F59E0B",
                        label: "Energy",
                      },
                      {
                        percent: waterPercent,
                        color: "#3B82F6",
                        label: "Water",
                      },
                    ];

                    return (
                      <>
                        {segments.map((segment, index) => {
                          const startAngle = cumulativePercent * 3.6;
                          const endAngle =
                            (cumulativePercent + segment.percent) * 3.6;
                          cumulativePercent += segment.percent;

                          return (
                            <path
                              key={index}
                              d={createArc(startAngle, endAngle)}
                              fill={segment.color}
                              className="transition-all duration-300 hover:opacity-80"
                            />
                          );
                        })}

                        {/* Center Circle */}
                        <circle
                          cx={centerX}
                          cy={centerY}
                          r="30"
                          fill="white"
                          stroke="#E5E7EB"
                          strokeWidth="2"
                        />
                        <text
                          x={centerX}
                          y={centerY - 5}
                          textAnchor="middle"
                          className="text-sm font-bold fill-gray-700"
                        >
                          Total
                        </text>
                        <text
                          x={centerX}
                          y={centerY + 10}
                          textAnchor="middle"
                          className="text-xs fill-gray-500"
                        >
                          Impact
                        </text>

                        {/* Legend */}
                        {segments.map((segment, index) => (
                          <g key={`legend-${index}`}>
                            <rect
                              x={20}
                              y={20 + index * 25}
                              width={15}
                              height={15}
                              fill={segment.color}
                            />
                            <text
                              x={40}
                              y={32 + index * 25}
                              className="text-xs fill-gray-700"
                            >
                              {segment.label}: {segment.percent.toFixed(1)}%
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Chart - Cumulative Impact Trend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-purple-600" />
              Cumulative Environmental Impact Trend
            </CardTitle>
            <CardDescription>
              Progressive accumulation of environmental impacts across lifecycle
              stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <svg viewBox="0 0 600 300" className="w-full h-full">
                {/* Grid Lines */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line
                    key={`h-${i}`}
                    x1="80"
                    y1={50 + i * 40}
                    x2="550"
                    y2={50 + i * 40}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                ))}
                {results.map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={100 + i * 80}
                    y1="50"
                    x2={100 + i * 80}
                    y2="250"
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                ))}

                {/* Axes */}
                <line
                  x1="80"
                  y1="50"
                  x2="80"
                  y2="250"
                  stroke="#374151"
                  strokeWidth="2"
                />
                <line
                  x1="80"
                  y1="250"
                  x2="550"
                  y2="250"
                  stroke="#374151"
                  strokeWidth="2"
                />

                {(() => {
                  let cumulativeCarbon = 0;
                  let cumulativeEnergy = 0;
                  let cumulativeWater = 0;

                  const carbonPoints: string[] = [];
                  const energyPoints: string[] = [];
                  const waterPoints: string[] = [];

                  results.forEach((result, index) => {
                    const carbonValue =
                      (Object.entries(result.outputs).find(([key]) =>
                        key.includes("CarbonFootprint")
                      )?.[1] as number) || 0;
                    const energyValue =
                      (Object.entries(result.outputs).find(([key]) =>
                        key.includes("EnergyFootprint")
                      )?.[1] as number) || 0;
                    const waterValue =
                      (Object.entries(result.outputs).find(([key]) =>
                        key.includes("WaterFootprint")
                      )?.[1] as number) || 0;

                    cumulativeCarbon += carbonValue;
                    cumulativeEnergy += energyValue;
                    cumulativeWater += waterValue;

                    const x = 100 + index * 80;
                    const maxTotal =
                      totalImpacts.totalCarbon +
                      totalImpacts.totalEnergy +
                      totalImpacts.totalWater;

                    const carbonY =
                      250 - (cumulativeCarbon / totalImpacts.totalCarbon) * 180;
                    const energyY =
                      250 - (cumulativeEnergy / totalImpacts.totalEnergy) * 180;
                    const waterY =
                      250 - (cumulativeWater / totalImpacts.totalWater) * 180;

                    carbonPoints.push(`${x},${carbonY}`);
                    energyPoints.push(`${x},${energyY}`);
                    waterPoints.push(`${x},${waterY}`);
                  });

                  return (
                    <>
                      {/* Carbon Line */}
                      <polyline
                        points={carbonPoints.join(" ")}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        className="transition-all duration-1000 ease-out"
                      />

                      {/* Energy Line */}
                      <polyline
                        points={energyPoints.join(" ")}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="3"
                        className="transition-all duration-1000 ease-out"
                      />

                      {/* Water Line */}
                      <polyline
                        points={waterPoints.join(" ")}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        className="transition-all duration-1000 ease-out"
                      />

                      {/* Data Points */}
                      {results.map((result, index) => {
                        const x = 100 + index * 80;
                        let cumulativeCarbon = 0;
                        let cumulativeEnergy = 0;
                        let cumulativeWater = 0;

                        for (let i = 0; i <= index; i++) {
                          const carbonValue =
                            (Object.entries(results[i].outputs).find(([key]) =>
                              key.includes("CarbonFootprint")
                            )?.[1] as number) || 0;
                          const energyValue =
                            (Object.entries(results[i].outputs).find(([key]) =>
                              key.includes("EnergyFootprint")
                            )?.[1] as number) || 0;
                          const waterValue =
                            (Object.entries(results[i].outputs).find(([key]) =>
                              key.includes("WaterFootprint")
                            )?.[1] as number) || 0;

                          cumulativeCarbon += carbonValue;
                          cumulativeEnergy += energyValue;
                          cumulativeWater += waterValue;
                        }

                        const carbonY =
                          250 -
                          (cumulativeCarbon / totalImpacts.totalCarbon) * 180;
                        const energyY =
                          250 -
                          (cumulativeEnergy / totalImpacts.totalEnergy) * 180;
                        const waterY =
                          250 -
                          (cumulativeWater / totalImpacts.totalWater) * 180;

                        return (
                          <g key={result.stageName}>
                            <circle
                              cx={x}
                              cy={carbonY}
                              r="4"
                              fill="#10B981"
                              className="hover:r-6 transition-all"
                            />
                            <circle
                              cx={x}
                              cy={energyY}
                              r="4"
                              fill="#F59E0B"
                              className="hover:r-6 transition-all"
                            />
                            <circle
                              cx={x}
                              cy={waterY}
                              r="4"
                              fill="#3B82F6"
                              className="hover:r-6 transition-all"
                            />

                            {/* Stage Label */}
                            <text
                              x={x}
                              y={270}
                              textAnchor="middle"
                              className="text-xs fill-gray-600"
                              transform={`rotate(-45, ${x}, 270)`}
                            >
                              {result.stageName}
                            </text>
                          </g>
                        );
                      })}

                      {/* Legend */}
                      <g>
                        <rect
                          x={400}
                          y={60}
                          width={15}
                          height={3}
                          fill="#10B981"
                        />
                        <text x={420} y={67} className="text-xs fill-gray-700">
                          Carbon (kg CO₂-eq)
                        </text>

                        <rect
                          x={400}
                          y={80}
                          width={15}
                          height={3}
                          fill="#F59E0B"
                        />
                        <text x={420} y={87} className="text-xs fill-gray-700">
                          Energy (MJ)
                        </text>

                        <rect
                          x={400}
                          y={100}
                          width={15}
                          height={3}
                          fill="#3B82F6"
                        />
                        <text x={420} y={107} className="text-xs fill-gray-700">
                          Water (m³)
                        </text>
                      </g>

                      {/* Y-axis Label */}
                      <text
                        x="25"
                        y="150"
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                        transform="rotate(-90, 25, 150)"
                      >
                        Cumulative Impact (Normalized)
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Circularity Indicators with Radar Chart */}
        {Object.keys(circularityIndicators).length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Circularity Metrics Cards */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Recycle className="h-5 w-5 mr-2 text-green-600" />
                    Circularity Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Individual performance indicators with visual progress
                    tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {circularityIndicators.recycledContent !== undefined && (
                      <div className="relative p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 rounded-full -mr-8 -mt-8 opacity-30"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mx-auto mb-4">
                            <Recycle className="h-8 w-8 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-700 mb-2">
                              {circularityIndicators.recycledContent.toFixed(1)}
                              %
                            </div>
                            <div className="text-sm font-medium text-green-600 mb-3">
                              Recycled Content
                            </div>
                            <div className="flex justify-center">
                              <div className="relative w-20 h-20">
                                <svg
                                  className="w-20 h-20 transform -rotate-90"
                                  viewBox="0 0 36 36"
                                >
                                  <path
                                    className="text-green-200"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className="text-green-500"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray={`${circularityIndicators.recycledContent}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {circularityIndicators.yieldEfficiency !== undefined && (
                      <div className="relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 rounded-full -mr-8 -mt-8 opacity-30"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4">
                            <Zap className="h-8 w-8 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-700 mb-2">
                              {circularityIndicators.yieldEfficiency.toFixed(1)}
                              %
                            </div>
                            <div className="text-sm font-medium text-blue-600 mb-3">
                              Yield Efficiency
                            </div>
                            <div className="flex justify-center">
                              <div className="relative w-20 h-20">
                                <svg
                                  className="w-20 h-20 transform -rotate-90"
                                  viewBox="0 0 36 36"
                                >
                                  <path
                                    className="text-blue-200"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className="text-blue-500"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray={`${circularityIndicators.yieldEfficiency}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {circularityIndicators.endOfLifeRecyclingRate !==
                      undefined && (
                      <div className="relative p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 rounded-full -mr-8 -mt-8 opacity-30"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4">
                            <BarChart3 className="h-8 w-8 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-700 mb-2">
                              {circularityIndicators.endOfLifeRecyclingRate.toFixed(
                                1
                              )}
                              %
                            </div>
                            <div className="text-sm font-medium text-purple-600 mb-3">
                              End-of-Life Recycling
                            </div>
                            <div className="flex justify-center">
                              <div className="relative w-20 h-20">
                                <svg
                                  className="w-20 h-20 transform -rotate-90"
                                  viewBox="0 0 36 36"
                                >
                                  <path
                                    className="text-purple-200"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className="text-purple-500"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray={`${circularityIndicators.endOfLifeRecyclingRate}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {circularityIndicators.scrapUtilization !== undefined && (
                      <div className="relative p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200 rounded-full -mr-8 -mt-8 opacity-30"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4">
                            <TreePine className="h-8 w-8 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-orange-700 mb-2">
                              {circularityIndicators.scrapUtilization.toFixed(
                                1
                              )}
                              %
                            </div>
                            <div className="text-sm font-medium text-orange-600 mb-3">
                              Scrap Utilization
                            </div>
                            <div className="flex justify-center">
                              <div className="relative w-20 h-20">
                                <svg
                                  className="w-20 h-20 transform -rotate-90"
                                  viewBox="0 0 36 36"
                                >
                                  <path
                                    className="text-orange-200"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className="text-orange-500"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray={`${circularityIndicators.scrapUtilization}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Radar Chart for Circularity Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                    Circularity Radar
                  </CardTitle>
                  <CardDescription>
                    Overall circularity performance visualization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <svg viewBox="0 0 300 300" className="w-full h-full">
                      {(() => {
                        const centerX = 150;
                        const centerY = 150;
                        const radius = 100;
                        const indicators = [
                          {
                            name: "Recycled",
                            value: circularityIndicators.recycledContent || 0,
                            color: "#10B981",
                          },
                          {
                            name: "Yield",
                            value: circularityIndicators.yieldEfficiency || 0,
                            color: "#3B82F6",
                          },
                          {
                            name: "EoL Recycling",
                            value:
                              circularityIndicators.endOfLifeRecyclingRate || 0,
                            color: "#8B5CF6",
                          },
                          {
                            name: "Scrap Use",
                            value: circularityIndicators.scrapUtilization || 0,
                            color: "#F59E0B",
                          },
                          {
                            name: "Reuse",
                            value:
                              circularityIndicators.reuseFactorPercent || 0,
                            color: "#06B6D4",
                          },
                        ].filter((indicator) => indicator.value > 0);

                        const angleStep = (2 * Math.PI) / indicators.length;

                        return (
                          <>
                            {/* Background circles */}
                            {[20, 40, 60, 80, 100].map((r) => (
                              <circle
                                key={r}
                                cx={centerX}
                                cy={centerY}
                                r={r}
                                fill="none"
                                stroke="#E5E7EB"
                                strokeWidth="1"
                              />
                            ))}

                            {/* Axis lines */}
                            {indicators.map((_, index) => {
                              const angle = index * angleStep - Math.PI / 2;
                              const x = centerX + radius * Math.cos(angle);
                              const y = centerY + radius * Math.sin(angle);

                              return (
                                <line
                                  key={index}
                                  x1={centerX}
                                  y1={centerY}
                                  x2={x}
                                  y2={y}
                                  stroke="#E5E7EB"
                                  strokeWidth="1"
                                />
                              );
                            })}

                            {/* Data polygon */}
                            <polygon
                              points={indicators
                                .map((indicator, index) => {
                                  const angle = index * angleStep - Math.PI / 2;
                                  const r = (indicator.value / 100) * radius;
                                  const x = centerX + r * Math.cos(angle);
                                  const y = centerY + r * Math.sin(angle);
                                  return `${x},${y}`;
                                })
                                .join(" ")}
                              fill="rgba(59, 130, 246, 0.2)"
                              stroke="#3B82F6"
                              strokeWidth="2"
                            />

                            {/* Data points */}
                            {indicators.map((indicator, index) => {
                              const angle = index * angleStep - Math.PI / 2;
                              const r = (indicator.value / 100) * radius;
                              const x = centerX + r * Math.cos(angle);
                              const y = centerY + r * Math.sin(angle);

                              // Label position
                              const labelR = radius + 20;
                              const labelX = centerX + labelR * Math.cos(angle);
                              const labelY = centerY + labelR * Math.sin(angle);

                              return (
                                <g key={index}>
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill={indicator.color}
                                    className="transition-all duration-300 hover:r-6"
                                  />
                                  <text
                                    x={labelX}
                                    y={labelY}
                                    textAnchor="middle"
                                    className="text-xs fill-gray-700 font-medium"
                                  >
                                    {indicator.name}
                                  </text>
                                  <text
                                    x={labelX}
                                    y={labelY + 12}
                                    textAnchor="middle"
                                    className="text-xs fill-gray-500"
                                  >
                                    {indicator.value.toFixed(1)}%
                                  </text>
                                </g>
                              );
                            })}

                            {/* Center point */}
                            <circle
                              cx={centerX}
                              cy={centerY}
                              r="3"
                              fill="#374151"
                            />
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Overall Score */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white text-center">
                    <div className="text-2xl font-bold mb-1">
                      {Object.values(circularityIndicators).length > 0
                        ? (
                            Object.values(circularityIndicators)
                              .map((v) => Number(v))
                              .reduce((a, b) => a + b, 0) /
                            Object.values(circularityIndicators).length
                          ).toFixed(1)
                        : "0.0"}
                      %
                    <div className="text-sm opacity-90">
                      Overall Circularity Score
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
            <Tabs
              defaultValue={
                results[0]?.stageName.toLowerCase().replace(/[^a-z0-9]/g, "") ||
                "mining"
              }
            >
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {results.map((result) => (
                  <TabsTrigger
                    key={result.stageName}
                    value={result.stageName
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, "")}
                    className="text-xs"
                  >
                    {result.stageName}
                  </TabsTrigger>
                ))}
              </TabsList>

              {results.map((result) => (
                <TabsContent
                  key={result.stageName}
                  value={result.stageName
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "")}
                  className="space-y-4"
                >
                  {/* AI Prediction Summary */}
                  {result.predictionSummary &&
                    result.predictionSummary.aiPredictedFields > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          AI Prediction Summary
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-blue-700">Total Fields:</span>
                            <span className="ml-2 font-medium">
                              {result.predictionSummary.totalFields}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700">
                              User Provided:
                            </span>
                            <span className="ml-2 font-medium">
                              {result.predictionSummary.userProvidedFields}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700">AI Predicted:</span>
                            <span className="ml-2 font-medium">
                              {result.predictionSummary.aiPredictedFields}
                            </span>
                          </div>
                        </div>
                        {result.predictionSummary.predictedFieldNames.length >
                          0 && (
                          <div className="mt-2">
                            <span className="text-blue-700 text-sm">
                              Predicted Fields:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.predictionSummary.predictedFieldNames.map(
                                (field: string) => (
                                  <Badge
                                    key={field}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {field}
                                  </Badge>
                                )
                              )}
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
                          <div key={key} className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-gray-600 mb-1 md:mb-0 md:flex-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                            <div className="font-medium text-right w-full md:w-1/2">
                              {renderOutputValue(value)}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Input Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.data.Inputs &&
                          Object.entries(result.data.Inputs).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between items-center"
                              >
                                <span className="text-sm text-gray-600 flex-1">
                                  {key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </span>
                                <div className="text-right">
                                  <span className="font-medium">
                                    {typeof value === "number"
                                      ? value.toFixed(3)
                                      : String(value)}
                                  </span>
                                  {result.data.FieldSources &&
                                    result.data.FieldSources[key] && (
                                      <Badge
                                        variant={
                                          result.data.FieldSources[key] ===
                                          "user"
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="ml-2 text-xs"
                                      >
                                        {result.data.FieldSources[key]}
                                      </Badge>
                                    )}
                                </div>
                              </div>
                            )
                          )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Renewable and Sustainability Pathways Section */}
        <div className="mt-12">
          {/* Enhanced Banner with Animations */}
          <div className="relative py-16 mb-12 overflow-hidden">
            {/* Custom CSS for animations */}
            <style jsx>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
              }
              @keyframes fade-in {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              @keyframes slide-up {
                0% { opacity: 0; transform: translateY(30px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .animate-float {
                animation: float 3s ease-in-out infinite;
              }
              .animate-fade-in {
                animation: fade-in 0.8s ease-out forwards;
                opacity: 0;
              }
              .animate-slide-up {
                animation: slide-up 1s ease-out forwards;
                opacity: 0;
              }
            `}</style>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
              <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-200 to-transparent rounded-full opacity-20 animate-pulse -translate-x-48 -translate-y-48"></div>
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-200 to-transparent rounded-full opacity-30 animate-bounce translate-x-40 -translate-y-40" style={{animationDuration: '3s'}}></div>
              <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-gradient-to-t from-yellow-200 to-transparent rounded-full opacity-25 animate-pulse -translate-x-36 translate-y-36" style={{animationDelay: '1s'}}></div>
            </div>
            
            {/* Floating Icons */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-16 animate-float">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg opacity-80">
                  <Recycle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="absolute top-16 right-20 animate-float" style={{animationDelay: '0.5s'}}>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg opacity-80">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="absolute bottom-12 left-24 animate-float" style={{animationDelay: '1s'}}>
                <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg opacity-80">
                  <Sun className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="absolute bottom-8 right-16 animate-float" style={{animationDelay: '1.5s'}}>
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg opacity-80">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-4">
              {/* Icon Row with Animation */}
              <div className="flex justify-center items-center space-x-6 mb-8">
                <div className="transform hover:scale-110 transition-all duration-300 animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <TreePine className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="transform hover:scale-110 transition-all duration-300 animate-fade-in" style={{animationDelay: '0.4s'}}>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Recycle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="transform hover:scale-110 transition-all duration-300 animate-fade-in" style={{animationDelay: '0.6s'}}>
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <Sun className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Animated Title */}
              <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
                <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent mb-6 leading-tight">
                  Renewable & Sustainability
                  <br />
                  <span className="text-3xl md:text-4xl">Pathways</span>
                </h2>
              </div>

              {/* Animated Subtitle */}
              <div className="animate-slide-up" style={{animationDelay: '0.5s'}}>
                <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium mb-8">
                  Unlock the future of sustainable metallurgy with AI-powered insights, 
                  <br className="hidden md:block" />
                  environmental impact analysis, and renewable energy transition planning.
                </p>
              </div>

              {/* Animated Call-to-Action */}
              <div className="animate-fade-in" style={{animationDelay: '0.7s'}}>
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Zap className="h-5 w-5 mr-2 animate-pulse" />
                  Explore Advanced Features Below
                  <div className="ml-3 animate-bounce">
                    ↓
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Wave Decoration */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1200 120" className="w-full h-12 text-white opacity-80">
                <path d="M0,60 Q300,0 600,60 T1200,60 L1200,120 L0,120 Z" fill="currentColor" />
              </svg>
            </div>
          </div>

          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Show Comparison Feature */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-center text-gray-900">
                  Circular Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 text-center">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Compare linear vs circular economy approaches for your metallurgical processes. 
                  Visualize environmental benefits and cost savings through circular design principles.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Interactive comparison charts
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Environmental impact analysis
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Circularity performance metrics
                  </div>
                </div>
                <Button
                  onClick={() => setShowComparison((s) => !s)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg"
                >
                  {showComparison ? "Hide Comparison" : "Show Comparison"}
                  <BarChart3 className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Harmful Effects Analyzer Feature */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-center text-gray-900">
                  Harmful Effects Analyzer
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 text-center">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Analyze potential environmental and health impacts of your metallurgical processes. 
                  Identify risk factors and develop mitigation strategies for sustainable operations.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Environmental risk assessment
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Health impact evaluation
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Mitigation recommendations
                  </div>
                </div>
                <Link href={`/projects/${projectId}/harmful-effects-analyzer`} className="block">
                  <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg">
                    Analyze Harmful Effects
                    <AlertTriangle className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Energy Transition Feature */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-yellow-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Sun className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-center text-gray-900">
                  Energy Transition
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 text-center">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Explore renewable energy integration and sustainable energy scenarios for your 
                  metallurgical operations. Plan your transition to clean energy sources.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    Renewable energy scenarios
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    Carbon footprint reduction
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    Energy transition planning
                  </div>
                </div>
                <Link href={`/projects/${projectId}/renewable`} className="block">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg">
                    Explore Energy Transition
                    <Sun className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

              {/* Render CircularComparison when toggled - Below Banner */}
          {showComparison && (
            <div className="mt-12 mb-12 max-w-4xl mx-auto">
              <CircularComparison ProjectIdentifier={projectId} />
            </div>
          )}

          {/* Additional Information Section */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="py-8">
                <div className="flex items-center justify-center mb-4">
                  <TreePine className="h-8 w-8 text-green-600 mr-3" />
                  <Recycle className="h-8 w-8 text-blue-600 mr-3" />
                  <Sun className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Towards Sustainable Metallurgy
                </h3>
                <p className="text-gray-700 max-w-4xl mx-auto leading-relaxed">
                  These advanced sustainability features help you make informed decisions about environmental 
                  impact reduction, circular economy implementation, and renewable energy adoption. 
                  Use these tools to optimize your processes, reduce environmental footprint, and 
                  transition towards more sustainable metallurgical operations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
