'use client';

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowUp, 
  ArrowDown, 
  TrendingDown, 
  Zap, 
  Droplets, 
  Recycle,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function DashboardComparison() {
  const linearData = {
    pathway: "Linear Economy",
    emissions: 2800,
    energy: 3200,
    water: 680,
    circularityScore: 25,
    cost: 1250,
    wasteGeneration: 85
  };

  const circularData = {
    pathway: "Circular Economy",
    emissions: 1847,
    energy: 2340,
    water: 450,
    circularityScore: 72,
    cost: 1050,
    wasteGeneration: 25
  };

  const calculateImprovement = (linear: number, circular: number) => {
    const improvement = ((linear - circular) / linear) * 100;
    return Math.round(improvement);
  };

  const improvements = {
    emissions: calculateImprovement(linearData.emissions, circularData.emissions),
    energy: calculateImprovement(linearData.energy, circularData.energy),
    water: calculateImprovement(linearData.water, circularData.water),
    cost: calculateImprovement(linearData.cost, circularData.cost),
    waste: calculateImprovement(linearData.wasteGeneration, circularData.wasteGeneration)
  };

  const MetricCard = ({ 
    title, 
    icon: Icon, 
    linearValue, 
    circularValue, 
    improvement, 
    unit,
    isPositive = true 
  }: {
    title: string;
    icon: any;
    linearValue: number;
    circularValue: number;
    improvement: number;
    unit: string;
    isPositive?: boolean;
  }) => (
    <Card className="bg-gradient-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-destructive/10">
            <div className="text-sm text-muted-foreground mb-1">Linear</div>
            <div className="font-bold text-lg">{linearValue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <div className="text-sm text-muted-foreground mb-1">Circular</div>
            <div className="font-bold text-lg">{circularValue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <Badge 
            variant="secondary" 
            className={`${
              isPositive 
                ? "bg-primary/10 text-primary" 
                : "bg-destructive/10 text-destructive"
            } flex items-center gap-1`}
          >
            {isPositive ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            )}
            {improvement}% {isPositive ? "reduction" : "increase"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-heading font-bold mb-2">Pathway Comparison</h1>
          <p className="text-muted-foreground">
            Compare linear vs circular economy approaches for your metal production.
          </p>
        </div>

        {/* Impact Summary Banner */}
        <Card className="bg-gradient-hero text-white overflow-hidden relative">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Circular Economy Impact</h2>
                <p className="text-white/90 text-lg">
                  Switching to circular reduces emissions by <span className="font-bold">{improvements.emissions}%</span>
                </p>
                <p className="text-white/80 text-sm mt-2">
                  Comprehensive lifecycle assessment shows significant environmental and economic benefits
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{improvements.emissions}%</div>
                <div className="text-white/80">CO₂ Reduction</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="CO₂ Emissions"
            icon={TrendingDown}
            linearValue={linearData.emissions}
            circularValue={circularData.emissions}
            improvement={improvements.emissions}
            unit="kg CO₂"
          />
          
          <MetricCard
            title="Energy Consumption"
            icon={Zap}
            linearValue={linearData.energy}
            circularValue={circularData.energy}
            improvement={improvements.energy}
            unit="kWh"
          />
          
          <MetricCard
            title="Water Usage"
            icon={Droplets}
            linearValue={linearData.water}
            circularValue={circularData.water}
            improvement={improvements.water}
            unit="m³"
          />
          
          <Card className="bg-gradient-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Recycle className="h-5 w-5 text-primary" />
                Circularity Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-destructive/10">
                  <div className="text-sm text-muted-foreground mb-1">Linear</div>
                  <div className="font-bold text-lg">{linearData.circularityScore}%</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10">
                  <div className="text-sm text-muted-foreground mb-1">Circular</div>
                  <div className="font-bold text-lg">{circularData.circularityScore}%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <Badge variant="secondary" className="bg-primary/10 text-primary flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  +{circularData.circularityScore - linearData.circularityScore} points
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <MetricCard
            title="Production Cost"
            icon={TrendingDown}
            linearValue={linearData.cost}
            circularValue={circularData.cost}
            improvement={improvements.cost}
            unit="USD/ton"
          />
          
          <MetricCard
            title="Waste Generation"
            icon={AlertTriangle}
            linearValue={linearData.wasteGeneration}
            circularValue={circularData.wasteGeneration}
            improvement={improvements.waste}
            unit="kg/ton"
          />
        </div>

        {/* Key Differences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Linear Economy Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">High Resource Extraction</div>
                    <div className="text-sm text-muted-foreground">Relies heavily on virgin materials, depleting natural resources</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Limited Recycling</div>
                    <div className="text-sm text-muted-foreground">Low end-of-life material recovery rates</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Waste Generation</div>
                    <div className="text-sm text-muted-foreground">Significant waste sent to landfills</div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Circular Economy Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Resource Efficiency</div>
                    <div className="text-sm text-muted-foreground">Maximizes material reuse and recycling</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Reduced Environmental Impact</div>
                    <div className="text-sm text-muted-foreground">Lower emissions and energy consumption</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Economic Value</div>
                    <div className="text-sm text-muted-foreground">Cost savings through material recovery</div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Card className="bg-accent/30 inline-block">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Ready to make the switch?</h3>
              <p className="text-muted-foreground mb-4">
                Start implementing circular economy principles in your production
              </p>
              <Button className="bg-gradient-hero hover:shadow-medium">
                Download Implementation Guide
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
