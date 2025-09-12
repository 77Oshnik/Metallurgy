'use client';

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DataInputForm } from "@/components/dashboard/DataInputForm";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function DashboardDataInput() {
  const router = useRouter();

  const handleFormComplete = (data: any) => {
    console.log("LCA Data:", data);
    toast({
      title: "Assessment Complete!",
      description: "Your LCA data has been processed successfully.",
    });
    router.push("/dashboard/results");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold mb-2">New LCA Assessment</h1>
          <p className="text-muted-foreground">
            Complete the multi-step form to analyze your metal production lifecycle.
          </p>
        </div>
        
        <DataInputForm onComplete={handleFormComplete} />
      </div>
    </DashboardLayout>
  );
}
