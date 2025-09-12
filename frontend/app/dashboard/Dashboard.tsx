'use client';

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Zap, 
  Recycle, 
  BarChart3, 
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const stats = [
    {
      title: "Total Assessments",
      value: "12",
      change: "+3 this month",
      icon: BarChart3,
      color: "text-primary"
    },
    {
      title: "Avg. Emissions Saved",
      value: "1,247 kg CO₂",
      change: "+15% vs last month",
      icon: TrendingUp,
      color: "text-primary"
    },
    {
      title: "Circularity Score",
      value: "78%",
      change: "+12% improvement",
      icon: Recycle,
      color: "text-secondary"
    },
    {
      title: "Energy Efficiency",
      value: "85%",
      change: "+8% this quarter",
      icon: Zap,
      color: "text-secondary"
    }
  ];

  const recentProjects = [
    {
      name: "Aluminum Alloy 6061 - Linear",
      date: "2024-01-15",
      status: "completed",
      circularityScore: 45,
      emissions: "2,450 kg CO₂"
    },
    {
      name: "Copper Wire Production",
      date: "2024-01-10",
      status: "in-progress",
      circularityScore: 72,
      emissions: "1,890 kg CO₂"
    },
    {
      name: "Steel Beam Manufacturing",
      date: "2024-01-08",
      status: "completed",
      circularityScore: 68,
      emissions: "3,200 kg CO₂"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-secondary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCircularityColor = (score: number) => {
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-secondary";
    return "text-destructive";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your sustainability assessments and impact metrics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-gradient-card hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-primary">{stat.change}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-20 flex flex-col gap-2 bg-gradient-hero hover:shadow-medium transition-all duration-300"
                onClick={() => router.push("/dashboard/input")}
              >
                <BarChart3 className="h-6 w-6" />
                <span>New LCA Assessment</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 hover:bg-accent/50 transition-all duration-300"
                onClick={() => router.push("/dashboard/comparison")}
              >
                <Recycle className="h-6 w-6" />
                <span>Compare Pathways</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 hover:bg-accent/50 transition-all duration-300"
                onClick={() => router.push("/dashboard/reports")}
              >
                <ArrowRight className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="bg-gradient-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/reports")}>
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(project.status)}
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className={`font-semibold ${getCircularityColor(project.circularityScore)}`}>
                        {project.circularityScore}%
                      </div>
                      <div className="text-muted-foreground">Circularity</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{project.emissions}</div>
                      <div className="text-muted-foreground">Emissions</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
