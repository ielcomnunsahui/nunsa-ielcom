import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Trophy, Calendar, FileText, Loader2, Award } from "lucide-react";
import { AdminCandidates } from "@/components/admin/AdminCandidates";
import { AdminVoters } from "@/components/admin/AdminVoters";
import { AdminTimeline } from "@/components/admin/AdminTimeline";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { AdminPositions } from "@/components/admin/AdminPositions";
import { AdminStudentRoster } from "@/components/admin/AdminStudentRoster";
import { AdminAspirants } from "@/components/admin/AdminAspirants";

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVoters: 0,
    votedCount: 0,
    totalCandidates: 0,
    totalPositions: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        navigate("/admin-login");
        return;
      }

      setUser(authUser);

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (!adminData) {
        toast({
          title: "Access Denied",
          description: "You do not have admin privileges.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);

      // Fetch stats
      const [votersResult, candidatesResult, positionsResult] = await Promise.all([
        supabase.from("voters").select("voted", { count: "exact" }),
        supabase.from("candidates").select("*", { count: "exact" }),
        supabase.from("positions").select("*", { count: "exact" }),
      ]);

      const votedCount = votersResult.data?.filter((v) => v.voted).length || 0;

      setStats({
        totalVoters: votersResult.count || 0,
        votedCount,
        totalCandidates: candidatesResult.count || 0,
        totalPositions: positionsResult.count || 0,
      });

    } catch (error) {
      console.error("Error checking admin auth:", error);
      toast({
        title: "Error",
        description: "Failed to verify admin access.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 pb-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading admin panel...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-12">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-primary rounded-full shadow-glow mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage NUNSA Student Union Elections
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Voters</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalVoters}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Votes Cast</p>
                  <p className="text-3xl font-bold text-foreground">{stats.votedCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Candidates</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalCandidates}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Positions</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalPositions}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs for different admin functions */}
          <Card className="p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="roster">Roster</TabsTrigger>
                <TabsTrigger value="aspirants">Aspirants</TabsTrigger>
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="voters">Voters</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-6">
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    Election Management System
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Use the tabs above to manage student roster, aspirant applications, candidates, 
                    voter registration, election timeline, and review audit logs. All actions are 
                    logged for transparency and security.
                  </p>
                  <div className="mt-8 flex gap-4 justify-center">
                    <Button onClick={() => navigate("/results")} variant="outline">
                      View Live Results
                    </Button>
                    <Button onClick={() => navigate("/")} className="bg-gradient-primary">
                      View Public Site
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="roster" className="space-y-4 mt-6">
                <AdminStudentRoster />
              </TabsContent>

              <TabsContent value="aspirants" className="space-y-4 mt-6">
                <AdminAspirants />
              </TabsContent>

              <TabsContent value="positions" className="space-y-4 mt-6">
                <AdminPositions />
              </TabsContent>

              <TabsContent value="candidates" className="space-y-4 mt-6">
                <AdminCandidates />
              </TabsContent>

              <TabsContent value="voters" className="space-y-4 mt-6">
                <AdminVoters />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4 mt-6">
                <AdminTimeline />
              </TabsContent>

              <TabsContent value="audit" className="space-y-4 mt-6">
                <AdminAuditLog />
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6 mt-8 bg-muted/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Admin Access Notice</h3>
                <p className="text-sm text-muted-foreground">
                  You have full administrative access to the electoral system. All actions are 
                  logged in the audit trail. For detailed management, access the backend database 
                  through Lovable Cloud.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
