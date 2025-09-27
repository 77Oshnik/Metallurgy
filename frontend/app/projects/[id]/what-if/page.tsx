'use client';

import React, { useState, useEffect } from 'react';
import WhatIfForm from '../../../../components/WhatIf/Form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, FlaskConical, Factory, Calendar, Clock, Trash2, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  _id: string;
  ProjectName: string;
  MetalType: string;
  ProcessingMode: string;
  FunctionalUnit: string;
  MetalContent: number;
  CreatedDate: string;
}

interface WhatIfScenario {
  _id: string;
  scenarioName: string;
  stageName: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const projectId = params?.id || '';
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [previousScenarios, setPreviousScenarios] = useState<WhatIfScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<any | null>(null);
  const [loadingScenario, setLoadingScenario] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchPreviousScenarios();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const result = await response.json();
        setProject(result.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousScenarios = async () => {
    try {
      const BACKEND_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const response = await fetch(`${BACKEND_BASE}/api/whatif/${encodeURIComponent(projectId)}`);
      if (response.ok) {
        const result = await response.json();
        setPreviousScenarios(result.scenarios || []);
      }
    } catch (error) {
      console.error('Error fetching previous scenarios:', error);
    }
  };

  const viewScenario = async (scenarioId: string) => {
    setLoadingScenario(true);
    try {
      const BACKEND_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const response = await fetch(`${BACKEND_BASE}/api/whatif/${encodeURIComponent(projectId)}/${encodeURIComponent(scenarioId)}`);
      
      if (response.ok) {
        const scenarioData = await response.json();
        setSelectedScenario(scenarioData);
      } else {
        throw new Error('Failed to fetch scenario details');
      }
    } catch (error) {
      console.error('Error viewing scenario:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scenario details',
        variant: 'destructive',
      });
    } finally {
      setLoadingScenario(false);
    }
  };

  const deleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) {
      return;
    }
    
    try {
      const BACKEND_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const url = `${BACKEND_BASE}/api/whatif/${encodeURIComponent(projectId)}/${encodeURIComponent(scenarioId)}`;
      console.log('Attempting to delete scenario:', { projectId, scenarioId, url });
      
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      console.log('Delete response:', response.status, response.statusText);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Delete successful:', responseData);
        setPreviousScenarios(prev => prev.filter(s => s._id !== scenarioId));
        toast({
          title: 'Success',
          description: 'Scenario deleted successfully',
        });
        // Close scenario view if the deleted scenario is currently being viewed
        if (selectedScenario && selectedScenario._id === scenarioId) {
          setSelectedScenario(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete failed:', response.status, errorData);
        throw new Error(errorData.error || `Failed to delete scenario (${response.status})`);
      }
    } catch (error) {
      console.error('Error deleting scenario:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete scenario',
        variant: 'destructive',
      });
    }
  };

  const closeScenarioView = () => {
    setSelectedScenario(null);
  };

  const getMetalIcon = (metalType: string) => {
    return <Factory className="h-6 w-6" />;
  };

  const getProcessingModeColor = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case 'linear':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'circular':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!projectId) {
    return <div style={{ padding: 24 }}>Loading project...</div>;
  }

  return (
    <div>
      {/* Feature Banner */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-500/10 to-emerald-600/10 border border-green-300/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-emerald-100 border border-green-200 rounded-lg">
              <FlaskConical className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">What-If Scenario Simulation Engine</h2>
              <p className="text-gray-600 text-sm mt-1">
                Create and test different scenarios to understand the impact of parameter changes on your metallurgical processes. AI will predict missing inputs and compute authoritative outputs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-8">
        {/* Left Sidebar - Project Details & Previous Scenarios */}
        <div className="w-80 flex-shrink-0 space-y-6">
          {/* Project Details Card */}
          {project && (
            <Card className="bg-white border border-green-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <Factory className="h-4 w-4 text-green-600" />
                  <span>Project Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="text-lg p-2 bg-green-50 rounded-lg">
                    {getMetalIcon(project.MetalType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{project.ProjectName}</div>
                    <div className="text-xs text-gray-500">{project.MetalType}</div>
                  </div>
                  <Badge className={`text-xs ${getProcessingModeColor(project.ProcessingMode)}`}>
                    {project.ProcessingMode}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="bg-green-50/50 p-2 rounded border border-green-200/50">
                    <div className="text-gray-500 text-xs mb-1">Metal Type</div>
                    <div className="font-medium text-gray-900">{project.MetalType}</div>
                  </div>
                  <div className="bg-green-50/50 p-2 rounded border border-green-200/50">
                    <div className="text-gray-500 text-xs mb-1">Project ID</div>
                    <div className="font-medium text-gray-900 font-mono text-xs">{project._id}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous Scenarios Card */}
          <Card className="bg-white border border-green-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span>Previous Scenarios</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Your previously run scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previousScenarios.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {previousScenarios.map((scenario) => (
                    <div key={scenario._id} className="p-2 bg-green-50/30 rounded border border-green-200/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs text-gray-900 truncate">{scenario.scenarioName}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <div className="flex items-center">
                              <Factory className="h-3 w-3 mr-1" />
                              <span className="truncate">{scenario.stageName}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{new Date(scenario.createdAtUtc).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50"
                            disabled={loadingScenario}
                            onClick={() => viewScenario(scenario._id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => deleteScenario(scenario._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No previous scenarios</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Main What-If Form */}
        <div className="flex-1">
          <Card className="bg-gradient-to-br from-white to-green-50/30 backdrop-blur-md border border-green-200/50 shadow-2xl shadow-green-200/20 overflow-hidden">
            <CardContent className="p-0">
              {/* @ts-ignore */}
              <WhatIfForm projectId={projectId} onScenarioCreated={fetchPreviousScenarios} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scenario Details Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{selectedScenario.scenarioName}</h2>
              <Button variant="outline" size="sm" onClick={closeScenarioView}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scenario Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Scenario Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">Stage Name</span>
                      <p className="font-medium">{selectedScenario.stageName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Created</span>
                      <p className="font-medium">{new Date(selectedScenario.createdAtUtc).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Last Updated</span>
                      <p className="font-medium">{new Date(selectedScenario.updatedAtUtc).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Inputs */}
                {selectedScenario.inputs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Inputs Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(selectedScenario.inputs)
                          .filter(([_, value]) => value !== undefined && value !== null && String(value).trim() !== '')
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center p-2 bg-green-50/30 rounded">
                              <span className="text-xs font-medium text-gray-700">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                              <span className="text-xs text-gray-600">{String(value)}</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Outputs */}
              {selectedScenario.outputs && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(selectedScenario.outputs.Outputs || selectedScenario.outputs || {})
                        .filter(([_, value]) => typeof value === 'number' || (!isNaN(Number(value)) && value !== null && value !== ''))
                        .map(([key, value]) => (
                          <div key={key} className="p-3 bg-gray-50 rounded border">
                            <div className="text-xs text-gray-500 mb-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                            <div className="font-semibold text-green-600">
                              {Number.isFinite(Number(value)) ? Number(value).toLocaleString(undefined, { maximumFractionDigits: 6 }) : String(value)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warnings */}
              {selectedScenario.warnings && selectedScenario.warnings.length > 0 && (
                <Card className="mt-6 border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-sm text-yellow-800">Warnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {selectedScenario.warnings.map((warning: string, index: number) => (
                        <li key={index} className="text-sm text-yellow-700">• {warning}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

