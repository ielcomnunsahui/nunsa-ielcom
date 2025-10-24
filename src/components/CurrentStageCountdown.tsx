import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client"; // Ensure this path is correct
import CountdownTimer from "./CountdownTimer"; // Ensure this path is correct
import { Loader2, AlertCircle } from "lucide-react";

// The same interface from your previous code
interface TimelineStage {
    id: string;
    stage_name: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
    // Add columns for link/color if they exist in your DB schema
    link_id?: string;
    link_text?: string;
    color_class?: string; // e.g., 'text-blue-600'
}

export function CurrentStageCountdown() {
    const [currentStage, setCurrentStage] = useState<TimelineStage | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCurrentStage = async () => {
        try {
            // Get the current time in ISO format for comparison in the database
            const now = new Date().toISOString(); 
            
            const { data, error } = await supabase
                .from("election_timeline")
                .select("*")
                .eq("is_active", true) // Only active stages
                // Find a stage where 'now' is between the start and end times
                .lte("start_time", now) // start_time <= now
                .gte("end_time", now) // end_time >= now (This finds the current/active one)
                .limit(1); // Only need the single active stage

            if (error) throw error;

            // If an active stage is found, set it. Otherwise, set null.
            setCurrentStage(data?.[0] || null);

        } catch (error) {
            console.error("Error fetching current stage:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // 1. Initial Data Fetch
        fetchCurrentStage();

        // 2. Set up Real-time Subscription (Same as your previous code)
        const channel = supabase
            .channel('current-stage-countdown')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'election_timeline'
                },
                // When any stage changes, re-fetch to see if the current one has changed
                () => { fetchCurrentStage(); }
            )
            .subscribe();

        return () => {
            // Cleanup on unmount
            supabase.removeChannel(channel);
        };
    }, []); // Empty dependency array: runs only on mount/unmount

    // --- Conditional Rendering ---
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentStage) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
                <AlertCircle className="w-10 h-10 text-yellow-600 mx-auto mb-4" />
                <p className="text-lg font-semibold">No Active Election Stage Right Now</p>
                <p className="text-sm text-muted-foreground">Check the full timeline for upcoming events.</p>
            </div>
        );
    }

    // --- Render the Countdown Component ---
    return (
        <CountdownTimer 
            title="Current Stage"
            // The key props required by the CountdownTimer
            targetDate={new Date(currentStage.end_time)} // Use the END time for the countdown
            stageName={currentStage.stage_name}
            stageColor={currentStage.color_class || 'text-blue-600'} // Default color if DB field is null
            
            // Optional props for post-completion action
            linkToId={currentStage.link_id} 
            linkText={currentStage.link_text}
        />
    );
}