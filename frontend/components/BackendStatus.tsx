'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok || response.status === 404) {
        // 404 is fine - it means backend is running but no projects exist
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      setStatus('disconnected');
    }
  };

  if (status === 'checking') {
    return (
      <Badge variant="outline" className="flex items-center space-x-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking backend...</span>
      </Badge>
    );
  }

  if (status === 'connected') {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 flex items-center space-x-1">
        <CheckCircle className="h-3 w-3" />
        <span>Backend Connected</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="flex items-center space-x-1">
      <XCircle className="h-3 w-3" />
      <span>Backend Disconnected</span>
    </Badge>
  );
}