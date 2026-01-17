import { useState, useEffect } from "react";
import {
  Settings,
  Cpu,
  Wifi,
  WifiOff,
  HardDrive,
  Shield,
  Clock,
  Brain,
  Server,
  AlertTriangle,
  CheckCircle2,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useConfig, useUpdateConfig } from "@/hooks/useAPI";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: config, isLoading } = useConfig();
  const updateConfig = useUpdateConfig();

  const [inferenceMode, setInferenceMode] = useState("offline");
  const [gpuMemory, setGpuMemory] = useState([80]);
  const [batchSize, setBatchSize] = useState([4]);
  const [dataRetention, setDataRetention] = useState("90");
  const [autoSync, setAutoSync] = useState(true);
  const [hipaaMode, setHipaaMode] = useState(true);

  // Load config from API
  useEffect(() => {
    if (config) {
      const cfg = config as any;
      setInferenceMode(cfg.mode || "offline");
      setAutoSync(cfg.features?.offline_sync ?? true);
    }
  }, [config]);

  const handleSaveSettings = async () => {
    try {
      await updateConfig.mutateAsync({
        mode: inferenceMode,
        features: {
          offline_sync: autoSync,
        },
      });
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
            <Settings className="w-7 h-7 text-accent" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure RadiantAI and MedGemma preferences
          </p>
        </div>
        <Button className="gap-2" onClick={handleSaveSettings} disabled={updateConfig.isPending}>
          {updateConfig.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="inference" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inference" className="gap-2">
            <Brain className="w-4 h-4" />
            Inference
          </TabsTrigger>
          <TabsTrigger value="hardware" className="gap-2">
            <Cpu className="w-4 h-4" />
            Hardware
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <HardDrive className="w-4 h-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Inference Settings */}
        <TabsContent value="inference" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mode Selection</CardTitle>
              <CardDescription>Choose between online and offline MedGemma inference</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={inferenceMode} onValueChange={setInferenceMode}>
                <div
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                    inferenceMode === "online" ? "border-accent bg-accent/5" : "border-border"
                  )}
                  onClick={() => setInferenceMode("online")}
                >
                  <RadioGroupItem value="online" id="online" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Wifi className="w-4 h-4 text-accent" />
                      <Label htmlFor="online" className="font-medium cursor-pointer">
                        Online Mode (Remote MedGemma)
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect to cloud-hosted MedGemma for faster inference and latest model updates.
                      Requires stable internet connection.
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                    inferenceMode === "offline" ? "border-accent bg-accent/5" : "border-border"
                  )}
                  onClick={() => setInferenceMode("offline")}
                >
                  <RadioGroupItem value="offline" id="offline" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <WifiOff className="w-4 h-4 text-accent" />
                      <Label htmlFor="offline" className="font-medium cursor-pointer">
                        Offline Mode (Local MedGemma)
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Run MedGemma locally on your workstation. Ideal for air-gapped environments
                      and maximum data privacy. Requires local GPU.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Configuration</CardTitle>
              <CardDescription>Fine-tune MedGemma inference parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Model Version</Label>
                  <Select defaultValue="medgemma-2b">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medgemma-2b">MedGemma 2B (Fast)</SelectItem>
                      <SelectItem value="medgemma-7b">MedGemma 7B (Balanced)</SelectItem>
                      <SelectItem value="medgemma-27b">MedGemma 27B (Accurate)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Precision</Label>
                  <Select defaultValue="fp16">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fp32">FP32 (Full Precision)</SelectItem>
                      <SelectItem value="fp16">FP16 (Half Precision)</SelectItem>
                      <SelectItem value="int8">INT8 (Quantized)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Confidence Threshold</Label>
                  <span className="text-sm font-mono">75%</span>
                </div>
                <Slider defaultValue={[75]} max={100} step={5} />
                <p className="text-xs text-muted-foreground">
                  Minimum confidence score for findings to be included in reports
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hardware Settings */}
        <TabsContent value="hardware" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GPU Configuration</CardTitle>
              <CardDescription>Configure hardware resources for local inference</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>GPU Memory Allocation</Label>
                  <span className="text-sm font-mono">{gpuMemory[0]}%</span>
                </div>
                <Slider
                  value={gpuMemory}
                  onValueChange={setGpuMemory}
                  max={100}
                  min={50}
                  step={10}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum VRAM to allocate for MedGemma inference
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Batch Size</Label>
                  <span className="text-sm font-mono">{batchSize[0]} slices</span>
                </div>
                <Slider value={batchSize} onValueChange={setBatchSize} max={16} min={1} step={1} />
                <p className="text-xs text-muted-foreground">
                  Number of image slices to process simultaneously
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Detected GPU</span>
                  </div>
                  <p className="text-lg font-semibold">NVIDIA RTX 4090</p>
                  <p className="text-xs text-muted-foreground">24 GB VRAM</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <p className="text-lg font-semibold text-status-success">Ready</p>
                  <p className="text-xs text-muted-foreground">CUDA 12.3 installed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Retention</CardTitle>
              <CardDescription>Configure how long data is stored locally</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Retention Period</Label>
                <Select value={dataRetention} onValueChange={setDataRetention}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  DICOM studies and reports older than this will be archived
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Auto-sync to Cloud</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically backup studies to cloud storage
                    </p>
                  </div>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>

              <div className="p-4 rounded-lg border border-dashed">
                <div className="flex items-start gap-3">
                  <HardDrive className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Local Storage Usage</p>
                    <p className="text-xs text-muted-foreground mb-3">42.5 GB of 500 GB used</p>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="w-[8.5%] h-full bg-accent rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Settings</CardTitle>
              <CardDescription>Configure privacy and compliance preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-status-success/5 border border-status-success/20">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-status-success" />
                  <div>
                    <p className="font-medium text-sm">HIPAA Compliance Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Enhanced encryption and audit logging
                    </p>
                  </div>
                </div>
                <Switch checked={hipaaMode} onCheckedChange={setHipaaMode} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <span className="text-sm font-medium">Data Encryption</span>
                  <span className="text-sm text-status-success font-medium">AES-256</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <span className="text-sm font-medium">Audit Logging</span>
                  <span className="text-sm text-status-success font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <span className="text-sm font-medium">PHI De-identification</span>
                  <span className="text-sm text-status-success font-medium">Automatic</span>
                </div>
              </div>

              <div className="disclaimer-banner flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  RadiantAI is designed to support HIPAA compliance, but responsibility for
                  compliance lies with the healthcare organization.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
