import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Clock, Users, FileText, Loader2, Calendar, CheckCircle2, AlertCircle, User, DollarSign, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Position {
  id: string;
  name: string;
  application_fee: number;
  min_cgpa: number;
  eligible_levels: string[];
  description: string;
  is_open: boolean;
  created_at: string;
  updated_at: string;
  display_order: number;
}

interface Aspirant {
  id: string;
  full_name: string;
  matric: string;
  position_id: string;
  payment_verified: boolean;
  admin_review_status: string;
  screening_scheduled_at: string | null;
  screening_result: string | null;
  promoted_to_candidate: boolean;
  created_at: string;
  aspirant_positions: { name: string };
}

interface TimelineStage {
  id: string;
  stage_name: string;
  start_time: string;
  end_time: string;
  is_open: boolean;
}

const AspirantDashboard = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [aspirant, setAspirant] = useState<Aspirant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationDeadline, setApplicationDeadline] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    if (!applicationDeadline) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const deadline = applicationDeadline.getTime();
      const difference = deadline - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
        setIsApplicationOpen(true);
      } else {
        setTimeRemaining(null);
        setIsApplicationOpen(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [applicationDeadline]);

  const loadDashboardData = useCallback(async () => {
  try {
      // Check if user has existing application
      const matricNumber = localStorage.getItem("aspirantMatric");
      if (matricNumber) {
        const { data: existingAspirant } = await supabase
          .from("aspirants")
          .select(`
            *,
            aspirant_positions (name)
          `)
          .eq("matric", matricNumber)
          .maybeSingle();

        if (existingAspirant) {
          setAspirant(existingAspirant as unknown as Aspirant);
        }
      }

      // Load available positions
      const { data: positionsData, error: positionsError } = await supabase
        .from("aspirant_positions")
        .select("*")
        .eq("is_open", true)
        .order("application_fee", { ascending: false });

      if (positionsError) throw positionsError;
      setPositions(positionsData || []);

      // Get application deadline from election timeline
      const { data: timelineData } = await supabase
        .from("election_timeline")
        .select("*")
        .eq("stage_name", "Application Period")
        .eq("is_active", true)
        .maybeSingle();

      if (timelineData?.end_time) {
        setApplicationDeadline(new Date(timelineData.end_time));
      } else {
        // Fallback: Set a default deadline if not configured
        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 30); // 30 days from now
        setApplicationDeadline(defaultDeadline);
      }

    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
   }
}, [toast]);

 useEffect(() => {
  loadDashboardData();
}, [loadDashboardData]);

  const getApplicationStatus = () => {
    if (!aspirant) return "Not Applied";
    if (aspirant.promoted_to_candidate) return "Promoted to Candidate";
    if (aspirant.screening_result === "qualified") return "Qualified";
    if (aspirant.screening_result === "disqualified") return "Disqualified";
    if (aspirant.screening_scheduled_at) return "Screening Scheduled";
    if (aspirant.admin_review_status === "approved") return "Under Review - Approved";
    if (aspirant.admin_review_status === "rejected") return "Application Rejected";
    if (aspirant.payment_verified) return "Payment Verified";
    return "Application Submitted";
  };

  const getStatusProgress = () => {
    if (!aspirant) return 0;
    if (aspirant.promoted_to_candidate) return 100;
    if (aspirant.screening_result === "qualified") return 90;
    if (aspirant.screening_result === "disqualified") return 0;
    if (aspirant.screening_scheduled_at) return 70;
    if (aspirant.admin_review_status === "approved") return 60;
    if (aspirant.admin_review_status === "rejected") return 0;
    if (aspirant.payment_verified) return 40;
    return 20;
  };

  const getStatusColor = () => {
    const status = getApplicationStatus();
    if (status.includes("Promoted") || status.includes("Qualified")) return "bg-success";
    if (status.includes("Rejected") || status.includes("Disqualified")) return "bg-destructive";
    if (status.includes("Approved") || status.includes("Verified")) return "bg-primary";
    return "bg-secondary";
  };

  const formatDeadline = (deadline: Date) => {
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysLeft < 0) return "Application Closed";
    if (daysLeft === 0) return "Last Day";
    return `${daysLeft} days left`;
  };
  const isEligible = (position: Position, userLevel: string, userCgpa: number) => {
    return (
      userCgpa >= position.min_cgpa &&
      position.eligible_levels.includes(userLevel)
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 pb-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading aspirant dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-12">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-secondary rounded-full shadow-glow mb-4">
              <Trophy className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              Aspirant Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Apply for leadership positions in NUNSA Student Union
            </p>
          </div>

          {/* Application Countdown */}
          {applicationDeadline && (
            <Card className="p-6 mb-8 animate-fade-in">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Timer className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    {isApplicationOpen ? "Application Deadline" : "Applications Closed"}
                  </h2>
                </div>
                
                {timeRemaining && isApplicationOpen ? (
                  <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{timeRemaining.days}</div>
                      <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{timeRemaining.hours}</div>
                      <div className="text-sm text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{timeRemaining.minutes}</div>
                      <div className="text-sm text-muted-foreground">Minutes</div>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{timeRemaining.seconds}</div>
                      <div className="text-sm text-muted-foreground">Seconds</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-destructive/10 rounded-lg max-w-md mx-auto">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="text-destructive font-medium">Application period has ended</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Deadline was: {applicationDeadline.toLocaleDateString()} at {applicationDeadline.toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Application Status */}
          {aspirant && (
            <Card className="p-6 mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Your Application Status</h2>
                <Badge className={getStatusColor()}>
                  {getApplicationStatus()}
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Application Progress</span>
                      <span>{getStatusProgress()}%</span>
                    </div>
                    <Progress value={getStatusProgress()} className="h-2" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position:</span>
                      <span className="font-medium">{aspirant.aspirant_positions?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applied:</span>
                      <span className="font-medium">
                        {new Date(aspirant.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment:</span>
                      <span className={`font-medium ${aspirant.payment_verified ? 'text-success' : 'text-muted-foreground'}`}>
                        {aspirant.payment_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Application Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>Application Submitted</span>
                    </div>
                    <div className={`flex items-center gap-2 ${aspirant.payment_verified ? 'text-success' : 'text-muted-foreground'}`}>
                      {aspirant.payment_verified ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      <span>Payment Verified</span>
                    </div>
                    <div className={`flex items-center gap-2 ${aspirant.admin_review_status === 'approved' ? 'text-success' : 'text-muted-foreground'}`}>
                      {aspirant.admin_review_status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      <span>Admin Review</span>
                    </div>
                    <div className={`flex items-center gap-2 ${aspirant.screening_scheduled_at ? 'text-success' : 'text-muted-foreground'}`}>
                      {aspirant.screening_scheduled_at ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      <span>Screening Scheduled</span>
                    </div>
                    <div className={`flex items-center gap-2 ${aspirant.screening_result === 'qualified' ? 'text-success' : 'text-muted-foreground'}`}>
                      {aspirant.screening_result === 'qualified' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      <span>Screening Result</span>
                    </div>
                    <div className={`flex items-center gap-2 ${aspirant.promoted_to_candidate ? 'text-success' : 'text-muted-foreground'}`}>
                      {aspirant.promoted_to_candidate ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      <span>Final Promotion</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Available Positions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Available Positions</h2>
              {!aspirant && isApplicationOpen && (
                <Button onClick={() => navigate("/aspirant/apply")} className="bg-gradient-secondary">
                  Start Application
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions.map((position, index) => (
                <Card key={position.id} className="p-6 hover:shadow-lg transition-all animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-foreground">{position.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        ₦{position.application_fee.toLocaleString()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {position.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Min CGPA:</span>
                        <span className="font-medium">{position.min_cgpa.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                         <span className="text-muted-foreground">Eligible Levels:</span>
                        <span className="font-medium">
                          {position.eligible_levels.join(", ")}L
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Application Fee:</span>
                        <span className="font-medium">₦{position.application_fee.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      {aspirant ? (
                        <Button disabled className="w-full" variant="outline">
                          {aspirant.aspirant_positions?.name === position.name ? "Applied" : "One Application Only"}
                        </Button>
                      ) : !isApplicationOpen ? (
                        <Button disabled className="w-full" variant="outline">
                          Applications Closed
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => navigate("/aspirant/apply", { state: { selectedPosition: position } })}
                          className="w-full bg-gradient-primary hover:shadow-glow"
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Application Requirements</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Valid NUNSA student with active matric number</li>
                    <li>• Meet minimum CGPA and level requirements</li>
                    <li>• Complete all application steps including payment</li>
                    <li>• Submit required documents (photo, referee form, declaration)</li>
                    <li>• Pass screening interview if selected</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Important Notes</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• You can only apply for one position per election cycle</li>
                    <li>• Application fees are non-refundable</li>
                    <li>• All documents must be submitted before deadline</li>
                    <li>• Screening dates will be communicated via email</li>
                    <li>• Final results will be published on this platform</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AspirantDashboard;