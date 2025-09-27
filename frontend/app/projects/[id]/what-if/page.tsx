import React from 'react';
import WhatIfForm from '../../../../components/WhatIf/Form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Page({ params }: { params: { id: string } }) {
  const projectId = params?.id || '';

  if (!projectId) {
    return <div style={{ padding: 24 }}>Loading project...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href={`/projects`}>
                <Button variant="ghost" size="sm" className="group hover:bg-blue-50 transition-all duration-300">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Projects
                </Button>
              </Link>
              <div className="border-l border-gray-300 pl-6">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    What‑If Simulations
                  </h1>
                </div>
                <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
                  Create scenario variations for any lifecycle stage — missing inputs are intelligently predicted by AI and calculated by stage controllers.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white/70 backdrop-blur-md border border-white/20 shadow-2xl shadow-gray-200/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Run a What‑If Scenario</CardTitle>
                  <CardDescription className="text-gray-600 mt-2 text-base leading-relaxed">
                    Choose a stage, provide one or more inputs, and run. AI will predict missing inputs and the backend will compute authoritative outputs.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* @ts-ignore */}
              <WhatIfForm projectId={projectId} />
            </CardContent>
          </Card>
        </div>
        {/* Enhanced Quick Links Section */}
        <div className="max-w-5xl mx-auto mt-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quick Navigation</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href={`/projects/${projectId}/workflow`} className="group">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 hover:border-blue-300/70 transition-all duration-300 hover:shadow-md transform hover:scale-105">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-semibold text-blue-800 group-hover:text-blue-900">Project Workflow</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">Return to the main project workflow</p>
                </div>
              </Link>
              
              <Link href={`/projects/${projectId}/results`} className="group">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 hover:border-green-300/70 transition-all duration-300 hover:shadow-md transform hover:scale-105">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-semibold text-green-800 group-hover:text-green-900">View Results</span>
                  </div>
                  <p className="text-sm text-green-600 mt-2">Analyze current project results</p>
                </div>
              </Link>
              
              <Link href={`/projects/${projectId}/help`} className="group">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 hover:border-purple-300/70 transition-all duration-300 hover:shadow-md transform hover:scale-105">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-purple-800 group-hover:text-purple-900">Help & Docs</span>
                  </div>
                  <p className="text-sm text-purple-600 mt-2">Get help and documentation</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

