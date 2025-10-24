import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, CheckCircle2, XCircle, Clock, Calendar, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Aspirant {
  id: string;
  full_name: string;
  matric: string;
  email: string;
  phone: string;
  department: string;
  level: string;
  cgpa: number;
  position_id: string;
  why_running: string;
  leadership_history: string;
  photo_url: string | null;
  referee_form_url: string | null;
  declaration_form_url: string | null;
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
  created_at: string;
  aspirant_positions: { name: string; application_fee: number } | null;
}

export function AdminAspirants() {
  const [aspirants, setAspirants] = useState<Aspirant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAspirant, setSelectedAspirant] = useState<Aspirant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  useEffect(() => {
    fetchAspirants();
  }, []);

  const fetchAspirants = async () => {
    try {
      const { data, error } = await supabase
        .from("aspirants")
        .select(`
          *,
          aspirant_positions (
            name,
            application_fee
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAspirants(data as unknown as Aspirant[] || []);
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
  };

  const openAspirantDialog = (aspirant: Aspirant) => {
    setSelectedAspirant(aspirant);
    setActionData({
      payment_verified: aspirant.payment_verified,
      admin_review_status: aspirant.admin_review_status || "",
      admin_review_notes: aspirant.admin_review_notes || "",
      screening_scheduled_at: aspirant.screening_scheduled_at || "",
      screening_result: aspirant.screening_result || "",
      screening_notes: aspirant.screening_notes || "",
      conditional_acceptance: aspirant.conditional_acceptance,
      conditional_reason: aspirant.conditional_reason || "",
      resubmission_deadline: aspirant.resubmission_deadline || "",
    });
    setIsDialogOpen(true);
  };

  const handleUpdateAspirant = async () => {
    if (!selectedAspirant) return;

    try {
      const { error } = await supabase
        .from("aspirants")
        .update(actionData)
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Aspirant Management</h2>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({aspirants.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingPayment.length})</TabsTrigger>
          <TabsTrigger value="review">Review ({underReview.length})</TabsTrigger>
          <TabsTrigger value="screening">Screening ({screening.length})</TabsTrigger>
          <TabsTrigger value="qualified">Qualified ({qualified.length})</TabsTrigger>
          <TabsTrigger value="promoted">Promoted ({promoted.length})</TabsTrigger>
        </TabsList>

        {[
          { value: "all", data: aspirants },
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No aspirants in this category
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((aspirant) => (
                      <TableRow key={aspirant.id}>
                        <TableCell className="font-medium">{aspirant.full_name}</TableCell>
                        <TableCell>{aspirant.matric}</TableCell>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Aspirant: {selectedAspirant?.full_name}</DialogTitle>
          </DialogHeader>

          {selectedAspirant && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedAspirant.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedAspirant.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="text-sm">{selectedAspirant.department}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Level</Label>
                  <p className="text-sm">{selectedAspirant.level}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-2">
                <Label>Documents</Label>
                <div className="space-y-2">
                  {selectedAspirant.photo_url && (
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedAspirant.photo_url!)}>
                      View Photo
                    </Button>
                  )}
                  {selectedAspirant.referee_form_url && (
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedAspirant.referee_form_url!)}>
                      View Referee Form
                    </Button>
                  )}
                  {selectedAspirant.declaration_form_url && (
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedAspirant.declaration_form_url!)}>
                      View Declaration
                    </Button>
                  )}
                  {selectedAspirant.payment_proof_url && (
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedAspirant.payment_proof_url!)}>
                      View Payment Proof
                    </Button>
                  )}
                </div>
              </div>

              {/* Payment Verification */}
              <div className="space-y-2">
                <Label htmlFor="payment_verified">Payment Status</Label>
                <Select
                  value={actionData.payment_verified ? "verified" : "unverified"}
                  onValueChange={(v) => setActionData({ ...actionData, payment_verified: v === "verified" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Review */}
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
              <div className="space-y-2">
                <Label htmlFor="screening_scheduled_at">Screening Date</Label>
                <Input
                  id="screening_scheduled_at"
                  type="datetime-local"
                  value={actionData.screening_scheduled_at}
                  onChange={(e) => setActionData({ ...actionData, screening_scheduled_at: e.target.value })}
                />
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="disqualified">Disqualified</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="space-y-2">
                <Label htmlFor="conditional_acceptance">Conditional Acceptance</Label>
                <Select
                  value={actionData.conditional_acceptance ? "yes" : "no"}
                  onValueChange={(v) => setActionData({ ...actionData, conditional_acceptance: v === "yes" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes - Pending Resubmission</SelectItem>
                  </SelectContent>
                </Select>
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
