'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface HealthStatus {
  frontend?: any;
  backend?: any;
  connection?: string;
}

export default function DebugPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const testBackendDirect = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`);
      const data = await response.json();
      alert('Direct backend connection successful!\n' + JSON.stringify(data, null, 2));
    } catch (err) {
      alert('Direct backend connection failed:\n' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
      case 'unreachable':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'unreachable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LCA Platform Debug</h1>
          <p className="text-gray-600">System health and connection diagnostics</p>
        </div>

        <div className="space-y-6">
          {/* Health Check Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Health Check</CardTitle>
                <Button onClick={checkHealth} disabled={loading} size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Current status of frontend and backend services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800">Error: {error}</p>
                </div>
              )}

              {healthStatus && (
                <div className="space-y-4">
                  {/* Frontend Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(healthStatus.frontend?.status || 'unknown')}
                      <div>
                        <h3 className="font-medium">Frontend Service</h3>
                        <p className="text-sm text-gray-500">Next.js Application</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(healthStatus.frontend?.status || 'unknown')}>
                      {healthStatus.frontend?.status || 'Unknown'}
                    </Badge>
                  </div>

                  {/* Backend Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(healthStatus.backend?.status || 'unknown')}
                      <div>
                        <h3 className="font-medium">Backend Service</h3>
                        <p className="text-sm text-gray-500">Express.js API Server</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(healthStatus.backend?.status || 'unknown')}>
                      {healthStatus.backend?.status || 'Unknown'}
                    </Badge>
                  </div>

                  {/* Connection Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(healthStatus.connection || 'unknown')}
                      <div>
                        <h3 className="font-medium">Frontend ↔ Backend Connection</h3>
                        <p className="text-sm text-gray-500">API Communication</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(healthStatus.connection || 'unknown')}>
                      {healthStatus.connection || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Troubleshooting Card */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
              <CardDescription>
                Common issues and solutions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Backend Connection Issues</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Make sure the backend server is running: <code>cd backend && npm run dev</code></li>
                  <li>• Check if MongoDB is running and accessible</li>
                  <li>• Verify the backend is running on port 5000</li>
                  <li>• Check the backend terminal for error messages</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Environment Configuration</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Backend .env file should have MONGODB_URI set</li>
                  <li>• Frontend .env.local should have BACKEND_URL=http://localhost:5000</li>
                  <li>• Check for any missing environment variables</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <Button onClick={testBackendDirect} variant="outline">
                  Test Direct Backend Connection
                </Button>
                 <Button
    onClick={() => window.open(`${BACKEND_URL}/api/health`, '_blank')}
    variant="outline"
  >
                  Open Backend Health Check
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          {healthStatus && (
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(healthStatus, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}