import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Move,
  Ruler,
  Pencil,
  Crosshair,
  Brain,
  Layers,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Sun,
  Contrast,
  Box,
  Play,
  SkipBack,
  SkipForward,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStudy } from "@/hooks/useAPI";

const viewerTools = [
  { icon: Move, label: "Pan", key: "pan" },
  { icon: ZoomIn, label: "Zoom", key: "zoom" },
  { icon: Ruler, label: "Measure", key: "measure" },
  { icon: Box, label: "Volume", key: "volume" },
  { icon: Pencil, label: "Annotate", key: "annotate" },
  { icon: Crosshair, label: "Crosshairs", key: "crosshairs" },
  { icon: RotateCw, label: "Rotate", key: "rotate" },
];

const thumbnails = Array.from({ length: 12 }, (_, i) => i + 1);

export default function Viewer() {
  const { studyId } = useParams<{ studyId: string }>();
  const { data: study, isLoading } = useStudy(studyId || "");
  const isDemoMode = !studyId;

  const [activeTool, setActiveTool] = useState("pan");
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [currentSlice, setCurrentSlice] = useState(128);
  const [windowLevel, setWindowLevel] = useState([50]);
  const [windowWidth, setWindowWidth] = useState([400]);

  // Show loading state when fetching study
  if (studyId && isLoading) {
    return (
      <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-accent" />
          <p className="text-sm text-muted-foreground">Loading study...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 animate-fade-in">
      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <Badge variant="secondary" className="bg-status-warning/10 text-status-warning border-status-warning/20 gap-1">
            <AlertCircle className="w-3 h-3" />
            Demo Mode - Select a study from Archive to view real data
          </Badge>
        </div>
      )}

      {/* Study Info */}
      {study && (
        <div className="absolute top-4 left-32 z-50">
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
            {(study as any).study_id || (study as any).id} - {(study as any).patient_name || 'Unknown Patient'}
          </Badge>
        </div>
      )}
      {/* Left Thumbnails */}
      <Card className="w-24 flex-shrink-0 overflow-hidden">
        <CardContent className="p-2 h-full overflow-y-auto space-y-2">
          {thumbnails.map((i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-lg bg-primary/10 border-2 cursor-pointer transition-all hover:border-accent",
                currentSlice === i * 21 ? "border-accent" : "border-transparent"
              )}
              onClick={() => setCurrentSlice(i * 21)}
            >
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-mono">
                {i * 21}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Main Viewer Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="viewer-toolbar">
            {viewerTools.map((tool) => (
              <button
                key={tool.key}
                className={cn("viewer-tool-btn", activeTool === tool.key && "viewer-tool-btn-active")}
                onClick={() => setActiveTool(tool.key)}
                title={tool.label}
              >
                <tool.icon className="w-5 h-5" />
              </button>
            ))}
            <div className="w-px h-6 bg-primary-foreground/20 mx-1" />
            <button className="viewer-tool-btn" title="Fullscreen">
              <Maximize className="w-5 h-5" />
            </button>
            <button className="viewer-tool-btn" title="Grid View">
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Switch
                id="annotations"
                checked={showAnnotations}
                onCheckedChange={setShowAnnotations}
              />
              <Label htmlFor="annotations" className="text-sm cursor-pointer flex items-center gap-2">
                <Brain className="w-4 h-4 text-accent" />
                Show MedGemma Annotations
              </Label>
            </div>
          </div>
        </div>

        {/* Viewer Grid */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          {/* Axial View */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="bg-primary/80 text-primary-foreground">
                Axial
              </Badge>
            </div>
            <div className="absolute inset-0 bg-primary flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Simulated CT Slice */}
                <div className="w-4/5 h-4/5 rounded-full bg-gradient-to-br from-primary-foreground/20 to-primary-foreground/5 relative">
                  {showAnnotations && (
                    <>
                      {/* Simulated annotation markers */}
                      <div className="absolute top-1/4 right-1/4 w-8 h-8 rounded-full border-2 border-status-warning bg-status-warning/20 flex items-center justify-center">
                        <span className="text-[10px] text-status-warning font-bold">1</span>
                      </div>
                      <div className="absolute bottom-1/3 left-1/3 w-6 h-6 rounded-full border-2 border-accent bg-accent/20 flex items-center justify-center">
                        <span className="text-[10px] text-accent font-bold">2</span>
                      </div>
                    </>
                  )}
                </div>
                {/* Crosshairs */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-accent/50" />
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-accent/50" />
                </div>
              </div>
            </div>
          </Card>

          {/* Sagittal View */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="bg-primary/80 text-primary-foreground">
                Sagittal
              </Badge>
            </div>
            <div className="absolute inset-0 bg-primary flex items-center justify-center">
              <div className="w-3/5 h-4/5 rounded-lg bg-gradient-to-br from-primary-foreground/15 to-primary-foreground/5" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-accent/50" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-accent/50" />
              </div>
            </div>
          </Card>

          {/* Coronal View */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="bg-primary/80 text-primary-foreground">
                Coronal
              </Badge>
            </div>
            <div className="absolute inset-0 bg-primary flex items-center justify-center">
              <div className="w-4/5 h-3/5 rounded-lg bg-gradient-to-br from-primary-foreground/15 to-primary-foreground/5" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-accent/50" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-accent/50" />
              </div>
            </div>
          </Card>
        </div>

        {/* Slice Navigation */}
        <Card className="p-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Play className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Slice</span>
                <span className="font-mono font-medium">{currentSlice} / 256</span>
              </div>
              <Slider
                value={[currentSlice]}
                onValueChange={(v) => setCurrentSlice(v[0])}
                max={256}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="w-px h-8 bg-border" />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <div className="w-24">
                  <Slider value={windowLevel} onValueChange={setWindowLevel} max={100} />
                </div>
                <span className="text-xs text-muted-foreground w-8">{windowLevel[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Contrast className="w-4 h-4 text-muted-foreground" />
                <div className="w-24">
                  <Slider value={windowWidth} onValueChange={setWindowWidth} max={1000} />
                </div>
                <span className="text-xs text-muted-foreground w-10">{windowWidth[0]}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Panel - Annotations */}
      {showAnnotations && (
        <Card className="w-72 flex-shrink-0 animate-slide-in-right">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent" />
              MedGemma Findings
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-status-warning/30 bg-status-warning/5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-status-warning/10 text-status-warning border-status-warning/20">
                    #1
                  </Badge>
                  <span className="text-sm font-medium">Pulmonary Nodule</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Location: Right upper lobe</p>
                  <p>Size: 8mm × 6mm</p>
                  <p>Confidence: 94%</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-accent/30 bg-accent/5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-accent/10 text-accent border-accent/20">#2</Badge>
                  <span className="text-sm font-medium">Lymph Node</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Location: Mediastinal</p>
                  <p>Size: 12mm</p>
                  <p>Confidence: 87%</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full gap-2" variant="outline">
                <Layers className="w-4 h-4" />
                View All Annotations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
