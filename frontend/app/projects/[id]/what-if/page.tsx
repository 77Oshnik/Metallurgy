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
                  What‑If Simulations
                </h1>
                <p className="text-sm text-gray-500">
                  Create scenario variations for any lifecycle stage — missing inputs are imputed by AI and calculated by stage controllers.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Avoid passing event handlers from server -> use a link to a help page */}
              <Link href={`/projects/${projectId}/help`}>
                <Button size="sm">
                  Quick Help
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <Card className="ring-1 ring-slate-100">
              <CardHeader>
                <CardTitle className="text-lg">Run a What‑If Scenario</CardTitle>
                <CardDescription>
                  Choose a stage, provide one or more inputs, and run. AI will impute missing inputs and the backend will compute authoritative outputs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* @ts-ignore */}
                <WhatIfForm projectId={projectId} />
              </CardContent>
            </Card>
          </div>

          <aside className="hidden lg:block" aria-hidden>
            {/* Right column intentionally empty now; tips removed per request */}
          </aside>
        </div>
        {/* Stage quick links moved below main content, not inside a card */}
        <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Links</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
              <Link href={`/projects/${projectId}/workflow`} className="text-sm text-blue-600 hover:underline">
                Open Project Workflow
              </Link>
              <Link href={`/projects/${projectId}/results`} className="text-sm text-blue-600 hover:underline">
                View Project Results
              </Link>
              <Link href={`/projects/${projectId}/help`} className="text-sm text-gray-600 hover:underline">
                Help / Documentation
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

