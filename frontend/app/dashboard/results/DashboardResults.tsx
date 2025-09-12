'use client';

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingDown, 
  Zap, 
  Droplets, 
  Recycle, 
  AlertCircle, 
  CheckCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export default function DashboardResults() {
  // Sample data - in real app this would come from the form
  const summaryData = {
    emissions: 1847,
    energy: 2340,
    water: 450,
    circularityScore: 72,
    improvement: 34
  };

  const stageData = [
    { stage: "Extraction", emissions: 520, energy: 680, percentage: 28 },
    { stage: "Processing", emissions: 748, energy: 890, percentage: 41 },
    { stage: "Transport", emissions: 156, energy: 210, percentage: 8 },
    { stage: "Use Phase", emissions: 98, energy: 240, percentage: 5 },
    { stage: "End-of-Life", emissions: 325, energy: 320, percentage: 18 }
  ];

  const endOfLifeData = [
    { name: "Recycling", value: 75, color: "#10b981" },
    { name: "Landfill", value: 15, color: "#ef4444" },
    { name: "Energy Recovery", value: 10, color: "#f59e0b" }
  ];

  const insights = [
    {
      type: "success",
      icon: CheckCircle,
      title: "High Recycling Rate",
      description: "75% recycling rate exceeds industry average of 45%",
      impact: "+15% circularity score"
    },
    {
      type: "warning",
      icon: AlertCircle,
      title: "Energy Intensive Processing",
      description: "Processing stage accounts for 41% of total emissions",
      impact: "Consider renewable energy sources"
    },
    {
      type: "success",
      icon: TrendingDown,
      title: "Optimized Transport",
      description: "Transport emissions 30% below industry benchmark",
      impact: "-156 kg CO₂ vs average"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-heading font-bold mb-2">LCA Results</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of your metal production lifecycle assessment.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingDown className="h-8 w-8 text-primary" />
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  -34%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Emissions</p>
                <p className="text-2xl font-bold">{summaryData.emissions.toLocaleString()} kg CO₂</p>
                <p className="text-xs text-primary flex items-center gap-1">
                  <ArrowDown className="h-3 w-3" />
                  34% below linear model
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="h-8 w-8 text-secondary" />
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  Efficient
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Energy Consumption</p>
                <p className="text-2xl font-bold">{summaryData.energy.toLocaleString()} kWh</p>
                <p className="text-xs text-secondary">Per ton of material</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Droplets className="h-8 w-8 text-blue-500" />
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                  Low
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Water Usage</p>
                <p className="text-2xl font-bold">{summaryData.water} m³</p>
                <p className="text-xs text-blue-500">Per ton of material</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Recycle className="h-8 w-8 text-primary" />
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Excellent
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Circularity Score</p>
                <p className="text-2xl font-bold">{summaryData.circularityScore}%</p>
                <div className="pt-2">
                  <Progress value={summaryData.circularityScore} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stage Emissions Chart */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle>Emissions by Stage</CardTitle>
              <p className="text-sm text-muted-foreground">
                Distribution of CO₂ emissions across lifecycle stages
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="stage" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="emissions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* End-of-Life Distribution */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle>End-of-Life Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Material recovery and disposal methods
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={endOfLifeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {endOfLifeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {endOfLifeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Key Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background">
                    <div className={`p-2 rounded-full ${
                      insight.type === "success" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-orange-500/10 text-orange-500"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-muted-foreground text-sm mb-2">{insight.description}</p>
                      <Badge variant="outline" className={
                        insight.type === "success" 
                          ? "border-primary/30 text-primary" 
                          : "border-orange-500/30 text-orange-500"
                      }>
                        {insight.impact}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
