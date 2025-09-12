import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Brain, BarChart3, GitCompare, FileText, Zap } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Database,
      title: "Smart Data Input",
      description: "Intuitive multi-step forms guide you through each LCA stage with intelligent suggestions and validation.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Brain,
      title: "AI Suggestions",
      description: "Machine learning algorithms provide optimization recommendations based on industry best practices.",
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: BarChart3,
      title: "Rich Visualization",
      description: "Interactive charts and diagrams make complex environmental data easy to understand and actionable.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: GitCompare,
      title: "Pathway Comparison",
      description: "Compare linear vs circular economy approaches with detailed impact analysis and ROI calculations.",
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: FileText,
      title: "Comprehensive Reports",
      description: "Generate detailed sustainability reports with recommendations and compliance documentation.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Instant calculations and updates as you modify parameters, enabling rapid scenario modeling.",
      color: "bg-secondary/10 text-secondary"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Powerful Features for Sustainable Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to conduct comprehensive lifecycle assessments 
            and drive meaningful environmental improvements in your metal production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border/50">
                <CardHeader className="pb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-heading">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Process Flow */}
        <div className="mt-20">
          <h3 className="text-2xl font-heading font-bold text-center mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Input Data", desc: "Enter your production parameters" },
              { step: "2", title: "AI Analysis", desc: "Our algorithms process your data" },
              { step: "3", title: "View Results", desc: "Explore interactive visualizations" },
              { step: "4", title: "Take Action", desc: "Implement sustainability improvements" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-hero text-white font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};