import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
}

const Results = () => {
  const [results, setResults] = useState<PositionResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchResults = async () => {
    try {
      const { data: candidates, error } = await supabase
        .from("candidates")
        .select("*")
        .order("position", { ascending: true })
        .order("vote_count", { ascending: false });

      if (error) throw error;

      // Group by position
      const grouped = candidates?.reduce((acc, candidate) => {
        const existing = acc.find((p) => p.position === candidate.position);
        if (existing) {
          existing.candidates.push(candidate);
          existing.totalVotes += candidate.vote_count;
        } else {
          acc.push({
            position: candidate.position,
            candidates: [candidate],
            totalVotes: candidate.vote_count,
          });
        }
        return acc;
      }, [] as PositionResults[]);

      setResults(grouped || []);
    } catch (error) {
      console.error("Error fetching results:", error);
      toast({
        title: "Error",
        description: "Failed to fetch election results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("results-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "candidates",
        },
        () => {
          fetchResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 pb-12">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center py-20">
              <div className="animate-pulse-glow inline-block p-4 bg-gradient-primary rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-muted-foreground">Loading results...</p>
            </div>
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
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-success rounded-full shadow-success-glow mb-4">
              <Trophy className="w-12 h-12 text-success-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Live Election Results
            </h1>
            <p className="text-xl text-muted-foreground">
              Real-time updates • Completely transparent
            </p>
          </div>

          {/* Results by Position */}
          <div className="space-y-12">
            {results.map((positionResult, index) => (
              <Card key={positionResult.position} className="p-8 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-border pb-4">
                  {positionResult.position}
                </h2>
                
                <div className="space-y-6">
                  {positionResult.candidates.map((candidate, idx) => {
                    const percentage = positionResult.totalVotes > 0 
                      ? (candidate.vote_count / positionResult.totalVotes) * 100 
                      : 0;
                    const isLeading = idx === 0 && candidate.vote_count > 0;

                    return (
                      <div 
                        key={candidate.id} 
                        className={`p-6 rounded-xl border ${
                          isLeading 
                            ? 'border-success bg-success/5 shadow-success-glow' 
                            : 'border-border bg-card'
                        } transition-all`}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          {candidate.picture_url && (
                            <img 
                              src={candidate.picture_url} 
                              alt={candidate.full_name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-border"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold text-foreground">
                                {candidate.full_name}
                              </h3>
                              {isLeading && (
                                <Trophy className="w-5 h-5 text-success" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {candidate.vote_count} votes • {percentage.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-3xl font-bold text-primary">
                            {candidate.vote_count}
                          </div>
                        </div>
                        
                        <Progress 
                          value={percentage} 
                          className={`h-3 ${isLeading ? 'bg-success/20' : ''}`}
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground text-center">
                  Total votes cast: {positionResult.totalVotes}
                </div>
              </Card>
            ))}
          </div>

          {results.length === 0 && (
            <Card className="p-12 text-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">No Results Yet</h3>
              <p className="text-muted-foreground">
                Results will appear here once voting begins
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Results;
