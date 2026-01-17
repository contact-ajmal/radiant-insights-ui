import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  RefreshCw,
  Download,
  AlertCircle,
  ChevronRight,
  Edit3,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const structuredFindings = [
  {
    organ: "Lungs",
    findings: [
      {
        name: "Right Upper Lobe Nodule",
        size: "8mm × 6mm",
        change: "new",
        confidence: 94,
        severity: "moderate",
      },
      {
        name: "Ground-glass Opacity",
        size: "12mm",
        change: "stable",
        confidence: 88,
        severity: "low",
      },
    ],
  },
  {
    organ: "Mediastinum",
    findings: [
      {
        name: "Lymph Node Enlargement",
        size: "15mm",
        change: "increased",
        confidence: 91,
        severity: "moderate",
      },
    ],
  },
  {
    organ: "Heart",
    findings: [
      {
        name: "Cardiomegaly",
        size: "CTR 0.58",
        change: "stable",
        confidence: 95,
        severity: "low",
      },
    ],
  },
];

const narrativeReport = `CHEST CT WITH CONTRAST

CLINICAL INDICATION:
Routine screening, history of smoking

TECHNIQUE:
CT of the chest was performed with intravenous contrast. Axial images were obtained from the thoracic inlet to the upper abdomen.

COMPARISON:
Prior CT chest dated 2023-06-15

FINDINGS:

LUNGS AND AIRWAYS:
[AI-DETECTED] There is an 8mm solid nodule in the right upper lobe, which is new compared to the prior study. A 12mm ground-glass opacity is noted in the left lower lobe, unchanged from prior.

MEDIASTINUM AND HILA:
[AI-DETECTED] Mediastinal lymph nodes are mildly enlarged, measuring up to 15mm in short axis, increased from 10mm on prior study.

HEART AND GREAT VESSELS:
Mild cardiomegaly with cardiothoracic ratio of 0.58. No pericardial effusion.

BONES AND SOFT TISSUES:
No suspicious osseous lesions. Soft tissues are unremarkable.

IMPRESSION:
1. New 8mm solid nodule in the right upper lobe - recommend follow-up CT in 3 months per Lung-RADS guidelines.
2. Mild mediastinal lymphadenopathy, slightly increased - clinical correlation recommended.
3. Stable ground-glass opacity in the left lower lobe.
4. Mild cardiomegaly, stable.`;

export default function Reports() {
  const [reportText, setReportText] = useState(narrativeReport);
  const [isEditing, setIsEditing] = useState(false);

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "increased":
        return <TrendingUp className="w-4 h-4 text-status-warning" />;
      case "decreased":
        return <TrendingDown className="w-4 h-4 text-status-success" />;
      case "new":
        return <Sparkles className="w-4 h-4 text-status-error" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-status-error/10 text-status-error border-status-error/20";
      case "moderate":
        return "bg-status-warning/10 text-status-warning border-status-warning/20";
      default:
        return "bg-status-info/10 text-status-info border-status-info/20";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Report Review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve AI-generated radiology reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Re-analyze
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2 bg-status-success hover:bg-status-success/90">
            <CheckCircle2 className="w-4 h-4" />
            Approve Report
          </Button>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="disclaimer-banner flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="flex-1">
          <strong>AI-Assisted Analysis:</strong> This report was generated using MedGemma multimodal AI.
          Final interpretation and approval requires a licensed radiologist. Highlighted sections indicate
          AI-detected findings.
        </p>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Structured Findings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-accent" />
              Structured Findings
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-xs">
              PT-001 | John Smith
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {structuredFindings.map((section) => (
              <div key={section.organ} className="space-y-3">
                <h4 className="font-medium text-sm text-foreground border-b pb-2">{section.organ}</h4>
                {section.findings.map((finding, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getChangeIcon(finding.change)}
                        <span className="font-medium text-sm">{finding.name}</span>
                      </div>
                      <Badge className={cn("text-xs", getSeverityColor(finding.severity))}>
                        {finding.severity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Size</span>
                        <span className="font-medium">{finding.size}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Change</span>
                        <span className="font-medium capitalize">{finding.change}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Confidence</span>
                        <span className="font-medium">{finding.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Volume Calculations */}
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-3">Measurements Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <span className="text-xs text-muted-foreground block">Total Lung Volume</span>
                  <span className="font-semibold text-lg">5.2 L</span>
                </div>
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <span className="text-xs text-muted-foreground block">Nodule Volume</span>
                  <span className="font-semibold text-lg">0.15 cm³</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Narrative Report */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Narrative Report
            </CardTitle>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? "Save Changes" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="formatted">
              <TabsList className="mb-4">
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="raw">Raw Text</TabsTrigger>
              </TabsList>

              <TabsContent value="formatted" className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  {reportText.split("\n\n").map((paragraph, i) => (
                    <div key={i} className="mb-4">
                      {paragraph.includes("[AI-DETECTED]") ? (
                        <div className="bg-accent/5 border-l-4 border-accent p-3 rounded-r-lg">
                          <p className="text-sm whitespace-pre-wrap">
                            {paragraph.replace("[AI-DETECTED]", "")}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-accent">
                            <Brain className="w-3.5 h-3.5" />
                            <span>AI-detected finding</span>
                          </div>
                        </div>
                      ) : paragraph.match(/^[A-Z\s]+:$/) ? (
                        <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">
                          {paragraph}
                        </h3>
                      ) : (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {paragraph}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="raw">
                <Textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  className="min-h-[500px] font-mono text-xs resize-none"
                  readOnly={!isEditing}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
