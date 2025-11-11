import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, CheckCircle2, XCircle, Clock, Calendar, UserCheck, Download, FileText, Image, CreditCard, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface Aspirant {
  id: string;
  full_name: string;
  matric: string;
  email: string;
  phone: string;
  department: string;
  level: string;
  dob: string;
  gender: string;
  cgpa: number;
  position_id: string;
  why_running: string;
  leadership_history: string;
  photo_url: string | null;
  payment_proof_url: string | null;
  payment_verified: boolean;
  status: string;
  admin_review_status: string;
  admin_review_notes: string | null;
  screening_scheduled_at: string | null;
  screening_result: string | null;
  screening_notes: string | null;
  conditional_acceptance: boolean;
  conditional_reason: string | null;
  resubmission_deadline: string | null;
  promoted_to_candidate: boolean;
  promoted_at: string | null;
  candidate_id: string | null;
  created_at: string;
  updated_at: string;
  aspirant_positions: { name: string; application_fee: number } | null;
}

interface AspirantStats {
  total_applications: number;
  pending_payment: number;
  payment_verified: number;
  under_review: number;
  approved: number;
  rejected: number;
  screening_scheduled: number;
  qualified: number;
  disqualified: number;
  promoted_to_candidate: number;
  by_position: Record<string, number>;
}

export function AdminAspirants() {
  const [aspirants, setAspirants] = useState<Aspirant[]>([]);
  const [filteredAspirants, setFilteredAspirants] = useState<Aspirant[]>([]);
  const [stats, setStats] = useState<AspirantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAspirant, setSelectedAspirant] = useState<Aspirant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionData, setActionData] = useState({
    payment_verified: false,
    admin_review_status: "",
    admin_review_notes: "",
    screening_scheduled_at: "",
    screening_result: "",
    screening_notes: "",
    conditional_acceptance: false,
    conditional_reason: "",
    resubmission_deadline: "",
  });
  const { toast } = useToast();

  const fetchAspirants = useCallback(async () => {
    try {
      const [aspirantsResult, statsResult] = await Promise.all([
        supabase
          .from("aspirants")
          .select(`
            *,
            aspirant_positions (
              name,
              application_fee
            )
          `)
          .order("created_at", { ascending: false }),
        supabase.rpc("get_aspirant_statistics")
      ]);

      if (aspirantsResult.error) throw aspirantsResult.error;
      if (statsResult.error) throw statsResult.error;

      setAspirants(aspirantsResult.data as unknown as Aspirant[] || []);
      setStats(statsResult.data);
    } catch (error) {
      console.error("Error fetching aspirants:", error);
      toast({
        title: "Error",
        description: "Failed to load aspirants",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAspirants();
  }, [fetchAspirants]);

  // Filter aspirants based on search and status
  useEffect(() => {
    let filtered = aspirants;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (aspirant) =>
          aspirant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aspirant.matric.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aspirant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aspirant.aspirant_positions?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((aspirant) => {
        switch (statusFilter) {
          case "pending":
            return !aspirant.payment_verified && !aspirant.promoted_to_candidate;
          case "review":
            return aspirant.payment_verified && !aspirant.screening_scheduled_at && !aspirant.promoted_to_candidate;
          case "screening":
            return aspirant.screening_scheduled_at && !aspirant.screening_result && !aspirant.promoted_to_candidate;
          case "qualified":
            return aspirant.screening_result === "qualified" && !aspirant.promoted_to_candidate;
          case "promoted":
            return aspirant.promoted_to_candidate;
          case "rejected":
            return aspirant.admin_review_status === "rejected" || aspirant.screening_result === "disqualified";
          default:
            return true;
        }
      });
    }

    setFilteredAspirants(filtered);
  }, [aspirants, searchTerm, statusFilter]);

  const openAspirantDialog = (aspirant: Aspirant) => {
    setSelectedAspirant(aspirant);
    setActionData({
      payment_verified: aspirant.payment_verified,
      admin_review_status: aspirant.admin_review_status || "",
      admin_review_notes: aspirant.admin_review_notes || "",
      screening_scheduled_at: aspirant.screening_scheduled_at ? 
        new Date(aspirant.screening_scheduled_at).toISOString().slice(0, 16) : "",
      screening_result: aspirant.screening_result || "",
      screening_notes: aspirant.screening_notes || "",
      conditional_acceptance: aspirant.conditional_acceptance,
      conditional_reason: aspirant.conditional_reason || "",
      resubmission_deadline: aspirant.resubmission_deadline ? 
        new Date(aspirant.resubmission_deadline).toISOString().slice(0, 16) : "",
    });
    setIsDialogOpen(true);
  };

  const handleUpdateAspirant = async () => {
    if (!selectedAspirant) return;

    try {
      const updateData = {
        ...actionData,
        screening_scheduled_at: actionData.screening_scheduled_at || null,
        resubmission_deadline: actionData.resubmission_deadline || null,
      };

      const { error } = await supabase
        .from("aspirants")
        .update(updateData)
        .eq("id", selectedAspirant.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Aspirant updated successfully",
      });

      setIsDialogOpen(false);
      fetchAspirants();
    } catch (error) {
      console.error("Error updating aspirant:", error);
      toast({
        title: "Error",
        description: "Failed to update aspirant",
        variant: "destructive",
      });
    }
  };

  const promoteToCandidate = async (aspirantId: string) => {
    if (!confirm("Promote this aspirant to candidate? This action cannot be undone.")) return;

    try {
      // Get aspirant details
      const { data: aspirant, error: fetchError } = await supabase
        .from("aspirants")
        .select("*, aspirant_positions(name)")
        .eq("id", aspirantId)
        .single();

      if (fetchError) throw fetchError;

      // Create candidate
      const { data: candidate, error: candidateError } = await supabase
        .from("candidates")
        .insert({
          full_name: aspirant.full_name,
          position: aspirant.aspirant_positions?.name,
          picture_url: aspirant.photo_url,
        })
        .select()
        .single();

      if (candidateError) throw candidateError;

      // Update aspirant
      const { error: updateError } = await supabase
        .from("aspirants")
        .update({
          promoted_to_candidate: true,
          promoted_at: new Date().toISOString(),
          candidate_id: candidate.id,
        })
        .eq("id", aspirantId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Aspirant promoted to candidate successfully",
      });

      fetchAspirants();
    } catch (error) {
      console.error("Error promoting aspirant:", error);
      toast({
        title: "Error",
        description: "Failed to promote aspirant",
        variant: "destructive",
      });
    }
  };

  const exportAspirantsData = async () => {
    try {
      const csvContent = [
        // CSV Header
        "Name,Matric,Email,Phone,Department,Level,CGPA,Position,Payment Verified,Review Status,Screening Result,Promoted,Application Date",
        // CSV Data
        ...filteredAspirants.map(aspirant => [
          aspirant.full_name,
          aspirant.matric,
          aspirant.email,
          aspirant.phone,
          aspirant.department,
          aspirant.level,
          aspirant.cgpa,
          aspirant.aspirant_positions?.name || "",
          aspirant.payment_verified ? "Yes" : "No",
          aspirant.admin_review_status || "Pending",
          aspirant.screening_result || "Not Screened",
          aspirant.promoted_to_candidate ? "Yes" : "No",
          new Date(aspirant.created_at).toLocaleDateString()
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aspirants_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Aspirants data exported successfully",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export aspirants data",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (aspirant: Aspirant) => {
    if (aspirant.promoted_to_candidate) {
      return <Badge className="bg-success">Promoted</Badge>;
    }
    if (aspirant.conditional_acceptance) {
      return <Badge variant="secondary">Conditional</Badge>;
    }
    if (aspirant.screening_result === "qualified") {
      return <Badge className="bg-success">Qualified</Badge>;
    }
    if (aspirant.screening_result === "disqualified") {
      return <Badge variant="destructive">Disqualified</Badge>;
    }
    if (aspirant.screening_scheduled_at) {
      return <Badge variant="default">Screening Scheduled</Badge>;
    }
    if (aspirant.admin_review_status === "approved") {
      return <Badge variant="default">Approved</Badge>;
    }
    if (aspirant.admin_review_status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (aspirant.payment_verified) {
      return <Badge className="bg-primary/80">Payment Verified</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingPayment = aspirants.filter(a => !a.payment_verified && !a.promoted_to_candidate);
  const underReview = aspirants.filter(a => a.payment_verified && !a.screening_scheduled_at && !a.promoted_to_candidate);
  const screening = aspirants.filter(a => a.screening_scheduled_at && !a.screening_result && !a.promoted_to_candidate);
  const qualified = aspirants.filter(a => a.screening_result === "qualified" && !a.promoted_to_candidate);
  const promoted = aspirants.filter(a => a.promoted_to_candidate);
  const rejected = aspirants.filter(a => a.admin_review_status === "rejected" || a.screening_result === "disqualified");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Aspirant Management</h2>
          <p className="text-muted-foreground">Manage applications, payments, screening, and candidate promotion</p>
        </div>
        <Button onClick={exportAspirantsData} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_applications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending_payment}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.under_review}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.qualified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Promoted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.promoted_to_candidate}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, matric, email, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="pending">Pending Payment</SelectItem>
            <SelectItem value="review">Under Review</SelectItem>
            <SelectItem value="screening">Screening</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="promoted">Promoted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({filteredAspirants.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingPayment.length})</TabsTrigger>
          <TabsTrigger value="review">Review ({underReview.length})</TabsTrigger>
          <TabsTrigger value="screening">Screening ({screening.length})</TabsTrigger>
          <TabsTrigger value="qualified">Qualified ({qualified.length})</TabsTrigger>
          <TabsTrigger value="promoted">Promoted ({promoted.length})</TabsTrigger>
        </TabsList>

        {[
          { value: "all", data: filteredAspirants },
          { value: "pending", data: pendingPayment },
          { value: "review", data: underReview },
          { value: "screening", data: screening },
          { value: "qualified", data: qualified },
          { value: "promoted", data: promoted },
        ].map(({ value, data }) => (
          <TabsContent key={value} value={value}>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Matric</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No aspirants in this category
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((aspirant) => (
                      <TableRow key={aspirant.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{aspirant.full_name}</div>
                            <div className="text-sm text-muted-foreground">{aspirant.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{aspirant.matric}</TableCell>
                        <TableCell>{aspirant.aspirant_positions?.name}</TableCell>
                        <TableCell>{aspirant.cgpa.toFixed(2)}</TableCell>
                        <TableCell>
                          {aspirant.payment_verified ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(aspirant)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(aspirant.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAspirantDialog(aspirant)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {aspirant.screening_result === "qualified" && !aspirant.promoted_to_candidate && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => promoteToCandidate(aspirant.id)}
                                className="bg-success hover:bg-success/90"
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Aspirant: {selectedAspirant?.full_name}</DialogTitle>
            <DialogDescription>Review application details and update status for this aspirant.</DialogDescription>
          </DialogHeader>

          {selectedAspirant && (
            <div className="space-y-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p>{selectedAspirant.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p>{selectedAspirant.phone}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Department</Label>
                      <p>{selectedAspirant.department}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Level</Label>
                      <p>{selectedAspirant.level}L</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                      <p>{new Date(selectedAspirant.dob).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Gender</Label>
                      <p>{selectedAspirant.gender}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">CGPA</Label>
                      <p>{selectedAspirant.cgpa.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Position</Label>
                      <p>{selectedAspirant.aspirant_positions?.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Application Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Why Running for Position</Label>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {selectedAspirant.why_running}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Leadership History</Label>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {selectedAspirant.leadership_history}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedAspirant.photo_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(selectedAspirant.photo_url!, '_blank')}
                        className="gap-2"
                      >
                        <Image className="w-4 h-4" />
                        View Photo
                      </Button>
                    )}
                    {selectedAspirant.payment_proof_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(selectedAspirant.payment_proof_url!, '_blank')}
                        className="gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        View Payment Proof
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Admin Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Verification */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="payment_verified"
                      checked={actionData.payment_verified}
                      onCheckedChange={(checked) => setActionData({ ...actionData, payment_verified: checked })}
                    />
                    <Label htmlFor="payment_verified">Payment Verified</Label>
                  </div>

                  {/* Admin Review */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin_review_status">Review Status</Label>
                      <Select
                        value={actionData.admin_review_status}
                        onValueChange={(v) => setActionData({ ...actionData, admin_review_status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="screening_result">Screening Result</Label>
                      <Select
                        value={actionData.screening_result}
                        onValueChange={(v) => setActionData({ ...actionData, screening_result: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_screened">Not Screened</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="disqualified">Disqualified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_review_notes">Review Notes</Label>
                    <Textarea
                      id="admin_review_notes"
                      value={actionData.admin_review_notes}
                      onChange={(e) => setActionData({ ...actionData, admin_review_notes: e.target.value })}
                      placeholder="Add notes about this application..."
                      rows={3}
                    />
                  </div>

                  {/* Screening */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="screening_scheduled_at">Screening Date</Label>
                      <Input
                        id="screening_scheduled_at"
                        type="datetime-local"
                        value={actionData.screening_scheduled_at}
                        onChange={(e) => setActionData({ ...actionData, screening_scheduled_at: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="screening_notes">Screening Notes</Label>
                    <Textarea
                      id="screening_notes"
                      value={actionData.screening_notes}
                      onChange={(e) => setActionData({ ...actionData, screening_notes: e.target.value })}
                      placeholder="Add screening notes..."
                      rows={3}
                    />
                  </div>

                  {/* Conditional Acceptance */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="conditional_acceptance"
                        checked={actionData.conditional_acceptance}
                        onCheckedChange={(checked) => setActionData({ ...actionData, conditional_acceptance: checked })}
                      />
                      <Label htmlFor="conditional_acceptance">Conditional Acceptance (Pending Resubmission)</Label>
                    </div>

                    {actionData.conditional_acceptance && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="conditional_reason">Conditional Reason</Label>
                          <Textarea
                            id="conditional_reason"
                            value={actionData.conditional_reason}
                            onChange={(e) => setActionData({ ...actionData, conditional_reason: e.target.value })}
                            placeholder="Explain what needs to be resubmitted..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resubmission_deadline">Resubmission Deadline</Label>
                          <Input
                            id="resubmission_deadline"
                            type="datetime-local"
                            value={actionData.resubmission_deadline}
                            onChange={(e) => setActionData({ ...actionData, resubmission_deadline: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAspirant}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}