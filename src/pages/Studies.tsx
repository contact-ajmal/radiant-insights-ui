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
  Loader2,
  X,
  Eye,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients, useUploadStudy, useStudies } from "@/hooks/useAPI";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Studies() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [attachPrior, setAttachPrior] = useState(false);
  const [studyDescription, setStudyDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: patientsData } = usePatients();
  const { data: studiesData, isLoading: studiesLoading } = useStudies({ limit: 5 });
  const uploadStudy = useUploadStudy();

  const patients = patientsData || [];
  const recentStudies = studiesData || [];
  const hasFile = selectedFiles.length > 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedPatientId) {
      toast.error("Please select a patient");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select DICOM files");
      return;
    }

    setUploading(true);
    try {
      await uploadStudy.mutateAsync({
        patientId: selectedPatientId,
        files: selectedFiles,
      });
      toast.success("Study uploaded successfully!");
      setSelectedFiles([]);
      setStudyDescription("");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

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
              <div className="space-y-4">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="patient">Select Patient *</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient..." />
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

                {/* File Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${hasFile
                      ? "border-status-success bg-status-success/5"
                      : "border-border hover:border-accent hover:bg-accent/5"
                    }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  {hasFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-status-success/10 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-status-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{selectedFiles.length} file(s) selected</p>
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded">
                              <span className="truncate flex-1">{file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 ml-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(index);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Add More Files
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
                      <p className="text-xs text-muted-foreground">
                        Supports: .dcm, .dicom, .zip (DICOM archive)
                      </p>
                    </div>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".dcm,.dicom,.zip"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
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
                <Label htmlFor="indication">Study Description (Optional)</Label>
                <Textarea
                  id="indication"
                  value={studyDescription}
                  onChange={(e) => setStudyDescription(e.target.value)}
                  placeholder="Enter study description, clinical indication, or notes..."
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
                disabled={!hasFile || !selectedPatientId || uploading}
                onClick={handleUpload}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading Study...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Upload & Process Study
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                {uploading ? "Processing DICOM files..." : "Study will be processed by MedGemma"}
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

      {/* Recent Studies Section */}
      <Card className="mt-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Recent Studies
              </CardTitle>
              <CardDescription>Recently uploaded studies</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/archive')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {studiesLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading studies...</p>
            </div>
          ) : recentStudies.length === 0 ? (
            <div className="text-center py-8">
              <FileImage className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No studies uploaded yet</p>
              <p className="text-xs text-muted-foreground">Upload a DICOM study to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Study ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Modality</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentStudies.map((study: any) => (
                  <TableRow
                    key={study.id}
                    className="cursor-pointer hover:bg-secondary/50"
                    onClick={() => navigate(`/viewer/${study.id}`)}
                  >
                    <TableCell className="font-mono text-sm">{study.study_id || study.id}</TableCell>
                    <TableCell>{study.patient_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                        {study.modality || 'CT'}
                      </Badge>
                    </TableCell>
                    <TableCell>{study.study_date?.split('T')[0] || 'N/A'}</TableCell>
                    <TableCell>
                      {study.status === 'completed' ? (
                        <div className="flex items-center gap-1.5 text-status-success">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs">Ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-status-warning">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Processing</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => navigate(`/viewer/${study.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
