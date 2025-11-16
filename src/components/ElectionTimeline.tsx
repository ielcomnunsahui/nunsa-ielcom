// src/components/ElectionTimeline.tsx

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
// ADDED Badge for warnings
import { Badge } from "@/components/ui/badge"; 
// ADDED AlertTriangle for the warning icon
import { Calendar, Loader2, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"; 

// FIX 1: Interface to match the ACTUAL Supabase table structure
interface Stage {
    id: string;
    stage_name: string;
    start_time: string;
    end_time: string;
    created_at: string;
    is_active: boolean; 
}

// FIX 2: Interface for the data used in the component's state and rendering logic
interface ProcessedStage extends Stage {
    description: string;
    action_link: string;
}

// --- Helper Functions ---

const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getStageStatus = (stage: Stage) => {
    const now = new Date();
    const start = new Date(stage.start_time);
    const end = new Date(stage.end_time);

    if (now >= start && now <= end) return "active";
    if (now < start) return "upcoming";
    return "completed";
};

// NEW: Helper function to check if an active stage is ending in the next 24 hours
const isEndingSoon = (stage: Stage): boolean => {
    const status = getStageStatus(stage);
    if (status !== 'active') return false;
    
    const now = new Date().getTime();
    const endTime = new Date(stage.end_time).getTime();
    // 24 hours in milliseconds
    const twentyFourHours = 24 * 60 * 60 * 1000; 

    // Is active AND end time is within the next 24 hours
    return (endTime - now > 0) && (endTime - now <= twentyFourHours);
}


// --- ELECTION TIMELINE COMPONENT ---

const ElectionTimeline: React.FC = () => {
    const [stages, setStages] = useState<ProcessedStage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from Supabase
    useEffect(() => {
        const fetchStages = async () => {
            try {
                // Supabase query is correct, only selecting existing columns
                const { data, error } = await supabase
                    .from("election_timeline") 
                    .select("id, stage_name, start_time, end_time, created_at, is_active")
                    .order("start_time", { ascending: true });

                if (error) throw error;
                
                // Map the raw data and generate the missing fields (description and action_link)
                const processedData: ProcessedStage[] = (data || []).map((stage: any) => {
                    const status = getStageStatus(stage);
                    const stageNameLower = stage.stage_name.toLowerCase();
                    
                    let defaultLink: string;
                    let defaultDescription: string;

                    // Logic to assign default description and link based on name/status
                    if (stageNameLower.includes('voting')) {
                        defaultLink = '/vote';
                        defaultDescription = 'Cast your vote securely using biometric authentication or OTP verification.';
                    } else if (stageNameLower.includes('registration')) {
                        defaultLink = '/register';
                        defaultDescription = 'Register to vote in the 2025 Election.';
                    } else if (stageNameLower.includes('application')) {
                        defaultLink = '/aspirant';
                        defaultDescription = ' Apply for leadership positions and make a difference in student governance.';
                    }
                    // NEW LOGIC: Manifesto Day
                    else if (stageNameLower.includes('manifesto')) {
                        defaultLink = '#'; 
                        defaultDescription = 'Watch the candidates present their manifestos and answer questions live.';
                    }
                    // NEW LOGIC: Handing Over Day
                    else if (stageNameLower.includes('handing over') || stageNameLower.includes('inauguration')) {
                        defaultLink = '#';
                        defaultDescription = 'The official ceremony where the new executives take their oath of office.';
                    }
                    else if (stageNameLower.includes('results')) {
                        defaultLink = '/results';
                        defaultDescription = 'View real-time election results immediately after the voting phase concludes.';
                    }
                    else if (stageNameLower.includes('screening')) {
                        defaultLink = '/screening-info';
                        defaultDescription = 'Candidates undergo screening and verification by the electoral committee.';
                    } else {
                        defaultLink = '/support';
                        defaultDescription = 'Details for this stage are coming soon.';
                    }
                    
                    if (status === 'completed') {
                        defaultDescription = 'This stage is now complete. Awaiting results or next step.';
                        defaultLink = '/results';
                    }

                    return {
                        ...stage,
                        // Add the calculated fields
                        description: defaultDescription,
                        action_link: defaultLink,
                    };
                });
                
                setStages(processedData);

            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                console.error("Error fetching stages:", errorMessage);
                setError("Failed to load election timeline. Please check network and table structure.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStages();
    }, []);

    // --- RENDER FUNCTIONS (Loading, Error, Empty) ---
    if (isLoading) {
        return (
            <div className="text-center py-20">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading election timeline...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 bg-red-50 border-l-4 border-red-500 p-4 rounded-md mx-auto max-w-lg">
                <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-red-700 font-medium">{error}</p>
            </div>
        );
    }

    if (stages.length === 0) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No election stages are currently defined.</p>
            </div>
        );
    }

    // --- MAIN TIMELINE DISPLAY ---
    return (
        <section className="py-16 bg-background dark:bg-gray-900">
            <style>{`
                .election-gradient {
                    background-image: linear-gradient(135deg, var(--color-primary, #3b82f6), var(--color-blue-700, #1d4ed8));
                }
                .transition-smooth {
                    transition: all 0.3s ease-in-out;
                }
                .active-step {
                    transform: scale(1.03);
                    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.5); /* green-500 shadow ring */
                    border-color: #22c55e; /* green-500 border */
                    animation: pulse-ring 1.5s infinite;
                }
                @keyframes pulse-ring {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.3); }
                    50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                }
            `}</style>
            
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                        NUNSA Election Timeline
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        The NUNSA Electoral Process Schedule for the 2025/2026 Academic Session.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {stages.map((stage, index) => {
                        const status = getStageStatus(stage);
                        const isActive = status === "active";
                        // NEW: Check if stage is ending soon
                        const isEnding = isEndingSoon(stage);
                        
                        // Default styles
                        let statusColor = isActive ? "text-green-600 dark:text-green-400" : (status === "upcoming" ? "text-primary dark:text-primary-400" : "text-gray-500 dark:text-gray-400");
                        let badgeColor = isActive ? "bg-green-600" : (status === "upcoming" ? "bg-primary" : "bg-gray-400");
                        let Icon = isActive ? CheckCircle : Calendar;
                        let cardClass = isActive ? 'bg-green-50 dark:bg-green-900/20 active-step border-green-500' : 'bg-card dark:bg-gray-800 border-border hover:shadow-lg';

                        // OVERWRITE styles if it's ending soon (Danger/Warning)
                        if (isEnding) {
                            statusColor = "text-red-600 dark:text-red-400";
                            badgeColor = "bg-red-600";
                            Icon = AlertTriangle;
                            // Add red styles, use !important classes to override `active-step`
                            cardClass = `${cardClass.replace('active-step', '')} !bg-red-50 dark:!bg-red-900/20 !border-red-500 shadow-lg shadow-red-500/50`;
                        }

                        // Determine button appearance and text
                        const buttonVariant = isActive ? "default" : "outline";
                        const buttonText = isActive ? 'Ongoing Now' : (status === 'upcoming' ? 'View Details' : 'Stage Closed');
                        const buttonClass = isActive ? 'bg-green-600 hover:bg-green-700 text-white' : 'hover:bg-primary/5';

                        return (
                            <div 
                                key={stage.id} 
                                className={`text-center group p-6 rounded-xl border transition-smooth h-full flex flex-col justify-between ${cardClass}`}
                            >
                                <div>
                                    <div className="relative mb-6">
                                        <div className={`w-16 h-16 ${isEnding ? 'bg-red-600' : 'election-gradient'} rounded-full flex items-center justify-center mx-auto shadow-md group-hover:shadow-xl transition-smooth`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        {/* Number Badge - responsive positioning */}
                                        <div className={`absolute -top-2 -right-2 w-8 h-8 ${badgeColor} text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-background dark:ring-gray-900`}>
                                            {index + 1}
                                        </div>
                                    </div>
                                    
                                    <h3 className={`text-xl font-semibold mb-2 ${statusColor}`}>
                                        {stage.stage_name}
                                    </h3>

                                    {/* NEW: Warning Badge for ending stages */}
                                    {isEnding && (
                                        <Badge variant="destructive" className="mx-auto mt-0 mb-2">
                                            <AlertTriangle className="h-3 w-3 mr-1" /> Ends in 24 hours!
                                        </Badge>
                                    )}
                                    
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        {formatDateTime(stage.start_time)} – {formatDateTime(stage.end_time)}
                                    </p>
                                    
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                        {stage.description}
                                    </p>
                                </div>
                                
                                <div className="mt-auto"> {/* Push button to the bottom */}
                                    <Button 
                                        asChild 
                                        variant={buttonVariant} 
                                        size="sm"
                                        disabled={status === "completed"}
                                        className={`w-full ${buttonClass}`}
                                    >
                                        <Link to={stage.action_link}>
                                            {buttonText}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ElectionTimeline;