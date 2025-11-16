import { Button } from "@/components/ui/button";
import { Shield, Trophy, Menu, X, Vote, Home, UserPlus, Scale, HelpCircle, LayoutDashboard, LogIn } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import NUNSALogo from "@/assets/Ielcom-logo.png"; 

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = useMemo(() => [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Register', href: '/register', icon: UserPlus },
    { name: 'Vote', href: '/vote', icon: Vote },
    { name: 'Constitution', href: '/rules', icon: Scale },
    { name: 'Support', href: '/support', icon: HelpCircle },
  ], []);

  // --- Path Analysis ---
  const path = location.pathname;
  const isAspirantRoute = path.startsWith("/aspirant");
  const isAdminRoute = path.startsWith("/admin");
  const isVotersRoute = path.startsWith("/voters-login");
  
  // Pages where main links should be hidden (Dashboard/App pages)
  const isDashboardPage = 
    (isAspirantRoute && path !== "/aspirant-login") || 
    (isAdminRoute && path !== "/admin-login");
  
  // Pages where we should offer a 'Home' button instead of login options
  const isInternalPage = isDashboardPage || isVotersRoute;

  const isActive = (href: string) => path === href;
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  
  // --- Dynamic Action Button Logic ---
  const renderActionButtons = (isMobile: boolean) => {
    // If on an internal page, show 'Go to Home'
    if (isInternalPage) {
      return (
        <Link to="/" onClick={() => isMobile && toggleMobileMenu()} className="w-full">
          <Button variant="outline" size={isMobile ? "default" : "sm"} className="gap-2 w-full sm:w-auto hover:bg-gray-100 transition-colors">
            <Home className="w-4 h-4" />
            Go to Home
          </Button>
        </Link>
      );
    }

    // Otherwise, show the main login options (Primary action first)
    return (
      <>
        {/* Aspirant Login/Apply */}
        <Link to="/aspirant-login" onClick={() => isMobile && toggleMobileMenu()} className={isMobile ? "w-full" : ""}>
          <Button 
            variant="default" 
            size={isMobile ? "default" : "sm"} 
            className="gap-2 w-full justify-center bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            Aspirant Login
          </Button>
        </Link>

        {/* Admin Login */}
        <Link to="/admin-login" onClick={() => isMobile && toggleMobileMenu()} className={isMobile ? "w-full" : ""}>
          <Button 
            variant="ghost" 
            size={isMobile ? "default" : "sm"} 
            className="gap-2 w-full justify-center sm:w-auto hover:bg-gray-100 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Admin
          </Button>
        </Link>
      </>
    );
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
            <h1 className="font-bold text-lg sm:text-xl text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
              NUNSA IELCOM
            </h1>
            <p className="text-[10px] text-gray-500  sm:block leading-none">Al-Hikmah University Chapter</p>
          </div>
        </Link>
        
        {/* Desktop Navigation & Actions (Hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-4">
          
          {/* Main Links */}
          <div className="flex gap-1">
            {!isDashboardPage && navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-4">
            {renderActionButtons(false)}
          </div>
        </div>

        {/* Mobile Menu Button (Visible on mobile, hidden on desktop) */}
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
        className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 space-y-2">
          
          {/* Navigation Links */}
          {!isDashboardPage && navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={toggleMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-md font-semibold transition-colors w-full justify-start text-base ${
                  isActive(item.href)
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
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