import { useEffect, useState, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Loader2, Users, UserCheck, Zap, BarChart3, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
  isDraw: boolean; // NEW: Indicates if there's a tie for the leading position
}

// --- Component 1: Key Metrics Summary (Mobile-Optimized) ---
const KeyMetrics = ({ results }: { results: PositionResults[] }) => {
    const totalPositions = results.length;
    const totalCandidates = results.reduce((acc, p) => acc + p.candidates.length, 0);
    const grandTotalVotes = results.reduce((acc, p) => acc + p.totalVotes, 0);

    const MetricCard = ({ title, value, icon, className }: { title: string, value: string | number, icon: React.ReactNode, className: string }) => (
        <Card className={`p-3 sm:p-4 md:p-6 shadow-xl border-t-4 border-b-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${className}`}>
            <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm font-bold text-gray-500 uppercase">{title}</CardTitle>
                <div className="w-5 h-5 md:w-8 md:h-8">{icon}</div>
            </div>
            <p className="text-2xl md:text-4xl font-black text-gray-900 mt-1 md:mt-2">
                {value.toLocaleString()}
            </p>
        </Card>
    );

    return (
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-12"> {/* Optimized grid for mobile */}
            <MetricCard 
                title="Races" 
                value={totalPositions} 
                icon={<Trophy className="text-amber-500 w-full h-full" />}
                className="border-amber-500"
            />
            <MetricCard 
                title="Contestants" 
                value={totalCandidates} 
                icon={<Users className="text-blue-500 w-full h-full" />}
                className="border-blue-500"
            />
            <MetricCard 
                title="Total Votes" 
                value={grandTotalVotes} 
                icon={<BarChart3 className="text-green-500 w-full h-full" />}
                className="border-green-500"
            />
        </div>
    );
};


// --- Component 2: Candidate Display Card (Dramatic Light Theme) ---
const CompetitiveCandidateCard = memo(({ candidate, totalVotes, isLeading, isWinner, isDraw, rank }: { candidate: Candidate, totalVotes: number, isLeading: boolean, isWinner: boolean, isDraw: boolean, rank: number }) => {
    const percentage = totalVotes > 0 ? (candidate.vote_count / totalVotes) * 100 : 0;
    
    // Dynamic dramatic styling
    let cardClass = 'border-gray-200 bg-white hover:shadow-xl hover:border-gray-300';
    let voteColor = 'text-gray-900';
    let progressColor = 'bg-indigo-600';

    if (isWinner) {
        // High drama: Gold/Amber border, strong shadow
        cardClass = 'border-amber-500 bg-amber-50 shadow-dramatic-winner ring-4 ring-amber-200 scale-[1.02] transition-all duration-700';
        voteColor = 'text-amber-700';
        progressColor = 'bg-amber-500';
    } else if (isDraw && isLeading) {
         // Draw Indication: Orange/Warning
        cardClass = 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-100';
        voteColor = 'text-orange-700';
        progressColor = 'bg-orange-500';
    } else if (isLeading) {
        // Excitement: Primary color border, subtle pulse
        cardClass = 'border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-100';
        voteColor = 'text-indigo-700';
        progressColor = 'bg-indigo-600';
    }

    return (
        <div
            className={`p-4 sm:p-6 rounded-xl border-l-4 sm:border-l-8 transition-all duration-500 ease-in-out flex flex-col gap-3 ${cardClass} relative`}
        >
            {/* Rank Badge */}
            <Badge className={`absolute top-0 right-4 transform -translate-y-1/2 text-sm font-extrabold px-3 py-1 shadow-lg ${isWinner ? 'bg-amber-500 text-gray-900' : isDraw && isLeading ? 'bg-orange-500 text-white' : 'bg-gray-700 text-white'}`}>
                {isWinner ? "NEWLY ELECTED" : isDraw && isLeading ? "TIED FOR LEAD" : `RANK ${rank}`}
            </Badge>

            {/* Top Row: Info & Vote Count */}
            <div className="flex items-center flex-grow gap-4">
                {candidate.picture_url && (
                    <img 
                        src={candidate.picture_url} 
                        alt={candidate.full_name}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 transition-colors ${isWinner ? 'border-amber-500 shadow-md' : 'border-gray-300'}`}
                    />
                )}
                
                {/* FLEXIBLE NAME CONTAINER */}
                <div className="flex-1 min-w-0 pr-4"> 
                    <div className="flex items-start gap-2">
                        <h3 className={`text-lg sm:text-xl font-black ${voteColor} transition-colors leading-tight`}>
                            {candidate.full_name}
                        </h3>
                        {/* Engaging Icon: Trophy or Alert for draw */}
                        {isWinner && <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0 text-amber-500 fill-amber-200`} />}
                        {isLeading && !isWinner && !isDraw && <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0 text-indigo-500`} />}
                        {isDraw && isLeading && <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0 text-orange-500`} />}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                        {percentage.toFixed(2)}% of total votes
                    </p>
                </div>

                {/* Vote Count - Dramatic and prominent */}
                <div className="text-right flex-shrink-0">
                    <div className={`text-2xl sm:text-3xl font-black ${voteColor}`}>
                        {candidate.vote_count.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-400 font-medium hidden sm:block">VOTES</p>
                </div>
            </div>

            {/* Progress Bar - Simple and clear indicator */}
            <Progress 
                value={percentage} 
                className="h-2 rounded-full bg-gray-200"
                indicatorClass={progressColor}
            />
        </div>
    );
});


// --- Component 3: Race Section (Per Position) ---
const RaceSection = ({ positionResult, index, isElectionLive }: { positionResult: PositionResults, index: number, isElectionLive: boolean }) => {
    
    const getStatusText = () => {
        if (!isElectionLive) {
            if (positionResult.isDraw) return "RACE ENDED IN A TIE!";
            if (positionResult.hasWinner) return "RACE CONCLUDED";
            return "RESULTS FINALIZED";
        }
        if (positionResult.isDraw) return "TOO CLOSE TO CALL!";
        return "LIVE TALLY IN PROGRESS";
    }

    const getStatusClass = () => {
        if (!isElectionLive) {
            return positionResult.isDraw ? 'text-red-600' : 'text-green-600';
        }
        return positionResult.isDraw ? 'text-orange-600 animate-pulse' : 'text-red-600 animate-pulse';
    }

    return (
        <Card 
            className="p-4 sm:p-8 bg-white shadow-2xl border-t-8 border-indigo-600 transition-shadow duration-500"
            style={{animationDelay: `${index * 0.1}s`}} 
        >
            <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-indigo-800 border-b-2 border-gray-100 pb-3 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-indigo-600" />
                    {positionResult.position}
                </CardTitle>
                <div className={`text-sm font-bold mt-2 uppercase ${getStatusClass()}`}>
                    {getStatusText()}
                </div>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
                <div className="space-y-4">
                    {positionResult.candidates.map((candidate, idx) => {
                        // isLeading is true if it's the top candidate AND they have votes
                        const isLeading = idx === 0 && candidate.vote_count > 0;
                        const isWinner = !isElectionLive && isLeading && !positionResult.isDraw;
                        
                        // Check if the current candidate is part of a leading tie
                        const isTiedLeader = positionResult.isDraw && isLeading;

                        return (
                            <CompetitiveCandidateCard
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
                
                <div className="mt-6 pt-4 border-t border-gray-100 text-sm sm:text-base text-gray-600 font-semibold text-center bg-indigo-50 p-3 rounded-lg">
                    Total Valid Votes: <span className="text-indigo-700 font-extrabold">{positionResult.totalVotes.toLocaleString()}</span>
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

    const fetchResults = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentLiveStatus = isElectionLive; 

            const { data: candidates, error } = await supabase
                .from("candidates")
                .select("*")
                .order("position", { ascending: true })
                .order("vote_count", { ascending: false });

            if (error) throw error;

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

            const finalResults = grouped.map(p => {
                const leader = p.candidates[0];
                const second = p.candidates[1];

                // Determine if there is a draw for the lead
                const isDraw = p.candidates.length > 1 && leader.vote_count > 0 && leader.vote_count === second.vote_count;
                
                // Determine the winner (no draw AND leader exists)
                const isWinner = !currentLiveStatus && leader && leader.vote_count > 0 && !isDraw;
                
                // If only one candidate, they are the leader (and potential winner)
                const isSingleCandidateWinner = !currentLiveStatus && p.candidates.length === 1 && leader.vote_count > 0;
                
                const finalIsWinner = isWinner || isSingleCandidateWinner;

                return {
                    ...p,
                    winner: finalIsWinner ? leader : null,
                    hasWinner: finalIsWinner,
                    isDraw: isDraw, // Pass the draw status
                };
            });
            
            setResults(finalResults);
        } catch (error) {
            console.error("Error fetching results:", error);
            toast({
                title: "Data Error",
                description: "Failed to fetch live election results.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, isElectionLive]);

    // Mock toggle function for admin testing/demo
    const toggleElectionStatus = () => {
        setIsElectionLive(prev => !prev);
        fetchResults(); 
    };

    useEffect(() => {
        fetchResults();

        // Real-time subscription for live updates
        const channel = supabase
            .channel("results-updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "candidates" },
                () => { isElectionLive && fetchResults(); } 
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
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-700">Loading Scoreboard...</h2>
                            <p className="text-muted-foreground mt-2">Preparing the high-stakes tally.</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // --- Final Results Banner (Dramatic Light) ---
    const FinalResultsBanner = () => {
        if (isElectionLive) return null;

        const allRacesConcluded = results.every(p => p.hasWinner || p.isDraw || p.totalVotes === 0);
        
        return (
            <Card className={`p-6 md:p-8 text-white shadow-3xl mb-12 border-0 animate-pulse-slow ${allRacesConcluded ? 'bg-green-500 shadow-green-400/50' : 'bg-red-500 shadow-red-400/50'}`}>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                    {allRacesConcluded ? 
                        <UserCheck className="w-12 h-12 flex-shrink-0 text-white" /> : 
                        <AlertTriangle className="w-12 h-12 flex-shrink-0 text-white" />
                    }
                    <div>
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-1 uppercase tracking-wider">
                            {allRacesConcluded ? "VICTORY DECLARED!" : "ELECTION CLOSED - REVIEW REQUIRED"}
                        </h2>
                        <p className="text-lg md:text-xl font-medium text-white/90">
                            {allRacesConcluded ? "The election is officially closed. View the confirmed results below." : "Election is closed but results for some races are incomplete or tied."}
                        </p>
                    </div>
                </div>
            </Card>
        );
    };

    // --- Main Display ---
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="pt-24 px-4 pb-16">
                <div className="container mx-auto max-w-7xl">
                    {/* Header - Dramatic and Bold */}
                    <div className="text-center mb-16 p-6 rounded-xl bg-white shadow-2xl border-t-8 border-indigo-600/90">
                        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full shadow-2xl mb-4">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-2 uppercase tracking-wide text-gray-900">
                            LIVE ELECTION TRACKER
                        </h1>
                        <p className={`text-xl md:text-2xl font-black ${isElectionLive ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                            {isElectionLive ? "RACE IS ON!" : "RESULTS FINALIZED"}
                        </p>
                    </div>

                    {/* Admin Toggle (MOCK) - Use for demonstration */}
                    <div className="flex justify-center mb-12">
                        <button 
                            onClick={toggleElectionStatus}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-lg ${isElectionLive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        >
                            {isElectionLive ? 'Finalize Election' : 'Reopen Live Tally'}
                        </button>
                    </div>

                    {/* Key Metrics */}
                    <KeyMetrics results={results} />
                    
                    {/* Final Results Banner */}
                    <FinalResultsBanner />

                    {/* Results by Position */}
                    <div className="space-y-12">
                        {results.length > 0 ? (
                            results.map((positionResult, index) => (
                                <RaceSection 
                                    key={positionResult.position} 
                                    positionResult={positionResult} 
                                    index={index}
                                    isElectionLive={isElectionLive}
                                />
                            ))
                        ) : (
                            // --- No Results State ---
                            <Card className="p-12 text-center shadow-lg bg-white border-dashed border-gray-300 text-gray-700">
                                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold mb-2">No Active Races</h3>
                                <p className="text-gray-500">
                                    The election schedule may not have started yet. Check back soon for the live tally!
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