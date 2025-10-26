import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Vote as VoteIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Define strict types for components to eliminate 'any'
interface Candidate {
  id: string;
  full_name: string;
  position: string;
  picture_url: string | null;
}

interface Position {
  id: string;
  name: string;
  vote_type: "single" | "multiple";
  max_selections: number;
  display_order: number;
}

interface VoteSelection {
  [positionName: string]: string[];
}

interface VoterSession {
  voterId: string;
  email: string;
  authenticatedAt: number;
}

interface VoterInfo {
    id: string;
    email: string;
}

const Vote = () => {
  // Use specific types
  const [voter, setVoter] = useState<VoterInfo | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selections, setSelections] = useState<VoteSelection>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // FIX: Move the logic inside useEffect to resolve the exhaustive-deps warning
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Read lightweight voter session created after OTP/Biometric
        const raw = localStorage.getItem("voterSession");
        if (!raw) {
          navigate("/login", { replace: true });
          return;
        }

        let session: VoterSession | null = null;
        try {
          session = JSON.parse(raw);
        } catch {
          session = null;
        }

        if (!session?.voterId || !session?.email) {
          navigate("/voters-login", { replace: true });
          return;
        }

        // Check if voter has already voted from database
        const { data: voterData, error: voterError } = await supabase
          .from("voters")
          .select("voted, verified")
          .eq("id", session.voterId)
          .maybeSingle();

        if (voterError) throw voterError;

        // FIX: Implement cleaner redirect for users who have already voted
        if (voterData?.voted) {
          toast({
            title: "Vote Already Cast",
            description: "You have already cast your vote. Redirecting to results.",
          });
          navigate("/results", { replace: true });
          return;
        }

        if (!voterData?.verified) {
          toast({
            title: "Not Verified",
            description: "Your account is not verified. Please complete verification.",
            variant: "destructive",
          });
          navigate("/login", { replace: true });
          return;
        }

        // Set voter data based on the valid session
        setVoter({ id: session.voterId, email: session.email });

        // Load positions and candidates
        const [positionsResult, candidatesResult] = await Promise.all([
          supabase.from("positions").select("*").order("display_order", { ascending: true }),
          supabase.from("candidates").select("*").order("position", { ascending: true }),
        ]);

        if (positionsResult.error) throw positionsResult.error;
        if (candidatesResult.error) throw candidatesResult.error;

        setPositions(positionsResult.data || []);
        setCandidates(candidatesResult.data || []);

        // Initialize selections
        const initialSelections: VoteSelection = {};
        positionsResult.data?.forEach((pos) => {
          initialSelections[pos.name] = [];
        });
        setSelections(initialSelections);

      } catch (error) {
        console.error("Error loading data:", error);
        // Safely determine error message
        const message = error instanceof Error ? error.message : "Failed to load voting data. Please try again.";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        navigate("/login", { replace: true }); // Fallback redirect
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndLoadData();
    // Dependencies are correct: navigate and toast are stable or imported globally
  }, [navigate, toast]); 

  const handleSingleSelection = (positionName: string, candidateId: string) => {
    setSelections({
      ...selections,
      [positionName]: [candidateId],
    });
  };

  const handleMultipleSelection = (positionName: string, candidateId: string, position: Position) => {
    const current = selections[positionName] || [];
    const isSelected = current.includes(candidateId);

    if (isSelected) {
      setSelections({
        ...selections,
        [positionName]: current.filter((id) => id !== candidateId),
      });
    } else {
      if (current.length < position.max_selections) {
        setSelections({
          ...selections,
          [positionName]: [...current, candidateId],
        });
      } else {
        toast({
          title: "Selection Limit Reached",
          description: `You can only select up to ${position.max_selections} candidate(s) for this position.`,
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmitVote = async () => {
    // Ensure voter is not null before proceeding
    if (!voter) return; 

    // Validate all positions have selections
    const allPositionsFilled = positions.every((pos) => 
      selections[pos.name] && selections[pos.name].length > 0
    );

    if (!allPositionsFilled) {
      toast({
        title: "Incomplete Ballot",
        description: "Please make a selection for all positions before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call edge function to submit vote
      const { error } = await supabase.functions.invoke("submit-vote", {
        body: { voterId: voter.id, selections },
      });

      // The Edge Function (submit-vote) is responsible for marking 'voted = true'
      if (error) throw error;

      toast({
        title: "Vote Submitted Successfully!",
        description: "Thank you for participating in the election.",
      });

      // CRITICAL: Clear voter session to prevent re-access (Zero-Trust principle)
      localStorage.removeItem("voterSession");
      
      // Redirect to results page
      setTimeout(() => navigate("/results", { replace: true }), 2000);

    } catch (error) {
      console.error("Vote submission error:", error);
      // Safely handle error message
      const message = error instanceof Error ? error.message : "Failed to submit vote. Please try again.";
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 sm:pt-24 px-2 sm:px-4 pb-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading ballot...</p>
          </div>
        </main>
      </div>
    );
  }

  // NOTE: The 'hasVoted' logic is no longer needed here because we redirect 
  // immediately in useEffect if the user is already marked as voted.

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 sm:pt-24 px-2 sm:px-4 pb-12">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-gradient-success rounded-full shadow-success-glow mb-4">
              <VoteIcon className="w-6 h-6 sm:w-8 sm:h-8 text-success-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-foreground">
              Cast Your Vote
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Make your selection for each position
            </p>
            {voter?.email && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Voting as: {voter.email}
              </p>
            )}
          </div>

          <div className="space-y-6 sm:space-y-8">
            {positions.map((position, index) => {
              const positionCandidates = candidates.filter((c) => c.position === position.name);

              return (
                <Card key={position.id} className="p-4 sm:p-6 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">{position.name}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {position.vote_type === "single" 
                        ? "Select one candidate" 
                        : `Select up to ${position.max_selections} candidate(s)`}
                    </p>
                  </div>

                  {position.vote_type === "single" ? (
                    <RadioGroup
                      value={selections[position.name]?.[0] || ""}
                      onValueChange={(value) => handleSingleSelection(position.name, value)}
                    >
                      <div className="space-y-3 sm:space-y-4">
                        {positionCandidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border ${
                              selections[position.name]?.includes(candidate.id)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            } transition-all cursor-pointer`}
                            onClick={() => handleSingleSelection(position.name, candidate.id)}
                          >
                            <RadioGroupItem value={candidate.id} id={candidate.id} />
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border overflow-hidden flex-shrink-0">
                              {candidate.picture_url ? (
                                <img
                                  src={candidate.picture_url}
                                  alt={candidate.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg sm:text-2xl font-bold text-muted-foreground">
                                  {candidate.full_name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <Label htmlFor={candidate.id} className="flex-1 cursor-pointer text-base sm:text-lg font-semibold">
                              {candidate.full_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {positionCandidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border ${
                            selections[position.name]?.includes(candidate.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          } transition-all cursor-pointer`}
                          onClick={() => handleMultipleSelection(position.name, candidate.id, position)}
                        >
                          <Checkbox
                            id={candidate.id}
                            checked={selections[position.name]?.includes(candidate.id)}
                            onCheckedChange={() => handleMultipleSelection(position.name, candidate.id, position)}
                          />
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border overflow-hidden flex-shrink-0">
                            {candidate.picture_url ? (
                              <img
                                src={candidate.picture_url}
                                alt={candidate.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg sm:text-2xl font-bold text-muted-foreground">
                                {candidate.full_name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <Label htmlFor={candidate.id} className="flex-1 cursor-pointer text-base sm:text-lg font-semibold">
                            {candidate.full_name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <Card className="p-4 sm:p-6 mt-6 sm:mt-8 bg-muted/30">
            <div className="flex items-start gap-3 mb-4 sm:mb-6">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2 text-foreground text-sm sm:text-base">Before You Submit:</h3>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>• Review all your selections carefully</li>
                  <li>• Once submitted, you cannot change your vote</li>
                  <li>• Your vote is completely anonymous</li>
                  <li>• Results will be available immediately after voting closes</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handleSubmitVote}
              disabled={isSubmitting}
              className="w-full bg-gradient-success hover:shadow-success-glow text-base sm:text-lg py-4 sm:py-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Submitting Vote...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Submit My Vote
                </>
              )}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Vote;