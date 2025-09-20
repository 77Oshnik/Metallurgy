import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemStatement } from "@/components/landing/ProblemStatement";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CircularEconomySection } from "@/components/landing/CircularEconomySection";
import { Footer } from "@/components/landing/Footer";
import { useRouter } from "next/navigation";

const Landing = () => {
  const router = useRouter();
  
  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProblemStatement />
      <FeaturesSection />
      <CircularEconomySection />
      <Footer />
    </div>
  );
};

export default Landing;