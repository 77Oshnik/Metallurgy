import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Recycle, Factory, Truck, Home, Trash2 } from "lucide-react";
import circularEconomyImage from "@/assets/circular-economy.jpg";

export const CircularEconomySection = () => {
  const stages = [
    { icon: Factory, label: "Extraction", color: "text-red-500" },
    { icon: Factory, label: "Processing", color: "text-orange-500" },
    { icon: Truck, label: "Transport", color: "text-yellow-500" },
    { icon: Home, label: "Use Phase", color: "text-blue-500" },
    { icon: Recycle, label: "Recycling", color: "text-primary" }
  ];

  const benefits = [
    { value: "62%", label: "Emission Reduction", desc: "Lower CO₂ compared to linear models" },
    { value: "45%", label: "Energy Savings", desc: "Through optimized recycling processes" },
    { value: "80%", label: "Material Recovery", desc: "Maximize resource utilization" },
    { value: "35%", label: "Cost Reduction", desc: "Long-term operational savings" }
  ];

  return (
    <section className="py-20 bg-gradient-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Why Circular Economy Matters
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform linear take-make-dispose models into regenerative systems 
            that benefit both business and environment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden shadow-medium bg-gradient-card">
              <CardContent className="p-0">
                <img 
                  src={circularEconomyImage} 
                  alt="Circular economy for metals" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Closed-Loop Metal Production</h3>
                  
                  {/* Process Flow */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                    {stages.map((stage, index) => {
                      const Icon = stage.icon;
                      return (
                        <div key={index} className="flex items-center">
                          <div className={`p-2 rounded-full bg-background shadow-sm ${stage.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-medium ml-2 mr-3">{stage.label}</span>
                          {index < stages.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Recycle className="h-4 w-4" />
                      Continuous Material Flow
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center p-6 bg-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-primary mb-2">{benefit.value}</div>
                    <div className="font-semibold text-foreground mb-1">{benefit.label}</div>
                    <div className="text-sm text-muted-foreground">{benefit.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <Card className="p-6 bg-gradient-hero text-white">
                <CardContent className="p-0">
                  <h4 className="text-xl font-semibold mb-3">The Circular Advantage</h4>
                  <p className="text-white/90 mb-4">
                    By implementing circular economy principles, metal producers can:
                  </p>
                  <ul className="space-y-2 text-white/90">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                      Reduce dependency on virgin materials
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                      Minimize waste and environmental impact
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                      Create new revenue streams
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                      Meet sustainability regulations
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};