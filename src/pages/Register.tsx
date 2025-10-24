import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { BiometricSetup } from "@/components/BiometricSetup";

const registrationSchema = z.object({
  matric: z.string()
    .trim()
    .toLowerCase()
    .regex(/^\d{2}\/\d{2}[a-z]{3}\d{3}$/, "Invalid matric format (e.g., 21/08nus014)"),
  email: z.string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .max(255, "Email too long"),
});

const Register = () => {
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"register" | "verify" | "biometric">("register");
  const [voterId, setVoterId] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate inputs
      const validated = registrationSchema.parse({ matric, email });
      setIsLoading(true);

      // Check if matric exists in student roster (case-insensitive)
      const { data: rosterData, error: rosterError } = await supabase
        .from("student_roster")
        .select("*")
        .ilike("matric", validated.matric)
        .maybeSingle();

      if (rosterError) throw rosterError;

      if (!rosterData) {
        toast({
          title: "Registration Failed",
          description: "Matric number not found in student roster. Please contact the electoral commission.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if already registered
      const { data: existingVoter, error: voterCheckError } = await supabase
        .from("voters")
        .select("*")
        .eq("matric", validated.matric)
        .maybeSingle();

      if (voterCheckError) throw voterCheckError;

      if (existingVoter) {
        toast({
          title: "Already Registered",
          description: "You are already registered. Please login instead.",
          variant: "destructive",
        });
        setIsLoading(false);
        navigate("/login");
        return;
      }

      // Register voter via backend function to bypass RLS and return voterId
      const { data: regData, error: regError } = await supabase.functions.invoke("register-voter", {
        body: {
          matric: validated.matric,
          name: rosterData.name,
          email: validated.email,
        },
      });

      if (regError || !regData?.voterId) throw regError || new Error("Registration failed");

      toast({
        title: "Registration Successful!",
        description: "Please set up your authentication method.",
      });

      setVoterId(regData.voterId);
      setStep("biometric");

    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error("Registration error:", error);
        toast({
          title: "Registration Failed",
          description: "An error occurred during registration. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-12">
        <div className="container mx-auto max-w-md">
          <Card className="p-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-primary rounded-full shadow-glow mb-4">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">
                Voter Registration
              </h1>
              <p className="text-muted-foreground">
                Register to participate in NUNSA elections
              </p>
            </div>

            {step === "register" ? (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="matric">Matric Number</Label>
                  <Input
                    id="matric"
                    type="text"
                    placeholder="21/08nus014"
                    value={matric}
                    onChange={(e) => setMatric(e.target.value)}
                    required
                    maxLength={50}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: 21/08nus014
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Personal Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={255}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use a personal email (Gmail, Yahoo, etc.)
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:shadow-glow text-lg py-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register to Vote"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => navigate("/login")}
                  >
                    Login here
                  </Button>
                </div>
              </form>
            ) : step === "biometric" ? (
              <BiometricSetup
                voterId={voterId}
                email={email}
                onComplete={() => {
                  setStep("verify");
                  setTimeout(() => navigate("/login"), 2000);
                }}
              />
            ) : (
              <div className="text-center space-y-6 py-8">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    Verification Complete!
                  </h3>
                  <p className="text-muted-foreground">
                    Redirecting you to login...
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-foreground">Security Notice</h4>
              <p className="text-xs text-muted-foreground">
                Your matric number will be verified against our Student Class List. 
                Only eligible students can register to vote.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Register;
