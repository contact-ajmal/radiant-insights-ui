import {
  Activity,
  Brain,
  FileText,
  Clock,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentReports = [
  { id: "RPT-001", patient: "John Smith", study: "Chest CT", status: "complete", time: "2 hours ago" },
  { id: "RPT-002", patient: "Maria Garcia", study: "Brain MRI", status: "pending", time: "3 hours ago" },
  { id: "RPT-003", patient: "Robert Johnson", study: "Abdominal CT", status: "complete", time: "5 hours ago" },
  { id: "RPT-004", patient: "Sarah Williams", study: "Spine MRI", status: "review", time: "6 hours ago" },
];

const systemHealth = [
  { label: "MedGemma Engine", status: "online" as const, icon: Brain },
  { label: "DICOM Server", status: "online" as const, icon: Server },
  { label: "Local Storage", status: "online" as const, icon: HardDrive },
  { label: "GPU Inference", status: "online" as const, icon: Cpu },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, Dr. Chen. Here's your radiology overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusIndicator status="online" label="All Systems Operational" icon={CheckCircle2} />
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Brain className="w-4 h-4" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Studies"
          value={24}
          subtitle="8 require attention"
          icon={Activity}
          trend={{ value: 12, label: "this week" }}
        />
        <StatCard
          title="Pending Analyses"
          value={7}
          subtitle="Est. 15 min total"
          icon={Brain}
          variant="accent"
        />
        <StatCard
          title="Reports Generated"
          value={156}
          subtitle="This month"
          icon={FileText}
          trend={{ value: 23, label: "vs last month" }}
          variant="success"
        />
        <StatCard
          title="Avg. Processing Time"
          value="2.4 min"
          subtitle="Per study"
          icon={Clock}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Recent Reports</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-accent">
              View all
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {report.patient}
                      </p>
                      <p className="text-sm text-muted-foreground">{report.study}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        report.status === "complete"
                          ? "default"
                          : report.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        report.status === "complete"
                          ? "bg-status-success/10 text-status-success border-status-success/20"
                          : report.status === "pending"
                          ? "bg-status-warning/10 text-status-warning border-status-warning/20"
                          : "bg-status-info/10 text-status-info border-status-info/20"
                      }
                    >
                      {report.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{report.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health & Sync Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemHealth.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <StatusIndicator status={item.status} label="Online" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Offline Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last synced</span>
                  <span className="text-sm font-medium">5 minutes ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending uploads</span>
                  <Badge variant="secondary">3 studies</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Local storage</span>
                  <span className="text-sm font-medium">42.5 GB / 500 GB</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="w-[8.5%] h-full bg-accent rounded-full" />
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <Wifi className="w-4 h-4" />
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
