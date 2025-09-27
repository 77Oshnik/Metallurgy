"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SmeltingStageFormProps {
  projectId: string;
  project: any;
  onComplete: (results: any) => void;
  apiEndpoint: string;
}

export default function SmeltingStageForm({
  projectId,
  project,
  onComplete,
  apiEndpoint,
}: SmeltingStageFormProps) {
  const [inputs, setInputs] = useState({
    SmeltEnergyKilowattHoursPerTonneMetal: "",
    SmeltRecoveryPercent: "",
    CokeUseKilogramsPerTonneMetal: "",
    FuelSharePercent: "",
    FluxesKilogramsPerTonneMetal: "",
    EmissionControlEfficiencyPercent: "",
  });

  const [loading, setLoading] = useState(false);

  const mandatoryFields = [
    "SmeltEnergyKilowattHoursPerTonneMetal",
    "SmeltRecoveryPercent",
    "CokeUseKilogramsPerTonneMetal",
  ];
  const optionalFields = [
    "FuelSharePercent",
    "FluxesKilogramsPerTonneMetal",
    "EmissionControlEfficiencyPercent",
  ];

  const fieldLabels: Record<string, string> = {
    SmeltEnergyKilowattHoursPerTonneMetal: "Smelting Energy (kWh/tonne metal)",
    SmeltRecoveryPercent: "Smelting Recovery (%)",
    CokeUseKilogramsPerTonneMetal: "Coke Use (kg/tonne metal)",
    FuelSharePercent: "Fuel Share (%)",
    FluxesKilogramsPerTonneMetal: "Fluxes (kg/tonne metal)",
    EmissionControlEfficiencyPercent: "Emission Control Efficiency (%)",
  };

  const fieldDescriptions: Record<string, string> = {
    SmeltEnergyKilowattHoursPerTonneMetal:
      "Energy consumption required for smelting process per tonne of metal produced",
    SmeltRecoveryPercent:
      "Percentage of metal recovered during the smelting process",
    CokeUseKilogramsPerTonneMetal:
      "Amount of coke fuel used in smelting per tonne of metal",
    FuelSharePercent:
      "Percentage share of different fuel types used in the smelting process",
    FluxesKilogramsPerTonneMetal:
      "Amount of flux materials used to remove impurities per tonne of metal",
    EmissionControlEfficiencyPercent:
      "Efficiency of emission control systems in reducing pollutants",
  };

  const handleInputChange = (field: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {};
      Object.entries(inputs).forEach(([key, value]) => {
        if (value !== "") {
          submitData[key] = parseFloat(value);
        }
      });

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error("Failed to process smelting stage");

      const result = await response.json();
      onComplete(result);
      toast({
        title: "Smelting Stage Completed",
        description: "Successfully processed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process smelting stage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mandatory Fields</CardTitle>
          <CardDescription>
            These fields are required for smelting stage calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mandatoryFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label>
                {fieldLabels[field]}{" "}
                <Badge variant="destructive" className="text-xs ml-2">
                  Required
                </Badge>
              </Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                placeholder={`Enter ${fieldLabels[field].toLowerCase()}`}
                value={inputs[field as keyof typeof inputs]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                {fieldDescriptions[field]}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optional Fields</CardTitle>
          <CardDescription>
            These fields can be left empty if not applicable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optionalFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label>
                {fieldLabels[field]}{" "}
                <Badge variant="secondary" className="text-xs ml-2">
                  Optional
                </Badge>
              </Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                max={field.includes("Percent") ? "100" : undefined}
                placeholder={`Enter ${fieldLabels[
                  field
                ].toLowerCase()} (optional)`}
                value={inputs[field as keyof typeof inputs]}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
              <p className="text-sm text-gray-500">
                {fieldDescriptions[field]}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Process Smelting Stage
      </Button>
    </form>
  );
}
