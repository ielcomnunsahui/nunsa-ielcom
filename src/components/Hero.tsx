import { useEffect, useState } from "react"; 
import { supabase } from "@/integrations/supabase/client"; 
import { Button } from "@/components/ui/button";
import { Shield, Vote, Lock, Trophy, TrendingUp, Users, CheckCircle, UserPlus, FileText, Loader2 } from "lucide-react"; 
import { Link } from "react-router-dom";
import heroBackground from "@/assets/herobg.jpg"; 
import { CurrentStageCountdown } from "@/components/CurrentStageCountdown"; 
import { Badge } from "./ui/badge";

// --- 1. Type Definition ---
interface Stage {
    id: string;
    stage_name: string;
    start_time: string;
    end_time: string;
    created_at: string;
    is_active: boolean; // Retained, but logic relies on time
}

// --- 3. Main Component (Restructured and Enhanced) ---
const Hero = () => {
    // State to hold ALL currently active stages
    const [activeStages, setActiveStages] = useState<Stage[]>([]); 
    const [isLoadingStage, setIsLoadingStage] = useState(true);

    // Fetch All Stages and Filter by Current Time
    useEffect(() => {
        const fetchAndFilterActiveStages = async () => {
            setIsLoadingStage(true);
            const now = new Date(); // Get current time once for consistent comparison

            try {
                // Fetch ALL stages, ordered by start time
                const { data: allStages, error } = await supabase
                    .from("election_timeline")
                    .select("*")
                    .order("start_time", { ascending: true }); 

                if (error) throw error;
                
                // Filter stages that are currently active based on start_time and end_time
                const currentlyActiveStages = (allStages as Stage[]).filter(stage => {
                    const startTime = new Date(stage.start_time);
                    const endTime = new Date(stage.end_time);

                    // Check if the current time is between start and end time (current time is before end time)
                    return now >= startTime && now < endTime; 
                });

                setActiveStages(currentlyActiveStages);

            } catch (err) {
                console.error("Unexpected error fetching election stages:", err);
                setActiveStages([]); 
            } finally {
                setIsLoadingStage(false);
            }
        };

        fetchAndFilterActiveStages();
    }, []); 

    // Dynamic CTA Rendering Logic
    const renderCTAs = () => {
        if (isLoadingStage) {
            return (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
            );
        }

        // Use a map to store unique CTA elements, keyed by their type to prevent duplicates
        const uniqueCTAs: { [key: string]: React.ReactElement } = {};

        activeStages.forEach(stage => {
            const stageName = stage.stage_name.toLowerCase();
            
            let ctaKey = ''; 
            let ctaElement: React.ReactElement | null = null;
            
            switch (stageName) {
                case 'registration period':
                    ctaKey = 'register';
                    ctaElement = (
                        <Button 
                            key={ctaKey}
                            asChild 
                            size="lg" 
                            className="bg-green-500 hover:bg-green-600 text-white shadow-lg text-base h-12 w-full sm:w-64 transition-transform transform hover:scale-[1.03]"
                        >
                            <Link to="/register">
                                <UserPlus className="w-5 h-5 mr-2" /> Register to Participate
                            </Link>
                        </Button>
                    );
                    break;

                case 'application period':
                    ctaKey = 'apply';
                    ctaElement = (
                        <Button 
                            key={ctaKey}
                            asChild 
                            size="lg" 
                            className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg text-base h-12 w-full sm:w-64 transition-transform transform hover:scale-[1.03]"
                        >
                            <Link to="/aspirant">
                                <Trophy className="w-5 h-5 mr-2" /> Apply for Leadership Position
                            </Link>
                        </Button>
                    );
                    break;

                case 'voting period':
                    ctaKey = 'vote';
                    ctaElement = (
                        <Button 
                            key={ctaKey}
                            asChild 
                            size="lg" 
                            className="bg-red-500 hover:bg-red-600 text-white shadow-lg text-base h-12 w-full sm:w-64 transition-transform transform hover:scale-[1.03]"
                        >
                            <Link to="/vote">
                                <Vote className="w-5 h-5 mr-2" /> Cast Your Vote Now
                            </Link>
                        </Button>
                    );
                    break;

                case 'results publication':
                    ctaKey = 'results';
                    ctaElement = (
                        <Button 
                            key={ctaKey}
                            asChild 
                            size="lg" 
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg text-base h-12 w-full sm:w-64 transition-transform transform hover:scale-[1.03]"
                        >
                            <Link to="/results">
                                <TrendingUp className="w-5 h-5 mr-2" /> View Election Results
                            </Link>
                        </Button>
                    );
                    break;
                
                case 'manifesto':
                case 'handing over':
                default:
                    // Only add the timeline CTA if no other primary action is present for this stage
                    if (!uniqueCTAs['timeline']) {
                         ctaKey = 'timeline';
                         ctaElement = (
                            <Button 
                                key={ctaKey}
                                asChild 
                                size="lg" 
                                className="bg-white/30 hover:bg-white/40 text-white border border-white/50 shadow-lg text-base h-12 w-full sm:w-64 transition-transform transform hover:scale-[1.03]"
                            >
                                <Link to="/rules">
                                    <FileText className="w-5 h-5 mr-2" />
                                     View Electoral Rules
                                </Link>
                            </Button>
                        );
                    }
                    break;
            }

            if (ctaElement) {
                uniqueCTAs[ctaKey] = ctaElement;
            }
        });

        // Always include 'View Candidates' as a general secondary option
        uniqueCTAs['candidates'] = (
            <Button 
                key="candidates"
                asChild 
                size="lg" 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border border-white/50 shadow-lg text-base h-12 w-full sm:w-56 transition-transform transform hover:scale-[1.03]"
            >
                <Link to="/candidates">
                    <Users className="w-5 h-5 mr-2" /> View Candidates
                </Link>
            </Button>
        );

        // Convert the map values to an array for rendering
        const ctasToRender = Object.values(uniqueCTAs);

        // Fallback if no stage is currently active
        if (ctasToRender.length === 1 && Object.keys(uniqueCTAs)[0] === 'candidates') {
             // If only "View Candidates" is present, also add "View Full Timeline" as a fallback primary action.
             const timelineCta = (
                 <Button 
                        asChild 
                        size="lg" 
                        className="bg-white/30 hover:bg-white/40 text-white border border-white/50 shadow-lg text-base h-12 w-full sm:w-64 transition-transform transform hover:scale-[1.03]"
                    >
                        <Link to="/rules">
                            <FileText className="w-5 h-5 mr-2" /> View Electoral Rules
                        </Link>
                    </Button>
             );
             ctasToRender.unshift(timelineCta); // Add to the front
        } else if (ctasToRender.length === 0) {
             // If literally no stages are fetched or active, only show the timeline and candidates CTA
             return (
                 <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 pb-8">
                    <Button 
                        asChild 
                        size="lg" 
                        className="bg-white/30 hover:bg-white/40 text-white border border-white/50 shadow-lg text-base h-12 w-full sm:w-64 transition-transform transform hover:scale-[1.03]"
                    >
                        <Link to="/rules">
                            <FileText className="w-5 h-5 mr-2" /> View Electoral Rules
                        </Link>
                    </Button>
                    {uniqueCTAs['candidates']}
                 </div>
             );
        }

        // Render all unique, active CTAs
        return (
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 pb-8">
                {ctasToRender}
            </div>
        );
    };

    return (
        <section className="relative min-h-screen sm:min-h-[85vh] flex items-center justify-center px-4 py-16 sm:py-20 overflow-hidden">
            
            {/* Background Image and Overlay for better readability */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBackground})` }}></div>
            <div className="absolute inset-0 bg-gray-900 opacity-85"></div>
            
            <div className="relative container mx-auto py-8 md:py-12 lg:py-16">
                <div className="max-w-5xl mx-auto text-center text-white space-y-6 sm:space-y-8 animate-fade-in">
                    
                    {/* Main Headings - Optimized for all screens */}
                    <h1 className="text-6xl leading-snug sm:text-6xl md:text-6xl font-extrabold drop-shadow-lg mb-2">
                                  WELCOME TO NUNSA
                                </h1>
                              
                                <p className="md:text-base opacity-80 max-w-3xl mx-auto text-lg  leading-relaxed mt-4">
                                   Your platform to cast votes, track real-time results, and manage the entire electoral timeline. Get involved and shape the future of NUNSA.
                                </p>

                    {/* Responsive Call-to-Action Block - DYNAMICALLY RENDERED */}
                    {renderCTAs()} 

                    {/* Countdown Section - Full Width & Centered */}
                    <div className="flex justify-center w-full pb-10">
                        <div className="w-full">
                            <CurrentStageCountdown />
                        </div>
                    </div>
                    
                    
                    {/* Footer/Designer Credit */}
                    <div className="pt-10 flex items-center justify-center gap-2 text-xs sm:text-sm text-white/70 px-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                        <span className="text-center">Designed by SAPHIX</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;