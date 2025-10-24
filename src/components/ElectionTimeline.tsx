import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface Stage {
  id: string;
  stage_name: string;
  start_time: string;
  end_time: string;
}

const ElectionTimeline: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const { data, error } = await supabase
          .from("election_timeline")
          .select("*")
          .order("start_time", { ascending: true });

        if (error) throw error;
        setStages(data || []);
      } catch (err: any) {
        console.error("Error fetching stages:", err.message);
        setError("Failed to load election timeline.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStages();
  }, []);

  // Determine the status of each stage
  const getStageStatus = (stage: Stage) => {
    const now = new Date();
    const start = new Date(stage.start_time);
    const end = new Date(stage.end_time);

    if (now >= start && now <= end) return "active";
    if (now < start) return "upcoming";
    return "completed";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-10 text-muted-foreground animate-pulse">
        Loading election timeline...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-10 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  // Empty state
  if (stages.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No election stages found.
      </div>
    );
  }

  // Main timeline display
  return (
    <div className="w-full grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stages.map((stage, index) => {
        const status = getStageStatus(stage);
        const isActive = status === "active";

        // Captivating style logic
        const cardClassName = `
          flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 text-center h-full
          transition-all duration-300 ease-in-out
          ${isActive
            ? "bg-green-100/30 border-green-500 shadow-xl scale-[1.02] ring-4 ring-green-500/50 animate-pulse"
            : "bg-card border-border hover:shadow-md hover:scale-[1.01]"
          }
        `;

        return (
          <div
            key={stage.id}
            className={cardClassName}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Calendar
              className={`w-8 h-8 mb-2 ${
                isActive
                  ? "text-green-600 animate-bounce"
                  : status === "upcoming"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            />

            <h3 className="font-bold text-lg text-foreground">
              {stage.stage_name}
            </h3>

            <p className="text-sm text-muted-foreground">
              {new Date(stage.start_time).toLocaleDateString()} –{" "}
              {new Date(stage.end_time).toLocaleDateString()}
            </p>

            <span
              className={`mt-2 text-xs font-semibold uppercase px-3 py-1 rounded-full ${
                isActive
                  ? "bg-green-500/20 text-green-700"
                  : status === "upcoming"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {status === "active"
                ? "Active Now"
                : status === "upcoming"
                ? "Upcoming"
                : "Closed"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ElectionTimeline;
