import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Vote, ChartBar, Lock, Trophy, User, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-bg.jpg";
import NUNSALogo from "@/assets/Ielcom-logo.png";
import { CurrentStageCountdown } from "@/components/CurrentStageCountdown"; 


const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background image - using placeholder URL for sandbox compilation */}
      <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${heroBackground})` }}></div>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo/Badge - using placeholder URL for sandbox compilation */}
          <div className="inline-flex items-center justify-center p-4 w-28 h-28 bg-gradient-primary rounded-full shadow-glow mb-4 animate-scale-in">
            {/* Using img tag with object-contain to ensure the logo scales correctly within the circular frame */}
            <img 
              src={NUNSALogo}
              alt="NUNSA Logo Placeholder" 
              className="w-auto h-30 object-contain rounded-full" 
            />
          </div>
          
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
           NUNSA HUI ELECTORAL SYSTEM
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Zero-Trust, Biometric-Secured Voting Platform
          </p>

        {/* Countdown Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            
            <CurrentStageCountdown />
          </div>
        </section>
          
         
          {/* Call to Action Section */}
        <section>
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Get Involved in NUNSA Elections
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you want to vote for your preferred candidates or run for a leadership position, 
              we've made it secure and accessible for everyone.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-3 mx-auto">
              <Card className="p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Vote for Leaders</h3>
                    <p className="text-muted-foreground mb-4">
                      Cast your vote securely using biometric authentication or OTP verification
                    </p>
                  </div>
                  <Link to="/register" className="w-full">
                    <Button className="w-full bg-gradient-primary hover:shadow-glow">
                      Register to Vote
                    </Button>
                  </Link>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-secondary/10 rounded-full">
                    <Trophy className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Run for Office</h3>
                    <p className="text-muted-foreground mb-4">
                      Apply for leadership positions and make a difference in student governance
                    </p>
                  </div>
                  <Link to="/aspirant" className="w-full">
                    <Button className="w-full bg-gradient-secondary hover:shadow-glow" variant="secondary">
                      Apply for Position
                    </Button>
                  </Link>
                </div>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-secondary/10 rounded-full">
                    <TrendingUp className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Live Results</h3>
                    <p className="text-muted-foreground mb-4">
                      View real-time election results
                    </p>
                  </div>
                  <Link to= "/results" className="w-full">
                    <Button size="lg" variant="outline" className="text-lg px-8">
                       View Live Results
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>
          
          {/* Trust badge */}
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-success" />
            <span>Powered by advanced security protocols</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
