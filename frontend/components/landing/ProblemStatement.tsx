import { AlertTriangle, TrendingUp, Recycle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const ProblemStatement = () => {
  const challenges = [
    {
      icon: AlertTriangle,
      title: "Environmental Impact",
      description: "Metal production accounts for 7% of global CO₂ emissions, with aluminum and steel leading contributors to environmental degradation.",
      stat: "7%",
      statLabel: "of global emissions"
    },
    {
      icon: TrendingUp,
      title: "Rising Demand",
      description: "Global metal demand is projected to increase by 250% by 2050, putting unprecedented pressure on natural resources.",
      stat: "250%",
      statLabel: "demand increase by 2050"
    },
    {
      icon: Recycle,
      title: "Linear Economy",
      description: "Traditional take-make-dispose models waste valuable materials. Only 30% of metals are currently recycled globally.",
      stat: "30%",
      statLabel: "recycling rate"
    }
  ];

  return (
    <section id="about" className="py-20 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            The Challenge We're Solving
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The metals industry faces unprecedented environmental challenges that require 
            innovative, data-driven solutions for sustainable transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {challenges.map((challenge, index) => {
            const Icon = challenge.icon;
            return (
              <Card key={index} className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border/50">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-heading font-semibold mb-4">{challenge.title}</h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {challenge.description}
                  </p>
                  
                  <div className="pt-4 border-t border-border/30">
                    <div className="text-3xl font-bold text-primary mb-1">{challenge.stat}</div>
                    <div className="text-sm text-muted-foreground">{challenge.statLabel}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-xl bg-card shadow-soft border border-border/50">
            <div className="text-2xl">💡</div>
            <div className="text-left">
              <div className="font-semibold text-foreground">Our Solution</div>
              <div className="text-muted-foreground">AI-powered LCA tools that make sustainability actionable</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};