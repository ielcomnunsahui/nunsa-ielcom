import { Button } from "@/components/ui/button";
import { Shield, Trophy, Menu, X, Vote, Home, UserPlus, Scale, HelpCircle, Users, LogIn, TrendingUp, Award, LogOut, LayoutDashboard } from "lucide-react"; 
import { Link, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import NUNSALogo from "@/assets/Ielcom-logo.png"; 
import { useActiveStage } from "@/hooks/use-active-stage"; 
import { supabase } from "@/integrations/supabase/client";


const Navbar = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { activeStageCta, isLoading: isStageLoading } = useActiveStage(); 

    // --- LOGOUT HANDLER ---
    const handleLogout = async () => {
        // Clear user session
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout Error:", error);
        }
        // Redirect to home page and force a full state reset
        window.location.href = "/"; 
        // Close mobile menu if open
        setIsMobileMenuOpen(false); 
    };

    // --- REVISED NAVIGATION ARRAY ---
    const navigation = useMemo(() => {
        const links = [
            { name: 'Home', href: '/', icon: Home },
            { name: 'Candidates', href: '/candidates', icon: Users },
            { name: 'Register', href: '/register', icon: UserPlus },
            { name: 'Constitution', href: '/rules', icon: Scale },
        ];
        
        // CONDITIONALLY ADD RESULTS LINK
        const shouldShowResultsLink = activeStageCta?.href === "/results";

        if (shouldShowResultsLink) {
            links.splice(2, 0, { 
                name: 'Live Results', 
                href: '/results', 
                icon: TrendingUp 
            });
        }
        
        return links;
    }, [activeStageCta]);

    // --- Path Analysis ---
    const path = location.pathname;
    // These remain to correctly hide the main navigation links
    const isAspirantRoute = path.startsWith("/aspirant") && path !== "/aspirant-login";
    const isAdminRoute = path.startsWith("/admin") && path !== "/admin-login";
    const isVotersRoute = path.startsWith("/voters-login"); 
    
    // Check if the user is in *any* logged-in internal area
    const isInternalPage = isAspirantRoute || isAdminRoute || isVotersRoute;

    const isActive = (href: string) => path === href;
    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    
    // --- Helper for Standard Login Buttons (when logged out) ---
    const renderLoginButtons = (isMobile: boolean, isCtaActive: boolean) => (
        <>
            {/* Aspirant Login */}
            <Link to="/aspirant-login" onClick={() => isMobile && toggleMobileMenu()} className={isMobile ? "w-full" : ""}>
                <Button 
                    variant={isCtaActive ? "outline" : "default"} 
                    size={isMobile ? "default" : "sm"} 
                    className={`gap-2 w-full justify-center sm:w-auto transition-colors font-semibold ${
                        !isCtaActive ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-100"
                    }`}
                >
                    <Trophy className="w-4 h-4" />
                    Aspirant
                </Button>
            </Link>

            {/* Admin Login */}
            <Link to="/admin-login" onClick={() => isMobile && toggleMobileMenu()} className={isMobile ? "w-full" : ""}>
                <Button 
                    variant="ghost" 
                    size={isMobile ? "default" : "sm"} 
                    className="gap-2 w-full justify-center sm:w-auto hover:bg-gray-100 transition-colors font-semibold"
                >
                    <Shield className="w-4 h-4" />
                    Admin
                </Button>
            </Link>
        </>
    );

    // --- Dynamic Action Button Logic ---
    const renderActionButtons = (isMobile: boolean) => {
        
        // 1. LOGGED-IN STATE: Show Home and Logout buttons ONLY
        if (isInternalPage) {
            
            return (
                <div className={`flex gap-2 ${isMobile ? "w-full flex-col" : ""}`}>
                    
                    {/* Go to Home Link (Primary action when logged in) */}
                    <Link to="/" onClick={() => isMobile && toggleMobileMenu()} className={isMobile ? "w-full" : ""}>
                        <Button 
                            variant="default" // Primary button for navigating back to main site
                            size={isMobile ? "default" : "sm"} 
                            className="gap-2 w-full justify-center sm:w-auto bg-blue-600 hover:bg-blue-700 transition-colors font-semibold"
                        >
                            <Home className="w-4 h-4" />
                            Go to Home
                        </Button>
                    </Link>
                   
                    {/* Logout Button (Prominent exit action) */}
                    <Button 
                        variant="destructive" 
                        size={isMobile ? "default" : "sm"} 
                        onClick={handleLogout} 
                        className={`gap-2 w-full sm:w-auto hover:bg-red-700 transition-colors font-semibold`}
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>
            );
        }

        // 2. LOGGED-OUT STATE: Promote Active Stage Action (Apply/Vote)
        const hasActiveCta = activeStageCta && !isStageLoading;
        if (hasActiveCta) {
            const isResultsCta = activeStageCta.href === "/results";
            
            // Only promote the CTA in the action slot if it's NOT the results link
            if (!isResultsCta) {
                const CtaIcon = activeStageCta.icon;
                
                return (
                    <div className={`flex gap-2 ${isMobile ? "w-full flex-col" : ""}`}>
                        {/* Primary CTA: Active Stage Action (e.g., Apply Now, Vote Now) */}
                        <Link 
                            to="/login" 
                            state={{ returnTo: activeStageCta.href }} 
                            onClick={() => isMobile && toggleMobileMenu()} 
                            className={isMobile ? "w-full order-1" : "order-1"}
                        >
                            <Button 
                                variant="default" 
                                size={isMobile ? "lg" : "sm"} 
                                className={`gap-2 w-full justify-center text-base h-10 sm:h-9 font-bold
                                    bg-green-600 hover:bg-green-700 transition-colors 
                                    shadow-lg shadow-green-500/50 hover:shadow-green-500/70`}
                            >
                                <CtaIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                                {activeStageCta.text}
                            </Button>
                        </Link>

                        {/* Secondary & Tertiary Logins */}
                        <div className={`flex gap-2 ${isMobile ? "w-full flex-col order-2" : "order-2"}`}>
                            {renderLoginButtons(isMobile, true)}
                        </div>
                    </div>
                );
            }
        }
        
        // 3. FALLBACK: Show standard Aspirant/Admin logins
        const isCtaActive = activeStageCta !== null;
        return renderLoginButtons(isMobile, isCtaActive);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between h-16">
                
                {/* Logo and Title */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <img 
                            src={NUNSALogo}
                            alt="NUNSA IELCOM Logo" 
                            className="w-full h-full object-contain rounded-full shadow-inner" 
                        />
                    </div>
                    <div>
                        <h1 className="font-extrabold text-lg sm:text-xl text-gray-800 group-hover:text-primary transition-colors leading-tight">
                            NUNSA IELCOM
                        </h1>
                        <p className="text-[10px] text-gray-500 sm:block leading-none">Al-Hikmah University Chapter</p>
                    </div>
                </Link>
                
                {/* Desktop Navigation & Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    
                    {/* Main Links */}
                    <div className="flex gap-1">
                        {!isInternalPage && navigation.map((item) => { // Hidden when logged in
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        isActive(item.href)
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                        {renderActionButtons(false)}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMobileMenu}
                        className="p-2 transition-transform duration-200"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
                    </Button>
                </div>
            </div>

            {/* --- Mobile Dropdown Menu --- */}
            <div 
                className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 transition-all duration-300 ${
                    isMobileMenuOpen ? 'max-h-[80vh] opacity-100 py-4 overflow-y-auto' : 'max-h-0 opacity-0 py-0'
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6 space-y-2">
                    
                    {/* Navigation Links */}
                    {!isInternalPage && navigation.map((item) => { // Hidden when logged in
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={toggleMobileMenu}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full justify-start text-base ${
                                    isActive(item.href)
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                    
                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 mt-4 space-y-3 flex flex-col items-center">
                        {renderActionButtons(true)}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;