import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Edit, Upload, Eye, Image as ImageIcon, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Candidate {
  id: string;
  full_name: string;
  position: string;
  picture_url: string | null;
  vote_count: number;
  created_at: string;
}

interface Position {
  id: string;
  name: string;
  vote_type: string;
  max_selections: number;
}

interface Aspirant {
  id: string;
  full_name: string;
  photo_url: string | null;
  aspirant_positions: { name: string } | null;
  promoted_to_candidate: boolean;
  screening_result: string | null;
}

export function AdminCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [availableAspirants, setAvailableAspirants] = useState<Aspirant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [formData, setFormData] = useState({
    full_name: "",
    position: "",
    picture_url: "",
    aspirant_id: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesResult, positionsResult, aspirantsResult] = await Promise.all([
        supabase.from("candidates").select("*").order("position"),
        supabase.from("positions").select("*").order("display_order"),
        supabase
          .from("aspirants")
          .select(`
            id,
            full_name,
            photo_url,
            promoted_to_candidate,
            screening_result,
            aspirant_positions (name)
          `)
          .eq("screening_result", "qualified")
          .eq("promoted_to_candidate", false)
      ]);

      if (candidatesResult.error) throw candidatesResult.error;
      if (positionsResult.error) throw positionsResult.error;
      if (aspirantsResult.error) throw aspirantsResult.error;

      setCandidates(candidatesResult.data || []);
      setPositions(positionsResult.data || []);
      setAvailableAspirants(aspirantsResult.data as unknown as Aspirant[] || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load candidates data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `candidate-${Date.now()}.${fileExt}`;
      const filePath = `candidates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('aspirant-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('aspirant-documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload candidate photo",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let pictureUrl = formData.picture_url;

      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile);
        if (uploadedUrl) {
          pictureUrl = uploadedUrl;
        } else {
          return; // Upload failed
        }
      }

      if (editingCandidate) {
        const { error } = await supabase
          .from("candidates")
          .update({
            full_name: formData.full_name,
            position: formData.position,
            picture_url: pictureUrl || null,
          })
          .eq("id", editingCandidate.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Candidate updated successfully",
        });
      } else {
        // If creating from aspirant, get aspirant data
        if (formData.aspirant_id) {
          const aspirant = availableAspirants.find(a => a.id === formData.aspirant_id);
          if (aspirant) {
            const { error: candidateError } = await supabase
              .from("candidates")
              .insert({
                full_name: aspirant.full_name,
                position: aspirant.aspirant_positions?.name || formData.position,
                picture_url: pictureUrl || aspirant.photo_url,
              });

            if (candidateError) throw candidateError;

            // Mark aspirant as promoted
            const { error: aspirantError } = await supabase
              .from("aspirants")
              .update({
                promoted_to_candidate: true,
                promoted_at: new Date().toISOString(),
              })
              .eq("id", formData.aspirant_id);

            if (aspirantError) throw aspirantError;
          }
        } else {
          const { error } = await supabase
            .from("candidates")
            .insert({
              full_name: formData.full_name,
              position: formData.position,
              picture_url: pictureUrl || null,
            });

          if (error) throw error;
        }
        
        toast({
          title: "Success",
          description: "Candidate added successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingCandidate(null);
      setFormData({ full_name: "", position: "", picture_url: "", aspirant_id: "" });
      setImageFile(null);
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
    if (!confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return;

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
      aspirant_id: "",
    });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingCandidate(null);
    setFormData({ full_name: "", position: "", picture_url: "", aspirant_id: "" });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleAspirantSelect = (aspirantId: string) => {
    const aspirant = availableAspirants.find(a => a.id === aspirantId);
    if (aspirant) {
      setFormData({
        ...formData,
        aspirant_id: aspirantId,
        full_name: aspirant.full_name,
        position: aspirant.aspirant_positions?.name || "",
        picture_url: aspirant.photo_url || "",
      });
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === "all" || candidate.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manage Candidates</h2>
          <p className="text-muted-foreground">Add candidates manually or promote qualified aspirants</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCandidate ? "Edit" : "Add"} Candidate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingCandidate && availableAspirants.length > 0 && (
                <div>
                  <Label htmlFor="aspirant_id">Promote Qualified Aspirant (Optional)</Label>
                  <Select
                    value={formData.aspirant_id}
                    onValueChange={handleAspirantSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an aspirant to promote" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Create manually</SelectItem>
                      {availableAspirants.map((aspirant) => (
                        <SelectItem key={aspirant.id} value={aspirant.id}>
                          {aspirant.full_name} - {aspirant.aspirant_positions?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                <Label htmlFor="picture_upload">Candidate Photo</Label>
                <div className="space-y-2">
                  <Input
                    id="picture_upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a new photo or use the URL below
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="picture_url">Picture URL (Alternative)</Label>
                <Input
                  id="picture_url"
                  type="url"
                  value={formData.picture_url}
                  onChange={(e) => setFormData({ ...formData, picture_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              {(formData.picture_url || imageFile) && (
                <div>
                  <Label>Preview</Label>
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border overflow-hidden">
                    {imageFile ? (
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : formData.picture_url ? (
                      <img
                        src={formData.picture_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      {editingCandidate ? "Update" : "Add"} Candidate
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Qualified Aspirants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableAspirants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Votes Cast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.reduce((sum, c) => sum + c.vote_count, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {positions.map((pos) => (
              <SelectItem key={pos.id} value={pos.name}>
                {pos.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Photo</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {searchTerm || positionFilter !== "all" 
                    ? "No candidates found matching your criteria." 
                    : "No candidates added yet. Add your first candidate to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="font-medium">{candidate.full_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{candidate.position}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-border overflow-hidden">
                      {candidate.picture_url ? (
                        <img
                          src={candidate.picture_url}
                          alt={candidate.full_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`flex items-center justify-center w-full h-full ${candidate.picture_url ? 'hidden' : ''}`}>
                        <span className="text-sm font-bold text-muted-foreground">
                          {candidate.full_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{candidate.vote_count}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(candidate.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {candidate.picture_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(candidate.picture_url!, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
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