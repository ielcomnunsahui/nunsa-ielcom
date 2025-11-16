import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  MoreVertical,
  Users,
  RotateCcw,
  X,
  UserCheck,
  UserX,
} from "lucide-react";

interface Voter {
  id: string;
  matric: string;
  name: string;
  email: string;
  verified: boolean;
  voted: boolean;
  created_at: string;
}

// Helper to format date in a user-friendly way
const formatRegistrationDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type StatusFilter = "all" | "verified" | "unverified" | "voted" | "not_voted";

export function AdminVoters() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const fetchVoters = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("voters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVoters(data || []);
    } catch (error) {
      console.error("Error fetching voters:", error);
      toast({
        title: "Error",
        description: "Failed to load voters.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  // --- Filtering & Pagination Logic ---

  const filteredVoters = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    const filteredBySearch = voters.filter(
      (voter) =>
        voter.name.toLowerCase().includes(searchLower) ||
        voter.matric.toLowerCase().includes(searchLower) ||
        voter.email.toLowerCase().includes(searchLower)
    );

    const filteredByStatus = filteredBySearch.filter((voter) => {
      switch (statusFilter) {
        case "verified":
          return voter.verified;
        case "unverified":
          return !voter.verified;
        case "voted":
          return voter.voted;
        case "not_voted":
          return !voter.voted;
        case "all":
        default:
          return true;
      }
    });

    setCurrentPage(1); // Reset to first page on filter/search change
    return filteredByStatus;
  }, [searchTerm, voters, statusFilter]);

  const totalPages = Math.ceil(filteredVoters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVoters = filteredVoters.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // --- Admin Actions ---

  const toggleVoterVerification = async (voter: Voter) => {
    const newStatus = !voter.verified;
    // Optimistic update
    setVoters((prevVoters) =>
      prevVoters.map((v) =>
        v.id === voter.id ? { ...v, verified: newStatus } : v
      )
    );

    try {
      const { error } = await supabase
        .from("voters")
        .update({ verified: newStatus })
        .eq("id", voter.id);

      if (error) throw error;

      toast({
        title: "Verification Updated",
        description: `${voter.name} is now ${
          newStatus ? "Verified" : "Unverified"
        }.`,
      });
    } catch (error) {
      console.error("Error updating voter verification:", error);
      // Revert state on failure
      setVoters((prevVoters) =>
        prevVoters.map((v) =>
          v.id === voter.id ? { ...v, verified: voter.verified } : v
        )
      );
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    }
  };

  const resetVoterVote = async (voter: Voter) => {
    // Optimistic update
    setVoters((prevVoters) =>
      prevVoters.map((v) => (v.id === voter.id ? { ...v, voted: false } : v))
    );

    try {
      const { error } = await supabase
        .from("voters")
        .update({ voted: false })
        .eq("id", voter.id);

      if (error) throw error;

      toast({
        title: "Vote Reset",
        description: `${voter.name}'s vote has been successfully reset.`,
      });
    } catch (error) {
      console.error("Error resetting voter vote:", error);
      // Revert state on failure
      setVoters((prevVoters) =>
        prevVoters.map((v) => (v.id === voter.id ? { ...v, voted: true } : v))
      );
      toast({
        title: "Error",
        description: "Failed to reset voter vote.",
        variant: "destructive",
      });
    }
  };

  // --- Render Functions ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="space-y-4">
         <div className="text-left md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center md:justify-start">
                  <Users className="w-8 h-8 mr-3 text-blue-600" />
                  Voter Management
              </h1>
            </div>
       
        
        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, matric, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: StatusFilter) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Voters</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="voted">Voted</SelectItem>
              <SelectItem value="not_voted">Not Voted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Registered</p>
          <p className="text-2xl sm:text-3xl font-bold">{voters.length}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Verified</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">
            {voters.filter((v) => v.verified).length}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Voted</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">
            {voters.filter((v) => v.voted).length}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Filter Result</p>
          <p className="text-2xl sm:text-3xl font-bold">
            {filteredVoters.length}
          </p>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matric Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Voted</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVoters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchTerm ? "No voters found matching your search." : "No voters registered yet."}
                </TableCell>
              </TableRow>
            ) : (
              filteredVoters.map((voter) => (
                <TableRow key={voter.id}>
                  <TableCell className="font-mono">{voter.matric}</TableCell>
                  <TableCell className="font-medium">{voter.name}</TableCell>
                  <TableCell>{voter.email}</TableCell>
                  <TableCell>
                    {voter.verified ? (
                      <Badge variant="default" className="bg-success">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {voter.voted ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(voter.created_at).toLocaleDateString()}
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
