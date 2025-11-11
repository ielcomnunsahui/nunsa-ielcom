import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Vote, ChartBar, Lock, Trophy, User, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-bg.jpg";
import NUNSALogo from "@/assets/Ielcom-logo.png";
import { CurrentStageCountdown } from "@/components/CurrentStageCountdown"; 


const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-2 sm:px-4 py-12 sm:py-20 overflow-hidden">
      {/* Background image - using placeholder URL for sandbox compilation */}
      <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${heroBackground})` }}></div>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in">
          {/* Logo/Badge - using placeholder URL for sandbox compilation */}
          <div className="inline-flex items-center justify-center p-3 sm:p-4 w-20 h-28 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
            {/* Using img tag with object-contain to ensure the logo scales correctly within the circular frame */}
            <img 
              src={NUNSALogo}
              alt="NUNSA Logo Placeholder" 
              className="w-auto h-16 sm:h-20 lg:h-30 object-contain rounded-full" 
            />
          </div>
          
          {/* Main heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight px-2">
           NUNSA HUI ELECTORAL SYSTEM
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-2">
            Zero-Trust, Biometric-Secured Voting Platform
          </p>

        {/* Countdown Section */}
        <section className="py-8 sm:py-12 lg:py-16 px-2 sm:px-4 bg-muted/30">
          <div className="container mx-auto">
            
            <CurrentStageCountdown />
          </div>
        </section>
          
         
          {/* Call to Action Section */}
        <section>
          <div className="container mx-auto max-w-4xl text-center px-2 sm:px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Get Involved in NUNSA Elections
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Whether you want to vote for your preferred candidates or run for a leadership position, 
              we've made it secure and accessible for everyone.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mx-auto">
              <Card className="p-4 sm:p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-primary/10 rounded-full">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Vote for Leaders</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      Cast your vote securely using biometric authentication or OTP verification
                    </p>
                  </div>
                  <Link to="/register" className="w-full">
                    <Button className="w-full bg-gradient-primary hover:shadow-glow text-sm sm:text-base">
                      Register to Vote
                    </Button>
                  </Link>
                </div>
              </Card>
              
              <Card className="p-4 sm:p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-secondary/10 rounded-full">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Run for Office</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      Apply for leadership positions and make a difference in student governance
                    </p>
                  </div>
                  <Link to="/aspirant" className="w-full">
                    <Button className="w-full bg-gradient-secondary hover:shadow-glow text-sm sm:text-base" variant="secondary">
                      Apply for Position
                    </Button>
                  </Link>
                </div>
              </Card>
              <Card className="p-4 sm:p-6 hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1">
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-secondary/10 rounded-full">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Live Results</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      View real-time election results
                    </p>
                  </div>
                  <Link to= "/results" className="w-full">
                    <Button size="lg" variant="outline" className="text-sm sm:text-lg px-6 sm:px-8 w-full">
                       View Live Results
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>
          
          {/* Trust badge */}
          <div className="mt-8 sm:mt-12 flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground px-2">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
            <span className="text-center">Powered by advanced security protocols</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;