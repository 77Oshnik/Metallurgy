'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ByproductValorizationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Byproduct Valorization Error:', error);
  }, [error]);

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Byproduct Valorization Error</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'An unexpected error occurred while loading the byproduct valorization page.'}
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground">
            <p>This could be due to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Network connectivity issues</li>
              <li>Backend service temporarily unavailable</li>
              <li>Invalid project data</li>
              <li>Browser compatibility issues</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {error.digest && (
            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p>Error ID: {error.digest}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}