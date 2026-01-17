import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  User,
  Calendar,
  Activity,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const patients = [
  { id: "PT-001", name: "John Smith", age: 65, sex: "M", lastImaging: "2024-01-15", studies: 4, status: "active" },
  { id: "PT-002", name: "Maria Garcia", age: 48, sex: "F", lastImaging: "2024-01-14", studies: 2, status: "active" },
  { id: "PT-003", name: "Robert Johnson", age: 72, sex: "M", lastImaging: "2024-01-10", studies: 7, status: "active" },
  { id: "PT-004", name: "Sarah Williams", age: 34, sex: "F", lastImaging: "2024-01-08", studies: 1, status: "pending" },
  { id: "PT-005", name: "Michael Brown", age: 56, sex: "M", lastImaging: "2024-01-05", studies: 3, status: "active" },
  { id: "PT-006", name: "Emily Davis", age: 41, sex: "F", lastImaging: "2024-01-03", studies: 2, status: "archived" },
];

const selectedPatient = {
  id: "PT-001",
  name: "John Smith",
  age: 65,
  sex: "Male",
  dob: "1959-03-15",
  mrn: "MRN-123456",
  phone: "+1 (555) 123-4567",
  email: "john.smith@email.com",
  address: "123 Medical Lane, Healthcare City, HC 12345",
  timeline: [
    { date: "2024-01-15", event: "Chest CT - Completed", type: "study" },
    { date: "2024-01-10", event: "MedGemma Analysis Report", type: "report" },
    { date: "2024-01-05", event: "Follow-up Scheduled", type: "appointment" },
    { date: "2023-12-20", event: "Abdominal CT - Completed", type: "study" },
    { date: "2023-12-15", event: "Initial Consultation", type: "appointment" },
  ],
};

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage patient records and imaging studies
          </p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Add Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <Card className={showProfile ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name or ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>Last Imaging</TableHead>
                  <TableHead>Studies</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-secondary/50"
                    onClick={() => setShowProfile(true)}
                  >
                    <TableCell className="font-mono text-sm">{patient.id}</TableCell>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.sex}</TableCell>
                    <TableCell>{patient.lastImaging}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{patient.studies}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          patient.status === "active"
                            ? "bg-status-success/10 text-status-success border-status-success/20"
                            : patient.status === "pending"
                            ? "bg-status-warning/10 text-status-warning border-status-warning/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Create Study</DropdownMenuItem>
                          <DropdownMenuItem>View Reports</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Patient Profile Panel */}
        {showProfile && (
          <Card className="animate-slide-in-right">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Patient Profile</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowProfile(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demographics */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedPatient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.sex}, {selectedPatient.age} years
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedPatient.mrn}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span className="font-medium">{selectedPatient.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{selectedPatient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-xs">{selectedPatient.email}</span>
                </div>
              </div>

              {/* Clinical Timeline */}
              <div>
                <h4 className="font-medium mb-3">Clinical History</h4>
                <div className="space-y-3">
                  {selectedPatient.timeline.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          item.type === "study"
                            ? "bg-accent/10"
                            : item.type === "report"
                            ? "bg-status-success/10"
                            : "bg-status-info/10"
                        }`}
                      >
                        {item.type === "study" ? (
                          <Activity className="w-4 h-4 text-accent" />
                        ) : item.type === "report" ? (
                          <FileText className="w-4 h-4 text-status-success" />
                        ) : (
                          <Calendar className="w-4 h-4 text-status-info" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.event}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full gap-2 bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4" />
                Create New Study
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
