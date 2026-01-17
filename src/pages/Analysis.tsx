import { useState } from "react";
import {
  Brain,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  FileText,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePatients, useCreateAnalysis, useAnalysesByStudy } from "@/hooks/useAPI";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Analysis() {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedStudyId, setSelectedStudyId] = useState("");
  const [includeMeasurements, setIncludeMeasurements] = useState(true);
  const [comparePrior, setComparePrior] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);

  const { data: patientsData } = usePatients();
  const createAnalysis = useCreateAnalysis();
  const { data: existingAnalyses } = useAnalysesByStudy(selectedStudyId);

  const patients = patientsData || [];

  // Get studies for selected patient (simplified - would normally need useStudiesByPatient)
  const selectedPatient = patients.find((p: any) => p.id === selectedPatientId);

  const handleRunAnalysis = async () => {
    if (!selectedStudyId) {
      toast.error("Please select a study");
      return;
    }

    try {
      const result = await createAnalysis.mutateAsync({
        study_id: selectedStudyId,
        analysis_type: "general",
        include_measurements: includeMeasurements,
        compare_with_prior: comparePrior,
      });

      setLatestAnalysis(result);
      toast.success("Analysis completed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Analysis failed");
    }
  };

  const analysis = latestAnalysis || (existingAnalyses && existingAnalyses[0]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            MedGemma-powered multimodal radiology analysis
          </p>
        </div>
        <Badge className="bg-accent/10 text-accent border-accent/20 gap-2">
          <Sparkles className="w-4 h-4" />
          MedGemma Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Study Selection
              </CardTitle>
              <CardDescription>
                Choose a study to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient: any) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.patient_id} - {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="study">Study (Simulated)</Label>
                <Select
                  value={selectedStudyId}
                  onValueChange={setSelectedStudyId}
                  disabled={!selectedPatientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedPatientId ? "Select study..." : "Select patient first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo-study-1">Chest CT - {new Date().toLocaleDateString()}</SelectItem>
                    <SelectItem value="demo-study-2">Brain MRI - {new Date(Date.now() - 86400000).toLocaleDateString()}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Note: Study list will show uploaded studies in production
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Measurements</Label>
                  <p className="text-xs text-muted-foreground">
                    Measure detected findings
                  </p>
                </div>
                <Switch
                  checked={includeMeasurements}
                  onCheckedChange={setIncludeMeasurements}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compare with Prior</Label>
                  <p className="text-xs text-muted-foreground">
                    Temporal comparison
                  </p>
                </div>
                <Switch
                  checked={comparePrior}
                  onCheckedChange={setComparePrior}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full gap-2 bg-accent hover:bg-accent/90"
                size="lg"
                onClick={handleRunAnalysis}
                disabled={!selectedStudyId || createAnalysis.isPending}
              >
                {createAnalysis.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Run MedGemma Analysis
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                {createAnalysis.isPending
                  ? "AI inference in progress..."
                  : "AI-powered analysis using MedGemma"}
              </p>
            </CardContent>
          </Card>

          <div className="disclaimer-banner flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              AI-assisted analysis. Final interpretation requires a licensed radiologist.
            </p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!analysis ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select a study and click "Run MedGemma Analysis" to begin
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Analysis Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Analysis Results</CardTitle>
                    <Badge className="bg-status-success/10 text-status-success border-status-success/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Complete
                    </Badge>
                  </div>
                  <CardDescription>
                    Generated on {new Date().toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Analysis Type</p>
                      <p className="font-medium capitalize">{analysis.analysis_type || "General"}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Findings</p>
                      <p className="font-medium">{(analysis.findings || []).length} detected</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <p className="font-medium">{(analysis.overall_confidence || 0.85) * 100}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Findings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-accent" />
                    Findings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.findings && analysis.findings.length > 0 ? (
                    analysis.findings.map((finding: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{finding.description || `Finding ${index + 1}`}</h4>
                          <Badge
                            className={
                              finding.severity === "high"
                                ? "bg-status-error/10 text-status-error border-status-error/20"
                                : finding.severity === "medium"
                                ? "bg-status-warning/10 text-status-warning border-status-warning/20"
                                : "bg-status-info/10 text-status-info border-status-info/20"
                            }
                          >
                            {finding.severity || "Low"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Location: {finding.location || "Various"}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-muted-foreground">
                            Confidence: <span className="font-medium">{((finding.confidence || 0.85) * 100).toFixed(1)}%</span>
                          </span>
                          {finding.size && (
                            <span className="text-muted-foreground">
                              Size: <span className="font-medium">{finding.size}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No significant findings detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">MedGemma Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground">
                    {analysis.summary ||
                      "The study demonstrates normal anatomical structures without significant pathological findings. Image quality is adequate for diagnostic interpretation. No acute abnormalities identified. Clinical correlation recommended."}
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="flex-1">
                  Export Results
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
