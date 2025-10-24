import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Shield, Eye, Lock } from "lucide-react";
import ElectionTimeline from "@/components/ElectionTimeline";
import { Contact } from "@/components/Contact";

const Index = () => {
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <Hero />
        

        
        {/* How it Works - Add an ID for the linkToId to scroll to */}
        <section id="how-it-works-section" className="py-20 px-4">
           <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
              How It Works
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our electoral system ensures the highest standards of security, anonymity, and transparency
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 space-y-4 hover:shadow-lg transition-all animate-fade-in">
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Register</h3>
                <p className="text-sm text-muted-foreground">
                  Verify your identity using your matric number and personal email
                </p>
              </Card>
              
              <Card className="p-6 space-y-4 hover:shadow-lg transition-all animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="p-3 bg-secondary/10 rounded-lg w-fit">
                  <Lock className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Authenticate</h3>
                <p className="text-sm text-muted-foreground">
                  Set up biometric authentication or secure email OTP for maximum security
                </p>
              </Card>
              
              <Card className="p-6 space-y-4 hover:shadow-lg transition-all animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="p-3 bg-success/10 rounded-lg w-fit">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Vote</h3>
                <p className="text-sm text-muted-foreground">
                  Cast your vote anonymously during the voting period
                </p>
              </Card>
              
              <Card className="p-6 space-y-4 hover:shadow-lg transition-all animate-fade-in" style={{animationDelay: '0.3s'}}>
                <div className="p-3 bg-accent/10 rounded-lg w-fit">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Track Results</h3>
                <p className="text-sm text-muted-foreground">
                  Watch live results update in real-time on our public dashboard
                </p>
              </Card>
            </div>
          </div>
        </section>
        {/* NEW Electoral Timeline Section */}
         <section className="py-8 px-4 w-full">
           <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 text-primary">
                  Electoral Timeline
              </h2>
                  <ElectionTimeline />
              </div>
          </section>
          <Contact />
       
      </main>
      
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 NUNSA Electoral System. All rights reserved.</p>
          <p className="mt-2">Powered by Lovable Cloud • Built with security and transparency</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
