'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Factory,
  Truck,
  Home,
  Recycle,
  Mountain
} from "lucide-react";

const stages = [
  {
    id: "extraction",
    title: "Extraction",
    icon: Mountain,
    description: "Raw material extraction and mining processes"
  },
  {
    id: "processing",
    title: "Processing",
    icon: Factory,
    description: "Metal refining and manufacturing processes"
  },
  {
    id: "transport",
    title: "Transport",
    icon: Truck,
    description: "Transportation and logistics"
  },
  {
    id: "use",
    title: "Use Phase",
    icon: Home,
    description: "Product usage and maintenance"
  },
  {
    id: "endoflife",
    title: "End-of-Life",
    icon: Recycle,
    description: "Recycling and disposal processes"
  }
];

interface FormData {
  metalType: string;
  quantity: number;
  [key: string]: any;
}

export const DataInputForm = ({ onComplete }: { onComplete?: (data: FormData) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    metalType: "",
    quantity: 1000,
    extraction: {
      energy: 50,
      renewableEnergy: 20,
      waterUsage: 30,
      location: ""
    },
    processing: {
      temperature: 800,
      efficiency: 75,
      recycledContent: 15,
      wasteFactor: 5
    },
    transport: {
      distance: 500,
      mode: "",
      efficiency: 60
    },
    use: {
      lifespan: 25,
      maintenance: 2,
      efficiency: 90
    },
    endoflife: {
      recyclingRate: 80,
      landfillRate: 15,
      energyRecovery: 5
    }
  });

  const updateFormData = (stage: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < stages.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStageForm = () => {
    const stage = stages[currentStep];
    const stageData = formData[stage.id];

    switch (stage.id) {
      case "extraction":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="energy">Energy Consumption (MWh/ton)</Label>
              <div className="px-3">
                <Slider
                  value={[stageData.energy]}
                  onValueChange={(value: number[]) => updateFormData("extraction", "energy", value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0</span>
                  <span className="font-medium">{stageData.energy} MWh/ton</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="renewableEnergy">Renewable Energy (%)</Label>
              <div className="px-3">
                <Slider
                  value={[stageData.renewableEnergy]}
                  onValueChange={(value: number[]) => updateFormData("extraction", "renewableEnergy", value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0%</span>
                  <span className="font-medium">{stageData.renewableEnergy}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Mining Location</Label>
              <Select value={stageData.location} onValueChange={(value: string) => updateFormData("extraction", "location", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mining location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="australia">Australia</SelectItem>
                  <SelectItem value="chile">Chile</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="china">China</SelectItem>
                  <SelectItem value="usa">United States</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "processing":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="temperature">Processing Temperature (°C)</Label>
              <Input
                type="number"
                value={stageData.temperature}
                onChange={(e) => updateFormData("processing", "temperature", Number(e.target.value))}
                placeholder="800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="efficiency">Process Efficiency (%)</Label>
              <div className="px-3">
                <Slider
                  value={[stageData.efficiency]}
                  onValueChange={(value: number[]) => updateFormData("processing", "efficiency", value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0%</span>
                  <span className="font-medium">{stageData.efficiency}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recycledContent">Recycled Content (%)</Label>
              <div className="px-3">
                <Slider
                  value={[stageData.recycledContent]}
                  onValueChange={(value: number[]) => updateFormData("processing", "recycledContent", value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0%</span>
                  <span className="font-medium">{stageData.recycledContent}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "transport":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="distance">Transport Distance (km)</Label>
              <Input
                type="number"
                value={stageData.distance}
                onChange={(e) => updateFormData("transport", "distance", Number(e.target.value))}
                placeholder="500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Transport Mode</Label>
              <Select value={stageData.mode} onValueChange={(value: string) => updateFormData("transport", "mode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transport mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="rail">Rail</SelectItem>
                  <SelectItem value="ship">Ship</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="efficiency">Fuel Efficiency (%)</Label>
              <div className="px-3">
                <Slider
                  value={[stageData.efficiency]}
                  onValueChange={(value: number[]) => updateFormData("transport", "efficiency", value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0%</span>
                  <span className="font-medium">{stageData.efficiency}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "use":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lifespan">Product Lifespan (years)</Label>
              <Input
                type="number"
                value={stageData.lifespan}
                onChange={(e) => updateFormData("use", "lifespan", Number(e.target.value))}
                placeholder="25"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance">Maintenance Frequency (times/year)</Label>
              <div className="px-3">
                <Slider
                  value={[stageData.maintenance]}
                  onValueChange={(value: number[]) => updateFormData("use", "maintenance", value[0])}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0</span>
                  <span className="font-medium">{stageData.maintenance} times/year</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "endoflife":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recyclingRate">Recycling Rate (%)</Label>
              <div className="px-3">
                <Slider
                  value={[stageData.recyclingRate]}
                  onValueChange={(value: number[]) => updateFormData("endoflife", "recyclingRate", value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0%</span>
                  <span className="font-medium">{stageData.recyclingRate}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="landfillRate">Landfill Rate (%)</Label>
              <div className="px-3">
                <Slider
                  value={[stageData.landfillRate]}
                  onValueChange={(value: number[]) => updateFormData("endoflife", "landfillRate", value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0%</span>
                  <span className="font-medium">{stageData.landfillRate}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={stage.id} className="flex items-center">
              <div className={`flex items-center gap-3 ${
                isCompleted ? "text-primary" : isCurrent ? "text-secondary" : "text-muted-foreground"
              }`}>
                <div className={`p-3 rounded-full border-2 ${
                  isCompleted 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : isCurrent 
                    ? "bg-secondary border-secondary text-secondary-foreground"
                    : "border-muted-foreground"
                }`}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="hidden md:block">
                  <div className="font-medium">{stage.title}</div>
                  <div className="text-xs text-muted-foreground">{stage.description}</div>
                </div>
              </div>
              
              {index < stages.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {(() => {
              const Icon = stages[currentStep].icon;
              return <Icon className="h-6 w-6 text-secondary" />;
            })()}
            {stages[currentStep].title}
          </CardTitle>
          <p className="text-muted-foreground">{stages[currentStep].description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info for first step */}
          {currentStep === 0 && (
            <div className="space-y-6 mb-8 p-6 rounded-lg bg-accent/30">
              <h3 className="font-semibold text-lg">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="metalType">Metal Type</Label>
                  <Select value={formData.metalType} onValueChange={(value: string) => setFormData(prev => ({ ...prev, metalType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aluminum">Aluminum</SelectItem>
                      <SelectItem value="copper">Copper</SelectItem>
                      <SelectItem value="steel">Steel</SelectItem>
                      <SelectItem value="zinc">Zinc</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (tons)</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>
          )}
          
          {renderStageForm()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button onClick={nextStep} className="bg-gradient-hero hover:shadow-medium">
              {currentStep === stages.length - 1 ? "Complete Assessment" : "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};