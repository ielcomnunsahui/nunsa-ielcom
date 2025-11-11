import { Button } from "@/components/ui/button";
import { Shield, User, Trophy, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
// ADDED LOGO IMPORT
import NUNSALogo from "@/assets/Ielcom-logo.png"; 

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if the current path is any of the login/admin/aspirant dashboard or application pages
  const isProtectedPath = 
    location.pathname === "/voters-login" || 
    location.pathname === "/admin-login" || 
    location.pathname === "/aspirant-login" ||
    location.pathname.startsWith("/aspirant"); 
    
  // Check if the current path is the Aspirant Dashboard page
  const isAspirantDashboardPage = location.pathname === "/aspirant";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          {/* REPLACED SHIELD ICON WITH LOGO */}
          <div className="p-1 bg-white rounded-lg shadow-glow flex items-center justify-center">
            <img 
              src={NUNSALogo} 
              alt="Ielcom Logo" 
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain" 
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
              NUNSA IELCOM
            </h1>
            <p className="text-xs text-muted-foreground hidden lg:block">Al-Hikmah University Chapter</p>
          </div>
          <div className="sm:hidden">
            <h1 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              IELCOM
            </h1>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {/* Show login/apply buttons only when not on a protected or internal page */}
          {!isProtectedPath && (
            <>
              {/* Apply for Position Button */}
              <Link to="/aspirant-login">
                <Button variant="outline" size="sm" className="gap-2 text-xs lg:text-sm">
                  <Trophy className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden lg:inline">Aspirant Login</span>
                  <span className="lg:hidden">Aspirant</span>
                </Button>
              </Link>
              
              {/* Voter Login Button */}
              <Link to="/voters-login">
                <Button variant="outline" size="sm" className="gap-2 text-xs lg:text-sm">
                  <User className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden lg:inline">Voter Login</span>
                  <span className="lg:hidden">Vote</span>
                </Button>
              </Link>
              
              {/* Admin Login Button */}
              <Link to="/admin-login">
                <Button variant="ghost" size="sm" className="gap-2 text-xs lg:text-sm">
                  <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                  Admin
                </Button>
              </Link>
            </>
          )}

          {/* Show a helpful button if the user is on the Aspirant page */}
          {isAspirantDashboardPage && (
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2 text-xs lg:text-sm">
                <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                Home
              </Button>
            </Link>
          )}

          {/* Always show the View Results button */}
          <Link to="/Rules">
            <Button variant="default" size="sm" className="text-xs lg:text-sm">
              <span className="hidden lg:inline">View Electoral Rules</span>
              <span className="lg:hidden">Electoral Rules</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Show login/apply buttons only when not on a protected or internal page */}
            {!isProtectedPath && (
              <>
                {/* Aspirant Login Button */}
                <Link to="/aspirant-login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                    <Trophy className="w-4 h-4" />
                    Aspirant Login
                  </Button>
                </Link>
                
                {/* Voter Login Button */}
                <Link to="/voters-login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                    <User className="w-4 h-4" />
                    Voter Login
                  </Button>
                </Link>
                
                {/* Admin Login Button */}
                <Link to="/admin-login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full gap-2 justify-start">
                    <Shield className="w-4 h-4" />
                    Admin Login
                  </Button>
                </Link>
              </>
            )}

            {/* Show a helpful button if the user is on the Aspirant page */}
            {isAspirantDashboardPage && (
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                  <Shield className="w-4 h-4" />
                  Home
                </Button>
              </Link>
            )}

            {/* Always show the View Results button */}
            <Link to="/Rules" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="default" size="sm" className="w-full justify-start">
                Electoral Rules
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;