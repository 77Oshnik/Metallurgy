'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  Globe,
  Server,
  Database,
  Wifi
} from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
  timestamp: string;
}

interface DiagnosticsPanelProps {
  projectId: string;
  onClose?: () => void;
}

export default function DiagnosticsPanel({ projectId, onClose }: DiagnosticsPanelProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    
    const results: DiagnosticResult[] = [];
    
    // Test 1: Backend Health Check
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const healthResponse = await fetch(`${baseUrl.replace('/api', '')}/api/health`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        results.push({
          name: 'Backend Health',
          status: 'success',
          message: 'Backend server is running',
          details: `Response: ${healthData.message}`,
          timestamp: new Date().toISOString()
        });
      } else {
        results.push({
          name: 'Backend Health',
          status: 'error',
          message: `Backend health check failed (${healthResponse.status})`,
          details: healthResponse.statusText,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      results.push({
        name: 'Backend Health',
        status: 'error',
        message: 'Cannot reach backend server',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // Test 2: Project Existence
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const projectResponse = await fetch(`${baseUrl}/projects`);
      
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        const projectExists = projectData.projects?.some((p: any) => p._id === projectId);
        
        if (projectExists) {
          results.push({
            name: 'Project Validation',
            status: 'success',
            message: 'Project exists in database',
            details: `Project ID: ${projectId}`,
            timestamp: new Date().toISOString()
          });
        } else {
          results.push({
            name: 'Project Validation',
            status: 'error',
            message: 'Project not found in database',
            details: `Invalid project ID: ${projectId}`,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        results.push({
          name: 'Project Validation',
          status: 'error',
          message: 'Cannot fetch projects list',
          details: `HTTP ${projectResponse.status}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      results.push({
        name: 'Project Validation',
        status: 'error',
        message: 'Project validation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // Test 3: Valorization Endpoints
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const valorizationResponse = await fetch(`${baseUrl}/valorization/${projectId}/available-byproducts`);
      
      if (valorizationResponse.ok) {
        const valorizationData = await valorizationResponse.json();
        results.push({
          name: 'Valorization API',
          status: 'success',
          message: 'Valorization endpoints working',
          details: `Found ${valorizationData.totalByproducts || 0} byproducts`,
          timestamp: new Date().toISOString()
        });
      } else {
        results.push({
          name: 'Valorization API',
          status: 'error',
          message: `Valorization API failed (${valorizationResponse.status})`,
          details: valorizationResponse.statusText,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      results.push({
        name: 'Valorization API',
        status: 'error',
        message: 'Valorization API unreachable',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // Test 4: Browser Environment
    const userAgent = navigator.userAgent;
    const isAdBlockerLikely = !window.navigator.webdriver && 
                             typeof window.chrome !== 'undefined' && 
                             typeof window.chrome.runtime !== 'undefined';
    
    results.push({
      name: 'Browser Environment',
      status: isAdBlockerLikely ? 'warning' : 'success',
      message: isAdBlockerLikely ? 'Potential ad blocker detected' : 'Browser environment normal',
      details: `User Agent: ${userAgent.substring(0, 50)}...`,
      timestamp: new Date().toISOString()
    });

    // Test 5: Network Configuration
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';
    
    results.push({
      name: 'Network Configuration',
      status: 'success',
      message: `Running on ${isLocalhost ? 'localhost' : 'production'} with ${isHttps ? 'HTTPS' : 'HTTP'}`,
      details: `Origin: ${window.location.origin}`,
      timestamp: new Date().toISOString()
    });

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [projectId]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Warning</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Running</Badge>;
    }
  };

  const hasErrors = diagnostics.some(d => d.status === 'error');
  const hasWarnings = diagnostics.some(d => d.status === 'warning');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle>System Diagnostics</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Re-run Tests
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        {diagnostics.length > 0 && (
          <Alert className={hasErrors ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950" : 
                          hasWarnings ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950" : 
                          "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"}>
            <AlertDescription>
              {hasErrors ? 
                "❌ Issues detected that may prevent the valorization feature from working properly." :
                hasWarnings ?
                "⚠️ Some warnings detected. The system should work but may have limitations." :
                "✅ All diagnostic tests passed successfully."
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Diagnostic Results */}
        <div className="space-y-3">
          {diagnostics.map((diagnostic, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 border rounded-lg bg-card"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(diagnostic.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{diagnostic.name}</h4>
                  {getStatusBadge(diagnostic.status)}
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">
                  {diagnostic.message}
                </p>
                
                {diagnostic.details && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-1 rounded">
                    {diagnostic.details}
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(diagnostic.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {hasErrors && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Troubleshooting Tips:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Check if the backend server is running on the correct port</li>
                <li>Verify the project ID is correct and exists in the database</li>
                <li>Disable browser extensions or ad blockers temporarily</li>
                <li>Try refreshing the page or using an incognito window</li>
                <li>Check browser console for additional error messages</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Environment Info */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Environment Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Project ID:</strong> <code className="text-xs bg-muted p-1 rounded">{projectId}</code>
            </div>
            <div>
              <strong>Base URL:</strong> <code className="text-xs bg-muted p-1 rounded">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</code>
            </div>
            <div>
              <strong>Current Origin:</strong> <code className="text-xs bg-muted p-1 rounded">{typeof window !== 'undefined' ? window.location.origin : 'N/A'}</code>
            </div>
            <div>
              <strong>Timestamp:</strong> <code className="text-xs bg-muted p-1 rounded">{new Date().toISOString()}</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}