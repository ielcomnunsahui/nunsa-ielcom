import { useEffect, useState, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Scale, BarChart3, Loader2, Users, CheckCheck, Shield, AlertTriangle, ScrollText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// --- Configuration ---
// MOCK: Set a fixed election end date for demonstration. 
// This should be dynamically fetched from your database in a production environment.
const ELECTION_END_TIME_MOCK = new Date('2025-11-20T00:53:59').getTime(); 

// --- Type Definitions ---
interface Candidate {
  id: string;
  full_name: string;
  position: string;
  picture_url: string | null;
  vote_count: number;
}

interface PositionResults {
  position: string;
  candidates: Candidate[];
  totalVotes: number;
  winner: Candidate | null;
  hasWinner: boolean;
  isDraw: boolean;
}


// --- Component A: Countdown Timer and Status Management (New Component) ---
interface CountdownProps {
  endTime: number;
  setIsLive: (isLive: boolean) => void;
}

const CountdownTimer = ({ endTime, setIsLive }: CountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const difference = endTime - now;
      
      if (difference <= 0) {
        setTimeRemaining(0);
        setIsLive(false); // Election Period Ended
        clearInterval(interval);
      } else {
        setTimeRemaining(difference);
        setIsLive(true); // Election is Live
      }
    };

    calculateTimeRemaining(); // Initial calculation
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endTime, setIsLive]);

  const seconds = Math.floor((timeRemaining / 1000) % 60);
  const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
  const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

  if (timeRemaining <= 0) {
    return (
      <div className="flex items-center justify-center p-3 bg-green-100 border-l-4 border-green-600 rounded-lg text-green-800 font-semibold text-sm">
        <Shield className="w-5 h-5 mr-2" />
        VOTING PERIOD CONCLUDED. RESULTS FINALIZED.
      </div>
    );
  }

  const TimeSegment = ({ value, label }: { value: number | string, label: string }) => (
    <div className="text-center p-2 bg-primary/5 rounded-md w-16">
      <div className="text-2xl font-black text-primary leading-none">{value.toString().padStart(2, '0')}</div>
      <div className="text-xs font-medium text-muted-foreground uppercase mt-0.5">{label}</div>
    </div>
  );

  return (
    <div className="p-4 bg-white shadow-xl rounded-lg border-t-4 border-red-600">
      <div className="flex items-center justify-center mb-3">
        <Clock className="w-5 h-5 text-red-600 mr-2 animate-pulse" />
        <h3 className="text-lg font-bold text-red-600 uppercase tracking-wider">VOTING ENDS IN</h3>
      </div>
      <div className="flex justify-center space-x-3">
        {days > 0 && <TimeSegment value={days} label="Days" />}
        <TimeSegment value={hours} label="Hrs" />
        <TimeSegment value={minutes} label="Mins" />
        <TimeSegment value={seconds} label="Secs" />
      </div>
    </div>
  );
};


// --- Component B: Key Metrics Summary (Clinical/Analytical) ---
const KeyMetrics = ({ results }: { results: PositionResults[] }) => {
  const totalPositions = results.length;
  const totalCandidates = results.reduce((acc, p) => acc + p.candidates.length, 0);
  const grandTotalVotes = results.reduce((acc, p) => acc + p.totalVotes, 0);

  const MetricCard = ({ title, value, icon, className }: { title: string, value: string | number, icon: React.ReactNode, className: string }) => (
    <Card className={`p-4 shadow-lg border-l-4 transition-all duration-300 ${className} rounded-lg`}>
      <div className="flex items-center justify-between">
        <div className="w-7 h-7 flex-shrink-0">{icon}</div>
        <CardTitle className="text-xs md:text-sm font-bold text-muted-foreground uppercase text-right">{title}</CardTitle>
      </div>
      <p className="text-2xl md:text-3xl font-black text-foreground mt-2">
        {value.toLocaleString()}
      </p>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
      <MetricCard 
        title="CATEGORIES" 
        value={totalPositions} 
        icon={<Scale className="text-indigo-500 w-full h-full" />}
        className="border-indigo-500"
      />
      <MetricCard 
        title="FELLOWS" 
        value={totalCandidates} 
        icon={<Users className="text-blue-500 w-full h-full" />}
        className="border-blue-500"
      />
      <MetricCard 
        title="TOTAL BALLOTS" 
        value={grandTotalVotes} 
        icon={<BarChart3 className="text-green-500 w-full h-full" />}
        className="border-green-500"
      />
    </div>
  );
};


// --- Component C: Tally Unit Card (Improved Clarity) ---
const TallyUnitCard = memo(({ candidate, totalVotes, isLeading, isWinner, isDraw, rank }: { candidate: Candidate, totalVotes: number, isLeading: boolean, isWinner: boolean, isDraw: boolean, rank: number }) => {
  const percentage = totalVotes > 0 ? (candidate.vote_count / totalVotes) * 100 : 0;
  
  let cardClass = 'border-gray-200 bg-card';
  let voteColor = 'text-foreground';
  let indicatorColorClass = 'bg-primary'; 

  if (isWinner) {
    cardClass = 'border-green-600 bg-green-50 shadow-md ring-2 ring-green-100';
    voteColor = 'text-green-800';
    indicatorColorClass = 'bg-green-600';
  } else if (isDraw && isLeading) {
    cardClass = 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-100';
    voteColor = 'text-orange-700';
    indicatorColorClass = 'bg-orange-500';
  } else if (isLeading) {
    cardClass = 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20';
    voteColor = 'text-primary';
    indicatorColorClass = 'bg-primary';
  }

  let badgeText = `RANK ${rank}`;
  if (isWinner) {
    badgeText = "NEWLY ELECTED"; 
  } else if (isDraw && isLeading) {
    badgeText = "TIE FOR LEAD";
  }

  return (
    <div
      className={`p-4 rounded-xl border-l-4 sm:border-l-6 transition-all duration-300 flex flex-col gap-3 ${cardClass} relative`}
    >
      
      {/* Name and Rank/Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {candidate.picture_url && (
            <img 
              src={candidate.picture_url} 
              alt={candidate.full_name}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 flex-shrink-0 ${isWinner ? 'border-green-600' : 'border-gray-300'}`}
            />
          )}
          <div className="min-w-0"> 
            <h3 className={`text-base sm:text-lg font-bold ${voteColor} leading-tight truncate`}>
              {candidate.full_name}
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {percentage.toFixed(2)}% of Valid Ballots
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <Badge className={`text-xs font-extrabold px-3 py-1 mt-1 ${
          isWinner ? 'bg-green-600 hover:bg-green-600 text-white' : isDraw && isLeading ? 'bg-orange-500 hover:bg-orange-500 text-white' : 'bg-gray-200 hover:bg-gray-200 text-gray-700'
        }`}>
          {badgeText}
          {isWinner && <CheckCheck className="w-3 h-3 ml-1" />}
        </Badge>
      </div>
      

      {/* Vote Count and Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Tally Count</p>
            <div className={`text-xl font-black ${voteColor}`}>
                {candidate.vote_count.toLocaleString()}
            </div>
        </div>
        <Progress 
            value={percentage} 
            className={`h-2 rounded-full bg-gray-200 [&>div]:${indicatorColorClass}`}
        />
      </div>
    </div>
  );
});


// --- Component D: Category Tally Section (Per Position) ---
const CategoryTallySection = ({ positionResult, index, isElectionLive }: { positionResult: PositionResults, index: number, isElectionLive: boolean }) => {
  
  const getStatusText = () => {
    if (!isElectionLive) {
      if (positionResult.totalVotes === 0) return "NO VALID BALLOTS CAST";
      if (positionResult.isDraw) return "FINALIZED - TIE REQUIRES REVIEW";
      if (positionResult.hasWinner) return "FINALIZED - WINNER DECLARED";
      return "RESULTS FINALIZED";
    }
    if (positionResult.totalVotes === 0) return "TALLY PENDING";
    if (positionResult.isDraw) return "REAL-TIME MONITORING (CLOSE CONTEST)";
    return "REAL-TIME MONITORING ACTIVE";
  }

  const getStatusClass = () => {
    if (!isElectionLive) {
      return positionResult.isDraw ? 'text-orange-600' : 'text-green-600';
    }
    return positionResult.isDraw ? 'text-red-600 animate-pulse' : 'text-primary animate-pulse';
  }

  return (
    <Card 
      className="p-4 sm:p-6 bg-card shadow-2xl transition-shadow duration-500 rounded-xl"
    >
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-xl sm:text-2xl font-extrabold text-primary border-b border-border pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-primary" />
                {positionResult.position}
            </span>
            <span className={`text-xs font-bold uppercase ${getStatusClass()}`}>
                {getStatusText()}
            </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {positionResult.candidates.length > 0 ? (
          <div className="space-y-4">
            {positionResult.candidates.map((candidate, idx) => {
              const isLeading = idx === 0 && candidate.vote_count > 0;
              const isWinner = !isElectionLive && isLeading && !positionResult.isDraw;
              const isTiedLeader = positionResult.isDraw && isLeading;
              
              return (
                <TallyUnitCard
                  key={candidate.id}
                  candidate={candidate}
                  totalVotes={positionResult.totalVotes}
                  isLeading={isLeading}
                  isWinner={isWinner}
                  isDraw={isTiedLeader}
                  rank={idx + 1}
                />
              );
            })}
          </div>
        ) : (
             <div className="text-center p-4 bg-gray-50 rounded-md border border-dashed text-sm text-muted-foreground">
                No candidates registered for this category.
            </div>
        )}
        
        <div className="mt-6 pt-3 border-t border-border text-sm text-center bg-muted/30 p-3 rounded-lg">
          Total Valid Ballots: <span className="text-primary font-extrabold">{positionResult.totalVotes.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};


// --- Main Results Component ---
const Results = () => {
  const [results, setResults] = useState<PositionResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectionLive, setIsElectionLive] = useState(true); 
  const { toast } = useToast();

  const fetchResults = useCallback(async (currentLiveStatus: boolean) => {
    if (results.length === 0) setIsLoading(true); 
    
    try {
      const { data: candidates, error } = await supabase
        .from("candidates")
        .select("id, full_name, position, picture_url, vote_count")
        .order("position", { ascending: true }) 
        .order("vote_count", { ascending: false });

      if (error) throw error;

      // 1. Group and aggregate data
      const grouped = (candidates || []).reduce((acc, candidate) => {
        const existing = acc.find((p) => p.position === candidate.position);
        if (existing) {
          existing.candidates.push(candidate);
          existing.totalVotes += candidate.vote_count;
        } else {
          acc.push({
            position: candidate.position,
            candidates: [candidate],
            totalVotes: candidate.vote_count,
            winner: null,
            hasWinner: false,
            isDraw: false,
          });
        }
        return acc;
      }, [] as PositionResults[]);

      // 2. Determine winner/draw status
      const finalResults = grouped.map(p => {
        const leader = p.candidates[0];
        const second = p.candidates[1];

        const isDraw = p.candidates.length > 1 && leader?.vote_count > 0 && leader.vote_count === second.vote_count;
        const isWinner = !currentLiveStatus && leader && leader.vote_count > 0 && !isDraw;
        const isSingleCandidateWinner = !currentLiveStatus && p.candidates.length === 1 && leader?.vote_count > 0;
        const finalIsWinner = isWinner || isSingleCandidateWinner;

        return {
          ...p,
          winner: finalIsWinner ? leader : null,
          hasWinner: finalIsWinner,
          isDraw: isDraw,
        };
      });
      
      setResults(finalResults);
      
    } catch (error) {
      console.error("Error fetching results:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch election data.";
      toast({
        title: "Data Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, results.length]);


  useEffect(() => {
    // Initial fetch and dependency on isElectionLive (from timer)
    fetchResults(isElectionLive); 

    // Real-time subscription for live updates (only active if isElectionLive is true)
    const channel = supabase
      .channel("results-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        () => { 
          if (isElectionLive) {
            fetchResults(true); // Re-fetch with live status
          }
        } 
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchResults, isElectionLive]); 

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 px-4 pb-12">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground">Initiating Tally Audit...</h2>
              <p className="text-muted-foreground mt-2">Retrieving secure data.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- Main Display ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 px-4 pb-16">
        <div className="container mx-auto max-w-7xl">
          {/* Header - Professional and Data-Focused */}
          <div className="text-center mb-12 p-6 rounded-xl bg-card shadow-xl border-t-8 border-primary">
            <div className="inline-flex items-center justify-center p-4 bg-primary rounded-full shadow-lg mb-4">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-1 uppercase tracking-wide text-foreground">
              INSTITUTIONAL ELECTION TALLY
            </h1>
            <p className={`text-lg md:text-xl font-black ${isElectionLive ? 'text-red-600' : 'text-green-600'}`}>
              {isElectionLive ? "Real-Time Monitoring" : "Finalized Institutional Record"}
            </p>
          </div>

          {/* Countdown / Finalized Banner */}
          <div className="mb-12">
            <CountdownTimer 
                endTime={ELECTION_END_TIME_MOCK} 
                setIsLive={setIsElectionLive}
            />
          </div>

          {/* Key Metrics */}
          <KeyMetrics results={results} />
          
          {/* Results by Position (Grid Layout for Desktop, Stacked for Mobile) */}
          <h2 className="text-2xl font-bold text-foreground mb-6 border-b pb-2">Category Tally Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.length > 0 ? (
              results.map((positionResult, index) => (
                <CategoryTallySection 
                  key={positionResult.position} 
                  positionResult={positionResult} 
                  index={index}
                  isElectionLive={isElectionLive}
                />
              ))
            ) : (
              // --- No Results State ---
              <Card className="p-12 text-center shadow-lg col-span-full bg-card border-dashed border-gray-300 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">No Tally Data Available</h3>
                <p className="text-gray-500">
                  Please ensure candidates and voting categories have been configured in the administration system.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;