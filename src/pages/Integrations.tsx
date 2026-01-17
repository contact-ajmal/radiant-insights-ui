import {
  Plug,
  Server,
  Database,
  FileText,
  Building2,
  CheckCircle2,
  XCircle,
  Settings,
  ArrowRight,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const integrations = [
  {
    id: "pacs",
    name: "PACS",
    description: "Picture Archiving and Communication System",
    icon: Server,
    status: "connected",
    details: "Syncing with hospital PACS server",
  },
  {
    id: "ris",
    name: "RIS",
    description: "Radiology Information System",
    icon: Database,
    status: "connected",
    details: "Receiving worklist and patient data",
  },
  {
    id: "ehr",
    name: "EHR",
    description: "Electronic Health Records",
    icon: FileText,
    status: "disconnected",
    details: "Connect to access patient history",
  },
  {
    id: "hl7",
    name: "HL7 / FHIR",
    description: "Healthcare interoperability standards",
    icon: Link2,
    status: "connected",
    details: "HL7 v2.5 and FHIR R4 enabled",
  },
  {
    id: "hospital",
    name: "Hospital Systems",
    description: "Internal hospital infrastructure",
    icon: Building2,
    status: "pending",
    details: "Configuration in progress",
  },
];

export default function Integrations() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
            <Plug className="w-7 h-7 text-accent" />
            Integrations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect RadiantAI with your healthcare systems
          </p>
        </div>
        <Button className="gap-2">
          <Plug className="w-4 h-4" />
          Add Integration
        </Button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className={cn(
              "transition-all hover:shadow-lg cursor-pointer",
              integration.status === "connected" && "border-status-success/30",
              integration.status === "pending" && "border-status-warning/30"
            )}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    integration.status === "connected"
                      ? "bg-status-success/10"
                      : integration.status === "pending"
                      ? "bg-status-warning/10"
                      : "bg-secondary"
                  )}
                >
                  <integration.icon
                    className={cn(
                      "w-6 h-6",
                      integration.status === "connected"
                        ? "text-status-success"
                        : integration.status === "pending"
                        ? "text-status-warning"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <Badge
                  className={cn(
                    "capitalize",
                    integration.status === "connected"
                      ? "bg-status-success/10 text-status-success border-status-success/20"
                      : integration.status === "pending"
                      ? "bg-status-warning/10 text-status-warning border-status-warning/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {integration.status === "connected" && (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  )}
                  {integration.status === "disconnected" && <XCircle className="w-3 h-3 mr-1" />}
                  {integration.status}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-4">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{integration.details}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant={integration.status === "disconnected" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    integration.status === "disconnected" && "bg-accent hover:bg-accent/90"
                  )}
                >
                  {integration.status === "disconnected" ? (
                    <>
                      Connect
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Configure
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Info */}
      <Card className="bg-secondary/30 border-dashed">
        <CardContent className="py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
              <Link2 className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Need a custom integration?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              RadiantAI supports custom integrations with your existing healthcare infrastructure.
              Contact our team for enterprise integration solutions.
            </p>
            <Button variant="outline" className="gap-2">
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
