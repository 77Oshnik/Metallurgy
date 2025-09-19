'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import MiningStageForm from '@/components/stages/MiningStageForm';
import ConcentrationStageForm from '@/components/stages/ConcentrationStageForm';
import SmeltingStageForm from '@/components/stages/SmeltingStageForm';
import FabricationStageForm from '@/components/stages/FabricationStageForm';
import UsePhaseStageForm from '@/components/stages/UsePhaseStageForm';
import EndOfLifeStageForm from '@/components/stages/EndOfLifeStageForm';
import StageResults from '@/components/stages/StageResults';

interface Project {
  _id: string;
  ProjectName: string;
  FunctionalUnitMassTonnes: number;
  MetalType: string;
  ProcessingMode: string;
}

interface StageConfig {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  apiEndpoint: string;
  required: boolean;
}

export default function WorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const [stageResults, setStageResults] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  // Define stages based on processing mode
  const getStages = (processingMode: string): StageConfig[] => {
    const baseStages: StageConfig[] = [
      {
        id: 'mining',
        name: 'Mining',
        description: 'Ore extraction and processing',
        component: MiningStageForm,
        apiEndpoint: `/api/mining/${projectId}`,
        required: true
      },
      {
        id: 'concentration',
        name: 'Concentration',
        description: 'Ore beneficiation and flotation',
        component: ConcentrationStageForm,
        apiEndpoint: `/api/concentration/${projectId}`,
        required: true
      },
      {
        id: 'smelting',
        name: 'Smelting',
        description: 'Metal extraction and refining',
        component: SmeltingStageForm,
        apiEndpoint: `/api/smelting/${projectId}`,
        required: true
      },
      {
        id: 'fabrication',
        name: 'Fabrication',
        description: 'Product manufacturing',
        component: FabricationStageForm,
        apiEndpoint: `/api/fabrication/${projectId}`,
        required: true
      },
      {
        id: 'usePhase',
        name: 'Use Phase',
        description: 'Product lifetime and operation',
        component: UsePhaseStageForm,
        apiEndpoint: `/api/use-phase/${projectId}`,
        required: true
      }
    ];

    if (processingMode === 'Circular') {
      baseStages.push({
        id: 'endOfLife',
        name: 'End-of-Life',
        description: 'Recycling and disposal',
        component: EndOfLifeStageForm,
        apiEndpoint: `/api/end-of-life/${projectId}`,
        required: true
      });
    }

    return baseStages;
  };

  const [stages, setStages] = useState<StageConfig[]>([]);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      setStages(getStages(project.ProcessingMode));
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const result = await response.json();
      setProject(result.project);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStageComplete = (stageIndex: number, results: any) => {
    setCompletedStages(prev => new Set([...prev, stageIndex]));
    setStageResults(prev => ({ ...prev, [stageIndex]: results }));
    
    toast({
      title: "Stage Completed",
      description: `${stages[stageIndex].name} stage completed successfully`,
    });

    // Auto-advance to next stage if available
    if (stageIndex < stages.length - 1) {
      setCurrentStage(stageIndex + 1);
    }
  };

  const handleFinishWorkflow = () => {
    router.push(`/projects/${projectId}/results`);
  };

  const canProceedToStage = (stageIndex: number) => {
    // First stage (mining) is always available
    if (stageIndex === 0) return true;
    
    // For dependent stages, check if previous required stage is completed
    const stage = stages[stageIndex];
    if (stage.id === 'concentration') {
      // Concentration requires mining to be completed
      return completedStages.has(0);
    }
    if (stage.id === 'smelting') {
      // Smelting requires concentration to be completed
      return completedStages.has(1);
    }
    if (stage.id === 'fabrication') {
      // Fabrication requires smelting to be completed
      return completedStages.has(2);
    }
    
    // Use phase and end-of-life can be done independently after fabrication
    if (stage.id === 'usePhase' || stage.id === 'endOfLife') {
      return completedStages.has(3); // Fabrication completed
    }
    
    return false;
  };

  const progress = (completedStages.size / stages.length) * 100;
  const allStagesCompleted = completedStages.size === stages.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const CurrentStageComponent = stages[currentStage]?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.ProjectName}</h1>
                <p className="text-sm text-gray-500">
                  {project.MetalType} • {project.ProcessingMode} • {project.FunctionalUnitMassTonnes} tonnes
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-lg font-semibold">{completedStages.size}/{stages.length} stages</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Stage Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Progress</CardTitle>
                <Progress value={progress} className="w-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      currentStage === index
                        ? 'bg-blue-50 border border-blue-200'
                        : canProceedToStage(index)
                        ? 'hover:bg-gray-50'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canProceedToStage(index) && setCurrentStage(index)}
                  >
                    {completedStages.has(index) ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{stage.name}</p>
                      <p className="text-xs text-gray-500">{stage.description}</p>
                      {!canProceedToStage(index) && index > 0 && (
                        <p className="text-xs text-red-500">Complete previous stages first</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {allStagesCompleted && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <Button onClick={handleFinishWorkflow} className="w-full">
                    View Complete Results
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content - Current Stage */}
          <div className="lg:col-span-3">
            {CurrentStageComponent && canProceedToStage(currentStage) ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{stages[currentStage].name} Stage</CardTitle>
                    <CardDescription>{stages[currentStage].description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CurrentStageComponent
                      projectId={projectId}
                      project={project}
                      onComplete={(results: any) => handleStageComplete(currentStage, results)}
                      apiEndpoint={stages[currentStage].apiEndpoint}
                    />
                  </CardContent>
                </Card>

                {/* Show results if stage is completed */}
                {completedStages.has(currentStage) && stageResults[currentStage] && (
                  <StageResults
                    stageName={stages[currentStage].name}
                    results={stageResults[currentStage]}
                  />
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Circle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Complete Previous Stages First
                  </h3>
                  <p className="text-gray-500 mb-4">
                    You need to complete the previous stages before accessing {stages[currentStage]?.name}.
                  </p>
                  <Button 
                    onClick={() => setCurrentStage(0)}
                    variant="outline"
                  >
                    Go to Mining Stage
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}