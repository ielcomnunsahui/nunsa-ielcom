import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";

interface Voter {
  id: string;
  matric: string;
  name: string;
  email: string;
  verified: boolean;
  voted: boolean;
  created_at: string;
}

export function AdminVoters() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [filteredVoters, setFilteredVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchVoters();
  }, []);

  useEffect(() => {
    const filtered = voters.filter(
      (voter) =>
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.matric.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVoters(filtered);
  }, [searchTerm, voters]);

  const fetchVoters = async () => {
    try {
      const { data, error } = await supabase
        .from("voters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVoters(data || []);
      setFilteredVoters(data || []);
    } catch (error) {
      console.error("Error fetching voters:", error);
      toast({
        title: "Error",
        description: "Failed to load voters",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        <h2 className="text-2xl font-bold">Registered Voters</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, matric, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Registered</p>
          <p className="text-3xl font-bold">{voters.length}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Verified</p>
          <p className="text-3xl font-bold text-success">
            {voters.filter((v) => v.verified).length}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Voted</p>
          <p className="text-3xl font-bold text-primary">
            {voters.filter((v) => v.voted).length}
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
