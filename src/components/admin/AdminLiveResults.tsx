import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Loader2, 
  Users, 
  CheckCheck, 
  Shield, 
  AlertTriangle, 
  ScrollText, 
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useElectionTimeline } from "@/hooks/useElectionTimeline";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Candidate {
  id: string;
  full_name: string;
  position: string;
  picture_url: string | null;
  vote_count: number;
  manifesto: string | null;
}

interface PositionResults {
  position: string;
  candidates: Candidate[];
  totalVotes: number;
  winner: Candidate | null;
  hasWinner: boolean;
  isDraw: boolean;
}

interface VotingStats {
  totalVoters: number;
  totalVoted: number;
  turnoutRate: number;
  lastUpdated: Date;
}

export function AdminLiveResults() {
  const [results, setResults] = useState<PositionResults[]>([]);
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { status: electionStatus } = useElectionTimeline();
  const { toast } = useToast();

  const fetchVotingStats = useCallback(async () => {
    try {
      const { data: votersData, error: votersError } = await supabase
        .from('voters')
        .select('id, voted, verified')
        .eq('verified', true);

      if (votersError) throw votersError;

      const totalVoters = votersData?.length || 0;
      const totalVoted = votersData?.filter(v => v.voted).length || 0;
      const turnoutRate = totalVoters > 0 ? (totalVoted / totalVoters) * 100 : 0;

      setVotingStats({
        totalVoters,
        totalVoted,
        turnoutRate,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error fetching voting stats:', error);
    }
  }, []);

  const fetchResults = useCallback(async () => {
    if (results.length === 0) setIsLoading(true);
    
    try {
      const { data: candidates, error } = await supabase
        .from("candidates")
        .select("id, full_name, position, picture_url, vote_count, manifesto")
        .order("position", { ascending: true })
        .order("vote_count", { ascending: false });

      if (error) throw error;

      // Group and aggregate data
      const grouped = (candidates || []).reduce((acc, candidate) => {
        const existing = acc.find((p) => p.position === candidate.position);
        if (existing) {
          existing.candidates.push(candidate);
          existing.totalVotes += candidate.vote_count || 0;
        } else {
          acc.push({
            position: candidate.position,
            candidates: [candidate],
            totalVotes: candidate.vote_count || 0,
            winner: null,
            hasWinner: false,
            isDraw: false,
          });
        }
        return acc;
      }, [] as PositionResults[]);

      // Determine winner/draw status
      const finalResults = grouped.map(p => {
        const leader = p.candidates[0];
        const second = p.candidates[1];

        const isDraw = p.candidates.length > 1 && 
                      leader?.vote_count > 0 && 
                      leader.vote_count === second?.vote_count;
        
        const hasWinner = !electionStatus.isVotingActive && 
                         leader && 
                         leader.vote_count > 0 && 
                         !isDraw;

        return {
          ...p,
          winner: hasWinner ? leader : null,
          hasWinner,
          isDraw,
        };
      });
      
      setResults(finalResults);
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error("Error fetching results:", error);
      toast({
        title: "Data Error",
        description: "Failed to fetch election results.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, results.length, electionStatus.isVotingActive]);

  const toggleResultsVisibility = async () => {
    try {
      // Update results stage to publish/unpublish results
      const { error } = await supabase
        .from('election_timeline')
        .update({ is_active: !isResultsVisible })
        .match({ 
          stage_name: 'Results Publication',
        });

      if (error) throw error;

      setIsResultsVisible(!isResultsVisible);
      toast({
        title: isResultsVisible ? "Results Hidden" : "Results Published",
        description: isResultsVisible 
          ? "Results are now hidden from public view." 
          : "Results are now visible to all voters.",
      });
    } catch (error) {
      console.error('Error toggling results visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update results visibility.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchResults();
    fetchVotingStats();

    // Set up real-time subscriptions
    const resultsChannel = supabase
      .channel("admin-results-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        () => {
          fetchResults();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "voters" },
        () => {
          fetchVotingStats();
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds during voting
    const interval = setInterval(() => {
      if (electionStatus.isVotingActive) {
        fetchResults();
        fetchVotingStats();
      }
    }, 30000);

    return () => {
      supabase.removeChannel(resultsChannel);
      clearInterval(interval);
    };
  }, [fetchResults, fetchVotingStats, electionStatus.isVotingActive]);

  // Check if results should be visible based on timeline
  useEffect(() => {
    setIsResultsVisible(electionStatus.isResultsPublished);
  }, [electionStatus.isResultsPublished]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
        <span className="text-lg">Loading live results...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Controls Header */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Admin Live Results Monitor
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  fetchResults();
                  fetchVotingStats();
                }}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={toggleResultsVisibility}
                variant={isResultsVisible ? "destructive" : "default"}
                size="sm"
              >
                {isResultsVisible ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Results
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Publish Results
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Election Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Election Status</span>
              </div>
              <Badge 
                variant={electionStatus.isVotingActive ? "default" : "secondary"}
                className={electionStatus.isVotingActive ? "bg-green-600" : ""}
              >
                {electionStatus.isVotingActive ? "VOTING ACTIVE" : 
                 electionStatus.isVotingEnded ? "VOTING ENDED" : "NOT STARTED"}
              </Badge>
            </div>

            {/* Voting Statistics */}
            {votingStats && (
              <>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Total Voters</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-800">{votingStats.totalVoters}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Votes Cast</span>
                  </div>
                  <p className="text-2xl font-bold text-green-800">{votingStats.totalVoted}</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Turnout Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-800">
                    {votingStats.turnoutRate.toFixed(1)}%
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Results Visibility Alert */}
      <Alert className={isResultsVisible ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50"}>
        <AlertDescription className="flex items-center gap-2">
          {isResultsVisible ? (
            <>
              <Eye className="w-4 h-4 text-green-600" />
              <span className="text-green-800">Results are currently <strong>visible</strong> to all voters.</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-orange-600" />
              <span className="text-orange-800">Results are currently <strong>hidden</strong> from public view.</span>
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Results Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((positionResult) => (
          <Card key={positionResult.position} className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-primary" />
                  {positionResult.position}
                </div>
                <Badge variant="outline">
                  {positionResult.totalVotes} votes
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {positionResult.candidates.map((candidate, idx) => {
                const percentage = positionResult.totalVotes > 0 
                  ? (candidate.vote_count / positionResult.totalVotes) * 100 
                  : 0;
                
                const isLeading = idx === 0 && candidate.vote_count > 0;
                const isWinner = positionResult.hasWinner && isLeading;

                return (
                  <div
                    key={candidate.id}
                    className={`p-4 rounded-lg border ${
                      isWinner 
                        ? 'border-green-500 bg-green-50' 
                        : isLeading 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {candidate.picture_url && (
                          <img
                            src={candidate.picture_url}
                            alt={candidate.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold">{candidate.full_name}</h4>
                          <p className="text-sm text-gray-600">
                            {percentage.toFixed(1)}% ({candidate.vote_count} votes)
                          </p>
                        </div>
                      </div>
                      {isWinner && (
                        <Badge className="bg-green-600">
                          <CheckCheck className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <Card className="p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Results Available</h3>
          <p className="text-gray-500">
            No candidates or voting data found. Please ensure the election is properly configured.
          </p>
        </Card>
      )}
    </div>
  );
}