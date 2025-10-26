import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowLeft, ArrowRight, Upload, Download, MessageCircle, Loader2, CheckCircle2, AlertCircle, Lock, Save, FileText, Printer } from "lucide-react";
import { z } from "zod";
import { User } from "@supabase/supabase-js";

// FIX 1: Removed 'min_level' and 'max_level' from the interface 
// to resolve the type mismatch with the Supabase query's return type.
interface Position {
  id: string;
  name: string;
  application_fee: number;
  min_cgpa: number;
  eligible_levels: string[];
  description: string;
}

interface ApplicationData {
  // Step 1: Personal
  photo: File | null;
  full_name: string;
  matric: string;
  department: string;
  level: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  
  // Step 2: Position
  position_id: string;
  why_running: string;
  
  // Step 3: Academic
  cgpa: string;
  
  // Step 4: Leadership
  leadership_history: string;
  
  // Step 5: Payment
  payment_proof: File | null;
}

const matricSchema = z.string().regex(/^[0-9]{2}\/[0-9]{2}[A-Za-z]{3}[0-9]{3}$/, "Invalid matric format (e.g., 21/08NUS014)");
const phoneSchema = z.string().regex(/^[0-9]{11}$/, "Phone must be 11 digits");
const cgpaSchema = z.number().min(2.0).max(5.0);

const departments = [
  "Nursing", "Anatomy", "Physiology", "Medical Lab Science", "MBBS", "Public Health"
];

const levels = ["100L", "200L", "300L", "400L", "500L"];

const AspirantApplication = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    photo: null,
    full_name: "",
    matric: "",
    department: "",
    level: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    position_id: "",
    why_running: "",
    cgpa: "",
    leadership_history: "",
    payment_proof: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [savedSteps, setSavedSteps] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication check
  const checkAuthentication = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the application form.",
          variant: "destructive",
        });
        navigate("/login", { state: { returnTo: "/aspirant/apply" } });
        return;
      }

      setUser(authUser);
      setIsCheckingAuth(false);
      
      // Load saved progress
      await loadSavedProgress(authUser.id);
    } catch (error) {
      console.error("Error checking authentication:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to verify authentication. Please try logging in again.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Load saved progress from localStorage or database
  const loadSavedProgress = async (userId: string) => {
    try {
      const savedData = localStorage.getItem(`aspirant_draft_${userId}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setApplicationData(prev => ({ ...prev, ...parsedData.data }));
        setCurrentStep(parsedData.currentStep || 1);
        setSavedSteps(new Set(parsedData.savedSteps || []));
        
        toast({
          title: "Progress Restored",
          description: "Your previous application progress has been restored.",
        });
      }
    } catch (error) {
      console.error("Error loading saved progress:", error);
    }
  };

  // Save progress to localStorage
  const saveProgress = async (step: number) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const progressData = {
        data: applicationData,
        currentStep: step,
        savedSteps: Array.from(savedSteps),
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem(`aspirant_draft_${user.id}`, JSON.stringify(progressData));
      setSavedSteps(prev => new Set([...prev, step]));
      
      toast({
        title: "Progress Saved",
        description: `Step ${step} has been saved. You can continue later.`,
      });
    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // FIX 4: Wrapped loadPositions in useCallback to resolve react-hooks/exhaustive-deps warning
  const loadPositions = useCallback(async () => {
    if (!user) return;
    
    try {
      // FIX 1: Explicitly selected fields to match the Position interface 
      // and ensure only active positions are fetched.
      const { data, error } = await supabase
        .from("aspirant_positions")
        .select("id, name, application_fee, min_cgpa, description, eligible_levels") 
        .eq("is_open", true)
        .order("application_fee", { ascending: false });

      if (error) throw error;
      // The data structure now aligns with the Position interface
      setPositions(data as Position[] || []); 
    } catch (error) {
      console.error("Error loading positions:", error);
      toast({
        title: "Error",
        description: "Failed to load positions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]); // Dependency array for useCallback

  // FIX 4: Added loadPositions to the dependency array
  useEffect(() => {
    if (user && !isCheckingAuth) {
      loadPositions();
      
      // Check if position was pre-selected from dashboard
      const preSelectedPosition = location.state?.selectedPosition;
      if (preSelectedPosition) {
        setSelectedPosition(preSelectedPosition);
        setApplicationData(prev => ({ ...prev, position_id: preSelectedPosition.id }));
      }
    }
  }, [location.state, loadPositions, user, isCheckingAuth]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!applicationData.photo) errors.photo = "Photo is required";
        if (!applicationData.full_name.trim()) errors.full_name = "Full name is required";
        try {
          matricSchema.parse(applicationData.matric);
        } catch {
          errors.matric = "Invalid matric format (e.g., 21/08NUS001)";
        }
        if (!applicationData.department) errors.department = "Department is required";
        if (!applicationData.level) errors.level = "Level is required";
        if (!applicationData.dob) errors.dob = "Date of birth is required";
        if (!applicationData.gender) errors.gender = "Gender is required";
        try {
          phoneSchema.parse(applicationData.phone);
        } catch {
          errors.phone = "Phone must be 11 digits";
        }
        if (!applicationData.email.includes("@")) errors.email = "Valid email is required";
        break;
        
      // FIX 2: Wrapped the case block in curly braces to allow lexical declaration (const/let)
      case 2: {
        if (!applicationData.position_id) errors.position_id = "Position is required";
        if (selectedPosition) {
            const applicantLevel = applicationData.level; // Level is collected in Step 1
            const eligibleLevels = selectedPosition.eligible_levels;

            // Check if the applicant's level is NOT included in the eligible list
            if (!eligibleLevels.includes(applicantLevel)) {
                // Use a dedicated error key for eligibility
                errors.position_level_error = `Your level (${applicantLevel}L) is not eligible for the position: ${selectedPosition.name}. Eligible levels: ${eligibleLevels.map(l => `${l}L`).join(', ')}`;
            }
        }
        const wordCount = applicationData.why_running.trim().split(/\s+/).length;
        if (wordCount < 20 || wordCount > 1000) {
          errors.why_running = "Why running must be between 20-1000 words";
        }
      break;
    }
       case 3: {
        try {
          const cgpa = parseFloat(applicationData.cgpa);
          cgpaSchema.parse(cgpa);
          if (selectedPosition && cgpa < selectedPosition.min_cgpa) {
            errors.cgpa = `CGPA must be at least ${selectedPosition.min_cgpa} for this position`;
          }
        } catch {
          errors.cgpa = "CGPA must be between 2.00-5.00";
        }
        break;
      }
         
      // FIX 2: Wrapped the case block in curly braces to allow lexical declaration (const/let)
      case 4: {
        const leadershipWords = applicationData.leadership_history.trim().split(/\s+/).length;
        if (leadershipWords < 20) {
          errors.leadership_history = "Leadership history must be at least 20 words";
        }
        break;
      }
        
      case 5:
        if (!applicationData.payment_proof) errors.payment_proof = "Payment proof is required";
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      // Save current step before moving to next
      await saveProgress(currentStep);
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = (field: keyof ApplicationData, file: File | null) => {
    if (file) {
      // Validate file size and type
      const maxSize = field === 'photo' ? 1 * 1024 * 1024 : 2 * 1024 * 1024; // 1MB for photo, 2MB for others
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `File must be less than ${field === 'photo' ? '1MB' : '2MB'}`,
          variant: "destructive",
        });
        return;
      }
      
      const allowedTypes = field === 'photo' 
        ? ['image/jpeg', 'image/png'] 
        : ['image/jpeg', 'image/png', 'application/pdf'];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: field === 'photo' ? "Only JPG/PNG allowed" : "Only JPG/PNG/PDF allowed",
          variant: "destructive",
        });
        return;
      }
    }
    
    setApplicationData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmitApplication = async () => {
    if (!validateStep(5)) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your application.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload files first
      const uploadedUrls: Record<string, string> = {};
      
      if (applicationData.photo) {
        const photoPath = `photos/${user.id}_${Date.now()}_${applicationData.photo.name}`;
        const { data: photoUpload, error: photoError } = await supabase.storage
          .from('aspirant-documents')
          .upload(photoPath, applicationData.photo);
        
        if (photoError) throw photoError;
        
        const { data: photoUrl } = supabase.storage
          .from('aspirant-documents')
          .getPublicUrl(photoPath);
        
        uploadedUrls.photo_url = photoUrl.publicUrl;
      }
      
      if (applicationData.payment_proof) {
        const paymentPath = `payments/${user.id}_${Date.now()}_${applicationData.payment_proof.name}`;
        const { data: paymentUpload, error: paymentError } = await supabase.storage
          .from('aspirant-documents')
          .upload(paymentPath, applicationData.payment_proof);
        
        if (paymentError) throw paymentError;
        
        const { data: paymentUrl } = supabase.storage
          .from('aspirant-documents')
          .getPublicUrl(paymentPath);
        
        uploadedUrls.payment_proof_url = paymentUrl.publicUrl;
      }
      
      // Create application record
      const { data: aspirant, error } = await supabase
        .from("aspirants")
        .insert({
          user_id: user.id,
          full_name: applicationData.full_name,
          matric: applicationData.matric.toLowerCase(),
          email: applicationData.email,
          phone: applicationData.phone,
          department: applicationData.department,
          level: applicationData.level,
          date_of_birth: applicationData.dob,
          gender: applicationData.gender,
          cgpa: parseFloat(applicationData.cgpa),
          position_id: applicationData.position_id,
          why_running: applicationData.why_running,
          leadership_history: applicationData.leadership_history,
          ...uploadedUrls,
          status: "submitted",
          admin_review_status: "pending",
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Store matric for future dashboard access
      localStorage.setItem("aspirantMatric", applicationData.matric.toLowerCase());
      
      // Clear saved draft
      localStorage.removeItem(`aspirant_draft_${user.id}`);
      
      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully. You can track its progress on your dashboard.",
      });
      
      navigate("/aspirant");
      
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadForm = (formType: 'referee' | 'declaration') => {
    // This would normally download from admin-uploaded forms
    toast({
      title: "Form Download",
      description: `${formType === 'referee' ? 'Referee' : 'Declaration'} form download will be available when admin uploads the template.`,
    });
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/2347040640646", "_blank");
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Personal Information";
      case 2: return "Position & Motivation";
      case 3: return "Academic Information";
      case 4: return "Leadership Experience";
      case 5: return "Payment Proof";
      default: return "";
    }
  };

  const progress = (currentStep / 5) * 100;

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 sm:pt-24 px-2 sm:px-4 pb-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show authentication required message if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 sm:pt-24 px-2 sm:px-4 pb-12">
          <div className="container mx-auto max-w-2xl text-center">
            <Card className="p-6 sm:p-8">
              <div className="mb-6">
                <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-xl sm:text-2xl font-bold mb-2">Authentication Required</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  You need to be logged in to access the aspirant application form.
                </p>
              </div>
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate("/login", { state: { returnTo: "/aspirant/apply" } })}
                  className="w-full bg-gradient-primary"
                >
                  Log In to Continue
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/aspirant")}
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 sm:pt-24 px-2 sm:px-4 pb-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading application form...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 sm:pt-24 px-2 sm:px-4 pb-12">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-gradient-secondary rounded-full shadow-glow mb-4">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-foreground">
              Aspirant Application
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Step {currentStep} of 5: {getStepTitle()}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
              <span>Authenticated as {user.email}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Application Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-4 text-xs">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className={`text-center p-1 sm:p-2 rounded text-xs ${
                  step === currentStep ? 'bg-primary text-primary-foreground' :
                  step < currentStep ? 'bg-success text-success-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <div className="flex items-center justify-center gap-1">
                    Step {step}
                    {savedSteps.has(step) && <Save className="w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Application Form */}
          <Card className="p-4 sm:p-6 lg:p-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Personal Information</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="photo">Profile Photo *</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileUpload('photo', e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {validationErrors.photo && <p className="text-sm text-destructive">{validationErrors.photo}</p>}
                  <p className="text-xs text-muted-foreground">JPG/PNG, max 1MB</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={applicationData.full_name}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                    {validationErrors.full_name && <p className="text-sm text-destructive">{validationErrors.full_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="matric">Matric Number *</Label>
                    <Input
                      id="matric"
                      value={applicationData.matric}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, matric: e.target.value }))}
                      placeholder="21/08NUS001"
                    />
                    {validationErrors.matric && <p className="text-sm text-destructive">{validationErrors.matric}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={applicationData.department} onValueChange={(value) => setApplicationData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.department && <p className="text-sm text-destructive">{validationErrors.department}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Level *</Label>
                    <Select value={applicationData.level} onValueChange={(value) => setApplicationData(prev => ({ ...prev, level: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>{level}L</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.level && <p className="text-sm text-destructive">{validationErrors.level}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={applicationData.dob}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, dob: e.target.value }))}
                    />
                    {validationErrors.dob && <p className="text-sm text-destructive">{validationErrors.dob}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={applicationData.gender} onValueChange={(value) => setApplicationData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.gender && <p className="text-sm text-destructive">{validationErrors.gender}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={applicationData.phone}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="08012345678"
                      maxLength={11}
                    />
                    {validationErrors.phone && <p className="text-sm text-destructive">{validationErrors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={applicationData.email}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                    />
                    {validationErrors.email && <p className="text-sm text-destructive">{validationErrors.email}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Position & Motivation */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Position & Motivation</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="position_id">Select Position *</Label>
                  <Select 
                    value={applicationData.position_id} 
                    onValueChange={(value) => {
                      setApplicationData(prev => ({ ...prev, position_id: value }));
                      const position = positions.find(p => p.id === value);
                      setSelectedPosition(position || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position to apply for" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.name} - ₦{position.application_fee.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* ⬅️ DISPLAY POSITION REQUIRED ERROR */}
                  {validationErrors.position_id && <p className="text-sm text-destructive">{validationErrors.position_id}</p>}
                  
                  {/* ⬅️ DISPLAY NEW LEVEL INELIGIBILITY ERROR */}
                  {validationErrors.position_level_error && (
                    <div className="mt-2 p-3 bg-red-100 border border-destructive rounded-md">
                        <p className="text-sm text-destructive font-medium">
                            {validationErrors.position_level_error}
                        </p>
                        </div>
                  )}
                  {validationErrors.position_id && <p className="text-sm text-destructive">{validationErrors.position_id}</p>}
                </div>

                {selectedPosition && (
                  <Card className="p-4 bg-muted/30">
                    <h3 className="font-semibold mb-2">{selectedPosition.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{selectedPosition.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge variant="outline">
                          Levels: {selectedPosition.eligible_levels.map(l => `${l}L`).join(', ')}
                      </Badge>
                      <Badge variant="outline">Fee: ₦{selectedPosition.application_fee.toLocaleString()}</Badge>
                    </div>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="why_running">Why are you running for this position? *</Label>
                  <Textarea
                    id="why_running"
                    value={applicationData.why_running}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, why_running: e.target.value }))}
                    placeholder="Explain your motivation, vision, and what you hope to achieve in this role..."
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Minimum 20 words, maximum 1000 words</span>
                    <span>{applicationData.why_running.trim().split(/\s+/).length} words</span>
                  </div>
                  {validationErrors.why_running && <p className="text-sm text-destructive">{validationErrors.why_running}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Academic Information */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Academic Information</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="cgpa">Current CGPA *</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    min="2.00"
                    max="5.00"
                    value={applicationData.cgpa}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, cgpa: e.target.value }))}
                    placeholder="4.50"
                  />
                  {validationErrors.cgpa && <p className="text-sm text-destructive">{validationErrors.cgpa}</p>}
                  <p className="text-xs text-muted-foreground">
                    Enter your current CGPA (2.00 - 5.00). Must meet position requirements.
                  </p>
                  
                  {selectedPosition && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        <strong>Position Requirement:</strong> Minimum CGPA of {selectedPosition.min_cgpa} for {selectedPosition.name} 
                        and eligible for levels: {selectedPosition.eligible_levels.map(l => `${l}L`).join(', ')}
                      </p>
                      {applicationData.cgpa && parseFloat(applicationData.cgpa) >= selectedPosition.min_cgpa && (
                        <div className="flex items-center gap-2 mt-2 text-success">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm">CGPA requirement met</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">Academic Requirements:</p>
                      <ul className="text-blue-800 space-y-1">
                        <li>• Your most recent statement of result showing CGPA will be submitted on screening day</li>
                        <li>• Ensure your CGPA meets the minimum requirement for your chosen position</li>
                        <li>• Academic transcripts must be official and recent</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 4: Leadership Experience */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Leadership Experience</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="leadership_history">Leadership History *</Label>
                  <Textarea
                    id="leadership_history"
                    value={applicationData.leadership_history}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, leadership_history: e.target.value }))}
                    placeholder="Describe your leadership experience, positions held, achievements, and how they prepare you for this role..."
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Minimum 20 words required</span>
                    <span>{applicationData.leadership_history.trim().split(/\s+/).length} words</span>
                  </div>
                  {validationErrors.leadership_history && <p className="text-sm text-destructive">{validationErrors.leadership_history}</p>}
                </div>

                <Card className="p-4 bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900 mb-1">Required Documents for Screening Day:</p>
                      <ul className="text-amber-800 space-y-1">
                        <li>• Referee form (completed and signed by academic staff)</li>
                        <li>• Declaration statement (signed and dated)</li>
                        <li>• Statement of result showing most recent CGPA</li>
                        <li>• All documents must be clearly legible and official</li>
                      </ul>
                      <div className="mt-3 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => downloadForm('referee')} className="gap-2">
                            <Download className="w-4 h-4" />
                            Download Referee Form
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => downloadForm('declaration')} className="gap-2">
                            <FileText className="w-4 h-4" />
                            Download Declaration Form
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                            <Printer className="w-4 h-4" />
                            Print Forms
                          </Button>
                          <Button variant="outline" size="sm" onClick={openWhatsApp} className="gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Contact NUNSA Café
                          </Button>
                        </div>
                        <p className="text-xs text-amber-700 mt-2">
                          WhatsApp: 07040640646 for physical forms and assistance
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 5: Payment Proof */}
            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Payment Proof</h2>
                
                {selectedPosition && (
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">Payment Instructions</h3>
                    <div className="text-sm text-green-800 space-y-1">
                      <p><strong>Amount:</strong> ₦{selectedPosition.application_fee.toLocaleString()}</p>
                      <p><strong>Account Number:</strong> 7081795658</p>
                      <p><strong>Bank:</strong> OPAY</p>
                      <p><strong>Account Name:</strong> Awwal Abubakar Sadik</p>
                    </div>
                  </Card>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="payment_proof">Upload Payment Proof *</Label>
                  <Input
                    id="payment_proof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload('payment_proof', e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {validationErrors.payment_proof && <p className="text-sm text-destructive">{validationErrors.payment_proof}</p>}
                  <p className="text-xs text-muted-foreground">
                    Upload screenshot or receipt of payment (Image/PDF, max 2MB)
                  </p>
                </div>

                <Card className="p-4 bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900 mb-1">Payment Guidelines:</p>
                      <ul className="text-amber-800 space-y-1">
                        <li>• Ensure the payment amount matches the application fee exactly</li>
                        <li>• Include your name and matric number in the payment reference if possible</li>
                        <li>• Payment verification may take 24-48 hours</li>
                        <li>• Application fees are non-refundable</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 sm:pt-8 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="gap-2 order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  onClick={() => saveProgress(currentStep)}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Progress
                </Button>

                {currentStep < 5 ? (
                  <Button onClick={handleNext} className="gap-2 bg-gradient-primary">
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting}
                    className="gap-2 bg-gradient-success"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                    
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Back to Dashboard */}
          <div className="text-center mt-6 sm:mt-8">
            <Button variant="ghost" onClick={() => navigate("/aspirant")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AspirantApplication;