import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Edit } from "lucide-react";

interface Candidate {
  id: string;
  full_name: string;
  position: string;
  picture_url: string | null;
  vote_count: number;
}

interface Position {
  id: string;
  name: string;
}

export function AdminCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    position: "",
    picture_url: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesResult, positionsResult] = await Promise.all([
        supabase.from("candidates").select("*").order("position"),
        supabase.from("positions").select("*").order("display_order"),
      ]);

      if (candidatesResult.error) throw candidatesResult.error;
      if (positionsResult.error) throw positionsResult.error;

      setCandidates(candidatesResult.data || []);
      setPositions(positionsResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCandidate) {
        const { error } = await supabase
          .from("candidates")
          .update({
            full_name: formData.full_name,
            position: formData.position,
            picture_url: formData.picture_url || null,
          })
          .eq("id", editingCandidate.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Candidate updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("candidates")
          .insert({
            full_name: formData.full_name,
            position: formData.position,
            picture_url: formData.picture_url || null,
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Candidate added successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingCandidate(null);
      setFormData({ full_name: "", position: "", picture_url: "" });
      fetchData();
    } catch (error) {
      console.error("Error saving candidate:", error);
      toast({
        title: "Error",
        description: "Failed to save candidate",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Candidate deleted successfully",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast({
        title: "Error",
        description: "Failed to delete candidate",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      full_name: candidate.full_name,
      position: candidate.position,
      picture_url: candidate.picture_url || "",
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingCandidate(null);
    setFormData({ full_name: "", position: "", picture_url: "" });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Candidates</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCandidate ? "Edit" : "Add"} Candidate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.name}>
                        {pos.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="picture_url">Picture URL (optional)</Label>
                <Input
                  id="picture_url"
                  type="url"
                  value={formData.picture_url}
                  onChange={(e) => setFormData({ ...formData, picture_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCandidate ? "Update" : "Add"} Candidate
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Picture</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No candidates found. Add your first candidate to get started.
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">{candidate.full_name}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>
                    {candidate.picture_url ? (
                      <img
                        src={candidate.picture_url}
                        alt={candidate.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-bold">{candidate.full_name.charAt(0)}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{candidate.vote_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(candidate)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(candidate.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
