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
  Loader2,
  Pencil,
  Trash2,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from "@/hooks/useAPI";
import { toast } from "sonner";

// Helper function to calculate age from date of birth
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "unknown",
    contact_phone: "",
    contact_email: "",
  });
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "unknown",
    contact_phone: "",
    contact_email: "",
  });

  const { data: patientsData, isLoading, isError } = usePatients();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const patients = (patientsData || []) as any[];

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient: any) =>
    `${patient.first_name} ${patient.last_name} ${patient.patient_id}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatient.mutateAsync(formData);
      toast.success("Patient created successfully!");
      setShowCreateDialog(false);
      setFormData({
        patient_id: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "unknown",
        contact_phone: "",
        contact_email: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create patient");
    }
  };

  const handleEditPatient = (patient: any) => {
    setSelectedPatient(patient);
    setEditFormData({
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : "",
      gender: patient.gender || "unknown",
      contact_phone: patient.contact_phone || "",
      contact_email: patient.contact_email || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      // Filter out empty strings - only send fields with actual values
      const cleanedData: Record<string, any> = {};
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          cleanedData[key] = value;
        }
      });
      await updatePatient.mutateAsync({ id: selectedPatient.id, data: cleanedData });
      toast.success("Patient updated successfully!");
      setShowEditDialog(false);
      setSelectedPatient(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update patient");
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    try {
      await deletePatient.mutateAsync(selectedPatient.id);
      toast.success("Patient deleted successfully!");
      setShowDeleteDialog(false);
      setSelectedPatient(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete patient");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-destructive">Failed to load patients</p>
          <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

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
        <Button
          className="gap-2 bg-primary hover:bg-primary/90"
          onClick={() => setShowCreateDialog(true)}
        >
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
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No patients match your search" : "No patients found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient: any) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer hover:bg-secondary/50"
                      onClick={() => setShowProfile(true)}
                    >
                      <TableCell className="font-mono text-sm">{patient.patient_id}</TableCell>
                      <TableCell className="font-medium">{patient.first_name} {patient.last_name}</TableCell>
                      <TableCell>{calculateAge(patient.date_of_birth)}</TableCell>
                      <TableCell>{patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'U'}</TableCell>
                      <TableCell>{patient.updated_at ? new Date(patient.updated_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{patient.study_count || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-status-success/10 text-status-success border-status-success/20">
                          Active
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); setShowProfile(true); }}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPatient(patient); }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Patient
                            </DropdownMenuItem>
                            <DropdownMenuItem>Create Study</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); setShowDeleteDialog(true); }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Patient
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === "study"
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

      {/* Create Patient Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter patient information to create a new record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePatient}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_id">Patient ID *</Label>
                  <Input
                    id="patient_id"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    placeholder="P001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="patient@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPatient.isPending}>
                {createPatient.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Patient"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Update patient information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePatient}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                  <Input
                    id="edit_date_of_birth"
                    type="date"
                    value={editFormData.date_of_birth}
                    onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_gender">Gender</Label>
                  <select
                    id="edit_gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_contact_phone">Phone</Label>
                  <Input
                    id="edit_contact_phone"
                    value={editFormData.contact_phone}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_contact_email">Email</Label>
                  <Input
                    id="edit_contact_email"
                    type="email"
                    value={editFormData.contact_email}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_email: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePatient.isPending}>
                {updatePatient.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPatient?.first_name} {selectedPatient?.last_name}?
              This action cannot be undone and will remove all associated studies and reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePatient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePatient.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
