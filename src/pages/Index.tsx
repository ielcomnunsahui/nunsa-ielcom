import Navbar from "@/components/Navbar";
import Footer from "@/components/footerr";
import Hero from "@/components/Hero";
import { Card } from "@/components/ui/card";
import { UserPlus, CheckCircle2, Shield, Trophy, Eye, Lock } from "lucide-react";
import ElectionTimeline from "@/components/ElectionTimeline";


const Index = () => {
  
  return (
    <div className="min-h-screen bg-background">
      
      <Navbar />
      
      <main className="pt-20">
        <Hero />
        
        {/* NEW Electoral Timeline Section */}
         
                  <ElectionTimeline />

        
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
            

          
                    {/* Quick Navigation (Hidden in print) */}
                    <div className="max-w-5xl mx-auto mt-16 print:hidden">
                      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                          Quick Navigation
                        </h3>
                        <div className="grid md:grid-cols-4 gap-6">
                          <a
                            href="/register"
                            className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                              <UserPlus className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Register
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Register to Vote
                              </p>
                            </div>
                          </a>

                          <a
                            href="/aspirant-login"
                            className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                              <Trophy className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Apply
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Apply for a position
                              </p>
                            </div>
                          </a>
          
                          <a
                            href="/results"
                            className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Live Results
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                View realtime results
                              </p>
                            </div>
                          </a>
          
                          <a
                            href="/support"
                            className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold">?</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Support
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Get help and support
                              </p>
                            </div>
                          </a>
                        </div>
                      </div>
                      </div>
       
      </main>
      
      < Footer />
      </div>
  );
};

export default Index;
