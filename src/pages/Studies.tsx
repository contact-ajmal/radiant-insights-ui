import {
  Upload,
  FileImage,
  Info,
  Plus,
  Calendar,
  Brain,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Studies() {
  const [hasFile, setHasFile] = useState(false);
  const [attachPrior, setAttachPrior] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Study Ingestion</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload DICOM studies for MedGemma analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* DICOM Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileImage className="w-5 h-5 text-accent" />
                DICOM Upload
              </CardTitle>
              <CardDescription>
                Upload CT or MRI studies in DICOM format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  hasFile
                    ? "border-status-success bg-status-success/5"
                    : "border-border hover:border-accent hover:bg-accent/5"
                }`}
              >
                {hasFile ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-full bg-status-success/10 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-status-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Study Uploaded Successfully</p>
                      <p className="text-sm text-muted-foreground">chest_ct_20240115.dcm</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setHasFile(false)}>
                      Replace File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Drag and drop DICOM files here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse your files
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setHasFile(true)}>
                      Select Files
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Supports: .dcm, .dicom, .zip (DICOM archive)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-accent" />
                Clinical Indication
              </CardTitle>
              <CardDescription>
                Provide clinical context to improve MedGemma analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="indication">Clinical Notes</Label>
                <Textarea
                  id="indication"
                  placeholder="Enter clinical indication, symptoms, or relevant patient history..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Link2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Attach Prior Study for Comparison</p>
                    <p className="text-xs text-muted-foreground">
                      Enable temporal comparison analysis
                    </p>
                  </div>
                </div>
                <Switch checked={attachPrior} onCheckedChange={setAttachPrior} />
              </div>

              {attachPrior && (
                <div className="p-4 rounded-lg border border-dashed border-accent/40 bg-accent/5 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Select Prior Study</p>
                      <p className="text-xs text-muted-foreground">
                        Choose from patient's imaging history
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Browse
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasFile ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Modality</span>
                      <Badge className="bg-accent/10 text-accent border-accent/20">CT</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Body Part</span>
                      <span className="font-medium">Chest</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Slice Count</span>
                      <span className="font-medium">256</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Acquisition Date</span>
                      <span className="font-medium">2024-01-15</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Institution</span>
                      <span className="font-medium text-xs">Metro Hospital</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-medium">128 MB</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-status-success">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>DICOM validation passed</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileImage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Upload a study to preview metadata</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full gap-2 bg-accent hover:bg-accent/90"
                size="lg"
                disabled={!hasFile}
              >
                <Brain className="w-5 h-5" />
                Load Study for Analysis
                <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Study will be processed by MedGemma
              </p>
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
