'use client';

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Eye, 
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter
} from "lucide-react";
import { useState } from "react";

export default function DashboardReports() {
  const [searchTerm, setSearchTerm] = useState("");

  const reports = [
    {
      id: 1,
      name: "Aluminum Alloy 6061 - Circular Assessment",
      date: "2024-01-15",
      metal: "Aluminum",
      pathway: "Circular",
      circularityScore: 78,
      emissions: 1847,
      status: "completed",
      improvement: 34
    },
    {
      id: 2,
      name: "Copper Wire Production - Linear vs Circular",
      date: "2024-01-12",
      metal: "Copper",
      pathway: "Comparison",
      circularityScore: 65,
      emissions: 2140,
      status: "completed",
      improvement: 28
    },
    {
      id: 3,
      name: "Steel Beam Manufacturing - Baseline",
      date: "2024-01-10",
      metal: "Steel",
      pathway: "Linear",
      circularityScore: 42,
      emissions: 3200,
      status: "completed",
      improvement: 0
    },
    {
      id: 4,
      name: "Zinc Coating Process - Optimization Study",
      date: "2024-01-08",
      metal: "Zinc",
      pathway: "Circular",
      circularityScore: 71,
      emissions: 980,
      status: "draft",
      improvement: 45
    },
    {
      id: 5,
      name: "Recycled Aluminum Production Analysis",
      date: "2024-01-05",
      metal: "Aluminum",
      pathway: "Circular",
      circularityScore: 85,
      emissions: 1240,
      status: "completed",
      improvement: 52
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-primary/10 text-primary">Completed</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "in-progress":
        return <Badge className="bg-secondary/10 text-secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPathwayBadge = (pathway: string) => {
    switch (pathway) {
      case "Circular":
        return <Badge className="bg-primary/10 text-primary">Circular</Badge>;
      case "Linear":
        return <Badge className="bg-destructive/10 text-destructive">Linear</Badge>;
      case "Comparison":
        return <Badge className="bg-secondary/10 text-secondary">Comparison</Badge>;
      default:
        return <Badge variant="outline">{pathway}</Badge>;
    }
  };

  const getCircularityColor = (score: number) => {
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-secondary";
    return "text-destructive";
  };

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.metal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold mb-2">LCA Reports</h1>
            <p className="text-muted-foreground">
              View and manage your lifecycle assessment reports and analyses.
            </p>
          </div>
          <Button className="bg-gradient-hero hover:shadow-medium">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Circularity</p>
                  <p className="text-2xl font-bold">68%</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Improvement</p>
                  <p className="text-2xl font-bold">32%</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total CO₂ Saved</p>
                  <p className="text-2xl font-bold">2.8T</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports by name or metal type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Assessment Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{report.name}</h3>
                      {getStatusBadge(report.status)}
                      {getPathwayBadge(report.pathway)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.metal}</span>
                      <span>•</span>
                      <span>{report.emissions.toLocaleString()} kg CO₂</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`font-semibold ${getCircularityColor(report.circularityScore)}`}>
                        {report.circularityScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Circularity</div>
                    </div>

                    {report.improvement > 0 && (
                      <div className="text-center">
                        <div className="font-semibold text-primary">
                          {report.improvement}%
                        </div>
                        <div className="text-xs text-muted-foreground">Improvement</div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reports found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Insights */}
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5">
                <div className="p-2 rounded-full bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Circular Economy Adoption Rising</h4>
                  <p className="text-sm text-muted-foreground">
                    75% of your recent assessments show improved circularity scores compared to linear baselines.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/5">
                <div className="p-2 rounded-full bg-secondary/10">
                  <TrendingDown className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Energy Optimization Opportunity</h4>
                  <p className="text-sm text-muted-foreground">
                    Processing stages consistently show the highest energy consumption across all assessments.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
