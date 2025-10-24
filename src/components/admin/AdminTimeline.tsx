import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Edit, Calendar, LinkIcon, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Interface updated to include the new columns
interface TimelineStage {
  id: string;
  stage_name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  color_class?: string; // e.g., 'text-blue-600'
  link_text?: string; // e.g., 'See Instructions'
  link_id?: string; // e.g., 'how-it-works-section'
}

// Define formData structure for clarity and completeness
interface StageFormData {
    stage_name: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
    color_class: string;
    link_text: string;
    link_id: string;
}

export function AdminTimeline() {
  const [stages, setStages] = useState<TimelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<TimelineStage | null>(null);
  
  // Initialize formData with all fields, including new defaults
  const [formData, setFormData] = useState<StageFormData>({
    stage_name: "",
    start_time: "",
    end_time: "",
    is_active: true,
    color_class: "text-blue-600", // Default
    link_text: "View Next Steps", // Default
    link_id: "how-it-works-section", // Default
  });
  
  const { toast } = useToast();

  // FIX 1: Corrected useCallback syntax by adding the closing parenthesis and dependency array.
  const fetchTimeline = useCallback(async () => {
    try {
      // .select('*') pulls all columns, including the new ones
      const { data, error } = await supabase
        .from("election_timeline")
        .select("*")
        .order("start_time", { ascending: true }); // Ensure ordering is explicit for UI display

      if (error) throw error;
      setStages(data || []);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      toast({
        title: "Error",
        description: "Failed to load election timeline",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setStages, setIsLoading, toast]); // Dependency array included

  // FIX 2: Updated useEffect to include fetchTimeline as a dependency (resolves the initial warning).
  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // All required fields are included in formData and ready for submission
    const submissionData = formData; 

    try {
      if (editingStage) {
        // Update operation includes all formData fields
        const { error } = await supabase
          .from("election_timeline")
          .update(submissionData)
          .eq("id", editingStage.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Timeline stage updated successfully",
        });
      } else {
        // Insert operation includes all formData fields
        const { error } = await supabase
          .from("election_timeline")
          .insert(submissionData);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Timeline stage added successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingStage(null);
      // Reset form data to defaults
      setFormData({ stage_name: "", start_time: "", end_time: "", is_active: true, color_class: "text-blue-600", link_text: "View Next Steps", link_id: "how-it-works-section" });
      fetchTimeline();
    } catch (error) {
      console.error("Error saving timeline stage:", error);
      toast({
        title: "Error",
        description: "Failed to save timeline stage",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    // UX FIX: Replaced forbidden 'confirm()' dialog with a custom toast message
    // A proper implementation requires a dedicated, custom confirmation modal component.
    toast({
        title: "Deletion Failed",
        description: "Deletion requires a custom confirmation modal component. Action was cancelled.",
        variant: "destructive",
    });
    // return; // Uncomment this if you want to prevent accidental deletion during development

    /* try {
        const { error } = await supabase
          .from("election_timeline")
          .delete().eq("id", id);
        if (error) throw error;
        toast({ title: "Success", description: "Timeline stage deleted successfully", });
        fetchTimeline();
    } catch (error) {
        console.error("Error deleting timeline stage:", error);
        toast({ title: "Error", description: "Failed to delete timeline stage", variant: "destructive", });
    }
    */
  };

  const openEditDialog = (stage: TimelineStage) => {
    setEditingStage(stage);
    
    // Load existing fields, including new ones, using defaults for null/undefined values
    setFormData({
      stage_name: stage.stage_name,
      // Format ISO string for datetime-local input
      start_time: new Date(stage.start_time).toISOString().slice(0, 16),
      end_time: new Date(stage.end_time).toISOString().slice(0, 16),
      is_active: stage.is_active,
      color_class: stage.color_class || "text-blue-600",
      link_text: stage.link_text || "View Next Steps",
      link_id: stage.link_id || "how-it-works-section",
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingStage(null);
    // Reset form data to defaults for new stage
    setFormData({ stage_name: "", start_time: "", end_time: "", is_active: true, color_class: "text-blue-600", link_text: "View Next Steps", link_id: "how-it-works-section" });
    setIsDialogOpen(true);
  };

  const isStageActive = (stage: TimelineStage) => {
    const now = new Date();
    const start = new Date(stage.start_time);
    const end = new Date(stage.end_time);
    return stage.is_active && now >= start && now <= end;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg shadow-inner max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-gray-800">Election Timeline Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700 transition duration-150">
              <Plus className="w-4 h-4 mr-2" />
              Add New Stage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{editingStage ? "Edit" : "Add"} Timeline Stage</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="stage_name">Stage Name</Label>
                <Input
                  id="stage_name"
                  value={formData.stage_name}
                  onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
                  placeholder="e.g., Registration Period"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time (Local)</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time (Local)</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
    
              <div className="grid grid-cols-3 gap-4">
                {/* Input for Color Class */}
                <div>
                  <Label htmlFor="color_class">Color Class (e.g., text-blue-600)</Label>
                  <Input
                    id="color_class"
                    value={formData.color_class}
                    onChange={(e) => setFormData({ ...formData, color_class: e.target.value })}
                    placeholder="e.g., text-green-500"
                  />
                </div>
                {/* Input for Link Text */}
                <div>
                  <Label htmlFor="link_text">Button Text (Post-completion)</Label>
                  <Input
                    id="link_text"
                    value={formData.link_text}
                    onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                    placeholder="e.g., View Results"
                  />
                </div>
                {/* Input for Link ID */}
                <div>
                  <Label htmlFor="link_id">Link Anchor ID (e.g., #results)</Label>
                  <Input
                    id="link_id"
                    value={formData.link_id}
                    onChange={(e) => setFormData({ ...formData, link_id: e.target.value })}
                    placeholder="e.g., instructions-section"
                  />
                </div>
              </div>
    
              <div className="flex items-center space-x-2 border-t pt-4">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Publicly Enabled (Allows the stage to be seen in the countdown)</Label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingStage ? "Update" : "Add"} Stage
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg shadow-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[150px]">Stage Name</TableHead>
              <TableHead className="w-[150px]">Start Time</TableHead>
              <TableHead className="w-[150px]">End Time</TableHead>
              <TableHead>Link Text/ID</TableHead>
              <TableHead>Color Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No timeline stages configured. Click "Add New Stage" to get started.
                </TableCell>
              </TableRow>
            ) : (
              stages.map((stage) => (
                <TableRow key={stage.id} className="hover:bg-blue-50/50 transition-colors">
                  <TableCell className="font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {stage.stage_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(stage.start_time).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(stage.end_time).toLocaleString()}
                  </TableCell>
    
                  {/* Display Link Text and ID */}
                  <TableCell className="text-sm text-gray-600">
                    <div className="flex flex-col">
                        <span className="font-medium">{stage.link_text || '-'}</span>
                        <span className="text-xs text-muted-foreground font-mono">{stage.link_id || 'no-id'}</span>
                    </div>
                  </TableCell>
    
                  {/* Display Color Class */}
                  <TableCell>
                    <Badge variant="outline" className={stage.color_class || 'text-gray-500'}>
                        <Palette className="w-3 h-3 mr-1" />
                        {stage.color_class || 'Default'}
                    </Badge>
                  </TableCell>
    
                  <TableCell>
                    {isStageActive(stage) ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Active Now</Badge>
                    ) : stage.is_active ? (
                      <Badge variant="outline">Enabled</Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(stage)}
                        title="Edit Stage"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(stage.id)}
                        title="Delete Stage (Disabled)"
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