import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Download,
  FileText,
  FileJson,
  FileImage,
  Search,
  Filter,
  Cloud,
  HardDrive,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { cn } from "@/lib/utils";
import { useStudies } from "@/hooks/useAPI";

// Mock data as fallback when API returns empty
const mockStudies = [
  {
    id: "demo-1",
    study_id: "STD-001",
    patient_name: "John Smith",
    modality: "CT",
    body_part: "Chest",
    study_date: "2024-01-15",
    status: "completed",
    has_report: true,
  },
  {
    id: "demo-2",
    study_id: "STD-002",
    patient_name: "Maria Garcia",
    modality: "MRI",
    body_part: "Brain",
    study_date: "2024-01-14",
    status: "completed",
    has_report: true,
  },
];

const exportFormats = [
  { id: "pdf", label: "Printable PDF", icon: FileText, description: "Standard radiology report format" },
  { id: "dicom-sr", label: "DICOM-SR", icon: FileImage, description: "DICOM Structured Report" },
  { id: "json", label: "JSON", icon: FileJson, description: "Machine-readable format" },
];

export default function ArchivePage() {
  const navigate = useNavigate();
  const { data: studiesData, isLoading } = useStudies();
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);

  // Use API data if available, otherwise show mock data
  const studies = (studiesData && studiesData.length > 0) ? studiesData : mockStudies;

  const toggleStudy = (id: string) => {
    setSelectedStudies((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedStudies.length === studies.length) {
      setSelectedStudies([]);
    } else {
      setSelectedStudies(studies.map((s: any) => s.id));
    }
  };

  const handleViewStudy = (studyId: string) => {
    navigate(`/viewer/${studyId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
            <Archive className="w-7 h-7 text-accent" />
            Export & Archive
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Export reports and manage study archives
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusIndicator status="online" label="Cloud Synced" icon={Cloud} />
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Archive */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Study Archive</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search studies..." className="pl-10" />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStudies.length === studies.length && studies.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Study ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Modality</TableHead>
                  <TableHead>Body Part</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading studies...</p>
                    </TableCell>
                  </TableRow>
                ) : studies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Archive className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">No studies in archive</p>
                      <p className="text-xs text-muted-foreground">Upload a study to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  studies.map((study: any) => (
                    <TableRow
                      key={study.id}
                      className="cursor-pointer hover:bg-secondary/50"
                      onClick={() => handleViewStudy(study.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedStudies.includes(study.id)}
                          onCheckedChange={() => toggleStudy(study.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{study.study_id || study.id}</TableCell>
                      <TableCell className="font-medium">{study.patient_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-accent/10 text-accent border-accent/20"
                        >
                          {study.modality || 'CT'}
                        </Badge>
                      </TableCell>
                      <TableCell>{study.body_part || 'Chest'}</TableCell>
                      <TableCell>{study.study_date?.split('T')[0] || study.study_date}</TableCell>
                      <TableCell>
                        {study.status === "completed" || study.status === "synced" ? (
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
                          onClick={() => handleViewStudy(study.id)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5 text-accent" />
                Export Options
              </CardTitle>
              <CardDescription>
                {selectedStudies.length > 0
                  ? `${selectedStudies.length} studies selected`
                  : "Select studies to export"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Format Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Export Format</Label>
                {exportFormats.map((format) => (
                  <div
                    key={format.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedFormat === format.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    )}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        selectedFormat === format.id ? "bg-accent/10" : "bg-secondary"
                      )}
                    >
                      <format.icon
                        className={cn(
                          "w-5 h-5",
                          selectedFormat === format.id ? "text-accent" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{format.label}</p>
                      <p className="text-xs text-muted-foreground">{format.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Include MedGemma Annotations</span>
                </div>
                <Switch checked={includeAnnotations} onCheckedChange={setIncludeAnnotations} />
              </div>

              <Button
                className="w-full gap-2 bg-accent hover:bg-accent/90"
                disabled={selectedStudies.length === 0}
              >
                <Download className="w-4 h-4" />
                Export {selectedStudies.length > 0 ? `(${selectedStudies.length})` : ""}
              </Button>
            </CardContent>
          </Card>

          {/* Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sync Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-status-success" />
                  <span className="text-sm">Cloud Storage</span>
                </div>
                <StatusIndicator status="online" label="Connected" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Local Cache</span>
                </div>
                <span className="text-sm font-medium">42.5 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Uploads</span>
                <Badge variant="secondary">3 studies</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Synced</span>
                <span className="text-sm font-medium">5 min ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
