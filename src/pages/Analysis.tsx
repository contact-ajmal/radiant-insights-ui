import { useState } from "react";
import {
  Brain,
  Play,
  Settings2,
  Cpu,
  HardDrive,
  Gauge,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  CircleDot,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const analysisOptions = [
  { id: "nodules", label: "Pulmonary Nodules", description: "Detect and measure lung nodules" },
  { id: "fractures", label: "Fractures", description: "Identify bone fractures and abnormalities" },
  { id: "lesions", label: "Lesions", description: "Detect soft tissue lesions" },
  { id: "anomalies", label: "General Anomalies", description: "Comprehensive anomaly detection" },
];

const analysisSteps = [
  { id: 1, label: "Image Preprocessing", description: "Normalizing DICOM data" },
  { id: 2, label: "Feature Extraction", description: "Analyzing image features" },
  { id: 3, label: "MedGemma Multimodal Reasoning", description: "AI inference in progress" },
  { id: 4, label: "Report Generation", description: "Compiling findings" },
];

export default function Analysis() {
  const [selectedOptions, setSelectedOptions] = useState(["nodules", "lesions", "anomalies"]);
  const [comparePrior, setComparePrior] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const runAnalysis = () => {
    setIsRunning(true);
    setCurrentStep(1);
    setProgress(0);

    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Simulate step progression
    let step = 1;
    const stepInterval = setInterval(() => {
      step += 1;
      setCurrentStep(step);
      if (step > 4) {
        clearInterval(stepInterval);
        setTimeout(() => {
          setIsRunning(false);
        }, 500);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
            <Brain className="w-7 h-7 text-accent" />
            MedGemma Analysis
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure and run AI-powered radiology analysis
          </p>
        </div>
        <Badge className="bg-status-success/10 text-status-success border-status-success/20 gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
          MedGemma Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-accent" />
                Analysis Configuration
              </CardTitle>
              <CardDescription>Select the findings to evaluate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {analysisOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                      selectedOptions.includes(option.id)
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    )}
                    onClick={() => toggleOption(option.id)}
                  >
                    <Checkbox
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => toggleOption(option.id)}
                    />
                    <div>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Compare with Prior Scans</p>
                    <p className="text-xs text-muted-foreground">Enable temporal analysis</p>
                  </div>
                </div>
                <Switch checked={comparePrior} onCheckedChange={setComparePrior} />
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Analysis Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Steps */}
              <div className="space-y-3">
                {analysisSteps.map((step) => {
                  const isActive = currentStep === step.id;
                  const isComplete = currentStep > step.id;
                  const isPending = currentStep < step.id;

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "progress-step",
                        isActive && "progress-step-active",
                        isComplete && "progress-step-complete"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                          isComplete && "bg-status-success/10",
                          isActive && "bg-accent/10",
                          isPending && "bg-secondary"
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-status-success" />
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-accent animate-spin" />
                        ) : (
                          <CircleDot className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-medium text-sm",
                            isComplete && "text-status-success",
                            isActive && "text-accent",
                            isPending && "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      {isActive && (
                        <span className="text-xs text-accent animate-pulse">Processing...</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Live Messages */}
              {isRunning && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-mono text-primary/80">
                    {currentStep === 1 && "Loading DICOM series... 256 slices detected"}
                    {currentStep === 2 && "Extracting radiomics features from volume..."}
                    {currentStep === 3 && "MedGemma inference: analyzing multimodal data..."}
                    {currentStep === 4 && "Generating structured findings report..."}
                  </p>
                </div>
              )}

              <Button
                className="w-full gap-2 bg-accent hover:bg-accent/90"
                size="lg"
                onClick={runAnalysis}
                disabled={isRunning || selectedOptions.length === 0}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analysis in Progress...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run MedGemma Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hardware & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hardware Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">GPU Utilization</span>
                  </div>
                  <span className="text-sm font-medium">{isRunning ? "87%" : "12%"}</span>
                </div>
                <Progress value={isRunning ? 87 : 12} className="h-1.5" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">VRAM Usage</span>
                  </div>
                  <span className="text-sm font-medium">{isRunning ? "14.2 GB" : "2.1 GB"}</span>
                </div>
                <Progress value={isRunning ? 71 : 10} className="h-1.5" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Temperature</span>
                  </div>
                  <span className="text-sm font-medium">{isRunning ? "72°C" : "45°C"}</span>
                </div>
                <Progress value={isRunning ? 72 : 45} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Study</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium">John Smith</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modality</span>
                <Badge className="bg-accent/10 text-accent border-accent/20">CT</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Body Part</span>
                <span className="font-medium">Chest</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slices</span>
                <span className="font-medium">256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Time</span>
                <span className="font-medium">~2 min</span>
              </div>
            </CardContent>
          </Card>

          <div className="disclaimer-banner flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              AI-assisted analysis using MedGemma. Final interpretation requires a licensed
              radiologist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
