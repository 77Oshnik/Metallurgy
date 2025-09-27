'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  AlertTriangle, 
  Zap, 
  Recycle, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function ProjectSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;

  const navigationItems = [
    {
      name: 'Results',
      href: `/projects/${projectId}/results`,
      icon: BarChart3
    },
    {
      name: 'Harmful Effects',
      href: `/projects/${projectId}/harmful-effects-analyzer`,
      icon: AlertTriangle
    },
    {
      name: 'Energy Transition',
      href: `/projects/${projectId}/renewable`,
      icon: Zap
    },
    {
      name: 'Byproduct Valorization',
      href: `/projects/${projectId}/by-product`,
      icon: Sparkles
    },
    {
      name: 'Circular Comparison',
      href: `/projects/${projectId}/circular-comparison`,
      icon: Recycle
    }
  ];

  const isActivePath = (href: string) => pathname === href;

  return (
    <Card className="p-4 sticky top-24 h-fit">
      <div className="mb-4">
        <Link href="/projects">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.href);
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start text-sm ${
                  isActive 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm" 
                    : "hover:bg-accent/50"
                }`}
              >
                <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}