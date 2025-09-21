'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, ArrowRight, Recycle, TrendingUp, BarChart3, Zap } from 'lucide-react';

interface Project {
  _id: string;
  ProjectName: string;
  FunctionalUnitMassTonnes: number;
  MetalType: string;
  ProcessingMode: string;
  CreatedAtUtc: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);
  // sample comment

  const fetchProjects = async () => {
    try {
      // Use public env var so you can configure backend base URL.
      // If NEXT_PUBLIC_BACKEND_URL is not set, it will use relative path (works if Next proxies the API).
      const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
      const response = await fetch(`${base}/api/projects/`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched projects:', data); // Debug log

        // Accept both shapes: an array or { projects: [...] }
        const projectsList = Array.isArray(data) ? data : (data.projects ?? []);
        setProjects(projectsList);
      } else {
        console.error('Failed to fetch projects:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetalIcon = (metalType: string) => {
    switch (metalType) {
      case 'Aluminium':
        return '🔩';
      case 'Copper':
        return '🔶';
      case 'CriticalMinerals':
        return '💎';
      default:
        return '⚙️';
    }
  };

  const getProcessingModeColor = (mode: string) => {
    return mode === 'Circular' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="text-sm text-gray-500">
                  Manage your LCA projects and track progress
                </p>
              </div>
            </div>
            <Link href="/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <TrendingUp className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first LCA project
            </p>
            <Link href="/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Projects Summary */}
            <div className="mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Projects</p>
                        <p className="text-3xl font-bold">{projects.length}</p>
                      </div>
                      <div className="text-4xl opacity-80">📊</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Circular Projects</p>
                        <p className="text-3xl font-bold">
                          {projects.filter(p => p.ProcessingMode === 'Circular').length}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">♻️</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Metal Types</p>
                        <p className="text-3xl font-bold">
                          {new Set(projects.map(p => p.MetalType)).size}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">⚙️</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project._id} href={`/projects/${project._id}/results`}>
                  <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -mr-10 -mt-10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    
                    <CardHeader className="relative z-10">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-3">
                          <div className="text-3xl p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                            {getMetalIcon(project.MetalType)}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {project.ProjectName}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {project.MetalType}
                            </div>
                          </div>
                        </CardTitle>
                        <Badge className={`${getProcessingModeColor(project.ProcessingMode)} group-hover:scale-105 transition-transform`}>
                          {project.ProcessingMode}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="relative z-10">
                      <div className="space-y-4">
                        {/* Project Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-gray-500 text-xs">Functional Unit</div>
                            <div className="font-semibold text-gray-900">
                              {project.FunctionalUnitMassTonnes} tonnes
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-gray-500 text-xs">Created</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(project.CreatedAtUtc).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Indicators */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Click to view results</span>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex space-x-2 pt-2">
                          <Link 
                            href={`/projects/${project._id}/workflow`} 
                            className="flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Recycle className="h-3 w-3 mr-1" />
                              Edit Workflow
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="px-3 hover:bg-green-50 hover:border-green-300"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.location.href = `/projects/${project._id}/results`;
                            }}
                          >
                            <TrendingUp className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </Card>
                </Link>
              ))}
            </div>
            
            {/* Add New Project Card */}
            <div className="mt-8">
              <Link href="/projects/new">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="mx-auto h-16 w-16 text-gray-400 mb-4 flex items-center justify-center bg-white rounded-full">
                        <Plus className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Project</h3>
                      <p className="text-gray-500">
                        Start a new LCA assessment for your metal production process
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Check Out Features */}
            <section className="mt-10">
              <div className="relative rounded-xl p-6 overflow-hidden bg-gradient-to-r from-slate-900/80 via-indigo-900/40 to-slate-900/50">
                <div className="absolute -left-32 -top-24 w-72 h-72 bg-gradient-to-tr from-blue-400/20 to-purple-500/10 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Check Out Features</h2>
                    <p className="text-sm text-slate-200/80">Explore the tools to simulate scenarios, compare workflows and visualize results.</p>
                  </div>
                  <Link href={`projects/${projects[0]?._id}/what-if`} className="relative z-10">
                    <Button className="bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600">
                      Try the What‑If Tool
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                  <div className="p-4 rounded-lg bg-white/6 border border-white/6 backdrop-blur-sm hover:scale-105 transition-transform">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 rounded-md bg-gradient-to-br from-blue-600 to-indigo-500 text-white">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Scenario Analytics</h3>
                        <p className="text-xs text-slate-200/70">Run what‑if scenarios to compare environmental impacts across alternatives.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/6 border border-white/6 backdrop-blur-sm hover:scale-105 transition-transform">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 rounded-md bg-gradient-to-br from-green-500 to-teal-400 text-white">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Performance Insights</h3>
                        <p className="text-xs text-slate-200/70">Visualize performance metrics and identify hotspots in your process chain.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/6 border border-white/6 backdrop-blur-sm hover:scale-105 transition-transform">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 rounded-md bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Fast Simulation</h3>
                        <p className="text-xs text-slate-200/70">Run quick predictive simulations and get instant feedback on alternatives.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}