import { Button } from "@/components/ui/button";
import { Shield, User, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
// ADDED LOGO IMPORT
import NUNSALogo from "@/assets/Ielcom-logo.png"; 

const Navbar = () => {
  const location = useLocation();
  
  // Check if the current path is any of the login/admin/aspirant dashboard or application pages
  const isProtectedPath = 
    location.pathname === "/login" || 
    location.pathname === "/admin-login" || 
    location.pathname.startsWith("/aspirant"); 
    
  // Check if the current path is the Aspirant Dashboard page
  const isAspirantDashboardPage = location.pathname === "/aspirant";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          {/* REPLACED SHIELD ICON WITH LOGO */}
          <div className="p-1 bg-white rounded-lg shadow-glow flex items-center justify-center">
            <img 
              src={NUNSALogo} 
              alt="Ielcom Logo" 
              className="w-8 h-8 object-contain" 
            />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              NUNSA IELCOM
            </h1>
            <p className="text-xs text-muted-foreground">NUNSA Independent Student Electoral Committee</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Show login/apply buttons only when not on a protected or internal page */}
          {!isProtectedPath && (
            <>
              {/* Apply for Position Button */}
              <Link to="/aspirant">
                <Button variant="outline" size="sm" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Apply for Position
                </Button>
              </Link>
              
              {/* Voter Login Button */}
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Voter Login
                </Button>
              </Link>
              
              {/* Admin Login Button */}
              <Link to="/admin-login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            </>
          )}

          {/* Show a helpful button if the user is on the Aspirant page */}
          {isAspirantDashboardPage && (
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="w-4 h-4" />
                Home
              </Button>
            </Link>
          )}

          {/* Always show the View Results button */}
          <Link to="/results">
            <Button variant="default" size="sm">
              View Results
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;