'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

interface ProjectData {
  ProjectName: string;
  FunctionalUnitMassTonnes: number;
  MetalType: string;
  ProcessingMode: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectData>({
    ProjectName: '',
    FunctionalUnitMassTonnes: 1.0,
    MetalType: '',
    ProcessingMode: ''
  });

  const handleInputChange = (field: keyof ProjectData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ProjectName || !formData.MetalType || !formData.ProcessingMode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  try {
    const response = await fetch(`${BACKEND_URL}/api/projects`, {
      method: 'GET', // or POST/PUT/etc., depending on your API
      headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to create project');
      }
      
      toast({
        title: "Project Created",
        description: `Project "${formData.ProjectName}" has been created successfully`,
      });

      // Redirect to the project workflow
      router.push(`/projects/${result.project.ProjectIdentifier}/workflow`);
    } catch (error) {
      console.error('Error creating project:', error);
      
      let errorMessage = "Failed to create project. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Cannot connect to backend')) {
          errorMessage = "Cannot connect to backend server. Please make sure the backend is running on port 5000.";
        } else if (error.message.includes('Backend server error')) {
          errorMessage = "Backend server error. Please check if the backend is running properly.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Set up your LCA project with basic information. This will determine the analysis workflow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={formData.ProjectName}
                  onChange={(e) => handleInputChange('ProjectName', e.target.value)}
                  maxLength={20}
                  required
                />
                <p className="text-sm text-gray-500">Maximum 20 characters</p>
              </div>

              {/* Functional Unit */}
              <div className="space-y-2">
                <Label htmlFor="functionalUnit">Functional Unit Mass (tonnes) *</Label>
                <Input
                  id="functionalUnit"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  placeholder="1.0"
                  value={formData.FunctionalUnitMassTonnes}
                  onChange={(e) => handleInputChange('FunctionalUnitMassTonnes', parseFloat(e.target.value) || 1.0)}
                  required
                />
                <p className="text-sm text-gray-500">The reference unit for your LCA analysis</p>
              </div>

              {/* Metal Type */}
              <div className="space-y-2">
                <Label htmlFor="metalType">Metal Type *</Label>
                <Select onValueChange={(value) => handleInputChange('MetalType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aluminium">Aluminium</SelectItem>
                    <SelectItem value="Copper">Copper</SelectItem>
                    <SelectItem value="CriticalMinerals">Critical Minerals</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">This affects AI predictions and default parameters</p>
              </div>

              {/* Processing Mode */}
              <div className="space-y-2">
                <Label htmlFor="processingMode">Processing Mode *</Label>
                <Select onValueChange={(value) => handleInputChange('ProcessingMode', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select processing mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Linear">Linear</SelectItem>
                    <SelectItem value="Circular">Circular</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-500 space-y-1">
                  <p><strong>Linear:</strong> Traditional processing (5 stages: Mining → Concentration → Smelting → Fabrication → Use Phase)</p>
                  <p><strong>Circular:</strong> Circular economy focus (All 6 stages including End-of-Life recycling)</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linear Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Traditional linear model focusing on production efficiency. 
                Covers mining through use phase with emphasis on resource optimization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Circular Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive circular economy analysis including end-of-life recycling. 
                Focuses on material loops, reuse potential, and waste minimization.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}