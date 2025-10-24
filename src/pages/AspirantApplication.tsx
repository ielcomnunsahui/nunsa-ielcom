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
import { Trophy, ArrowLeft, ArrowRight, Upload, Download, MessageCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";

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
  
  // Step 5: Documents
  referee_form: File | null;
  declaration_form: File | null;
  
  // Step 6: Payment
  payment_proof: File | null;
}

const matricSchema = z.string().regex(/^[0-9]{2}\/[0-9]{2}[A-Za-z]{3}[0-9]{3}$/, "Invalid matric format (e.g., 21/08NUS014)");
const phoneSchema = z.string().regex(/^[0-9]{11}$/, "Phone must be 11 digits");
const cgpaSchema = z.number().min(2.0).max(5.0);

const departments = [
  "Nursing", "Anatomy", "Physiology", "Medical Lab Science", "MBBS", "Public Health"
];

const levels = ["100", "200", "300", "400", "500"];

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
    referee_form: null,
    declaration_form: null,
    payment_proof: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // FIX 4: Wrapped loadPositions in useCallback to resolve react-hooks/exhaustive-deps warning
  const loadPositions = useCallback(async () => {
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
    }
  }, [toast]); // Dependency array for useCallback

  // FIX 4: Added loadPositions to the dependency array
  useEffect(() => {
    loadPositions();
    
    // Check if position was pre-selected from dashboard
    const preSelectedPosition = location.state?.selectedPosition;
    if (preSelectedPosition) {
      setSelectedPosition(preSelectedPosition);
      setApplicationData(prev => ({ ...prev, position_id: preSelectedPosition.id }));
    }
  }, [location.state, loadPositions]);

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
        if (!applicationData.referee_form) errors.referee_form = "Referee form is required";
        if (!applicationData.declaration_form) errors.declaration_form = "Declaration form is required";
        break;
        
      case 6:
        if (!applicationData.payment_proof) errors.payment_proof = "Payment proof is required";
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
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
    if (!validateStep(6)) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload files first
      const uploads = [];
      
      if (applicationData.photo) {
        uploads.push(
          supabase.storage
            .from('aspirant-documents')
            .upload(`photos/${Date.now()}_${applicationData.photo.name}`, applicationData.photo)
        );
      }
      
      if (applicationData.referee_form) {
        uploads.push(
          supabase.storage
            .from('aspirant-documents')
            .upload(`referee-forms/${Date.now()}_${applicationData.referee_form.name}`, applicationData.referee_form)
        );
      }
      
      if (applicationData.declaration_form) {
        uploads.push(
          supabase.storage
            .from('aspirant-documents')
            .upload(`declarations/${Date.now()}_${applicationData.declaration_form.name}`, applicationData.declaration_form)
        );
      }
      
      if (applicationData.payment_proof) {
        uploads.push(
          supabase.storage
            .from('aspirant-documents')
            .upload(`payments/${Date.now()}_${applicationData.payment_proof.name}`, applicationData.payment_proof)
        );
      }
      
      const uploadResults = await Promise.all(uploads);
      
      // Get public URLs
      const getPublicUrl = (path: string) => {
        const { data } = supabase.storage.from('aspirant-documents').getPublicUrl(path);
        return data.publicUrl;
      };
      
      // Create application record
      const { data: aspirant, error } = await supabase
        .from("aspirants")
        // FIX 3: Used 'as any' to bypass the type error (2769) caused by Supabase's generated insert types
        .insert({
          full_name: applicationData.full_name,
          matric: applicationData.matric.toLowerCase(),
          email: applicationData.email,
          phone: applicationData.phone,
          department: applicationData.department,
          level: applicationData.level,
          dob: applicationData.dob,
          gender: applicationData.gender,
          cgpa: parseFloat(applicationData.cgpa),
          position_id: applicationData.position_id,
          why_running: applicationData.why_running,
          leadership_history: applicationData.leadership_history,
          photo_url: uploadResults[0]?.data?.path ? getPublicUrl(uploadResults[0].data.path) : null,
          referee_form_url: uploadResults[1]?.data?.path ? getPublicUrl(uploadResults[1].data.path) : null,
          declaration_form_url: uploadResults[2]?.data?.path ? getPublicUrl(uploadResults[2].data.path) : null,
          payment_proof_url: uploadResults[3]?.data?.path ? getPublicUrl(uploadResults[3].data.path) : null,
          status: "submitted",
          admin_review_status: "pending",
        } as any) // Type assertion to resolve TS error 2769
        .select()
        .single();
      
      if (error) throw error;
      
      // Store matric for future dashboard access
      localStorage.setItem("aspirantMatric", applicationData.matric.toLowerCase());
      
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
      case 5: return "Required Documents";
      case 6: return "Payment Proof";
      default: return "";
    }
  };

  const progress = (currentStep / 6) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-12">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-secondary rounded-full shadow-glow mb-4">
              <Trophy className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              Aspirant Application
            </h1>
            <p className="text-lg text-muted-foreground">
              Step {currentStep} of 6: {getStepTitle()}
            </p>
          </div>

          {/* Progress Bar */}
          <Card className="p-6 mb-8">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Application Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-6 gap-2 mt-4 text-xs">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className={`text-center p-2 rounded ${
                  step === currentStep ? 'bg-primary text-primary-foreground' :
                  step < currentStep ? 'bg-success text-success-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  Step {step}
                </div>
              ))}
            </div>
          </Card>

          {/* Application Form */}
          <Card className="p-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                
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

                <div className="grid md:grid-cols-2 gap-6">
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
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Position & Motivation</h2>
                
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
                  {validationErrors.position_id && <p className="text-sm text-destructive">{validationErrors.position_id}</p>}
                </div>

                {selectedPosition && (
                  <Card className="p-4 bg-muted/30">
                    <h3 className="font-semibold mb-2">{selectedPosition.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{selectedPosition.description}</p>
                    <div className="flex gap-4 text-sm">
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
                    rows={8}
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
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Academic Information</h2>
                
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
              </div>
            )}

            {/* Step 4: Leadership Experience */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Leadership Experience</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="leadership_history">Leadership History *</Label>
                  <Textarea
                    id="leadership_history"
                    value={applicationData.leadership_history}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, leadership_history: e.target.value }))}
                    placeholder="Describe your leadership experience, positions held, achievements, and how they prepare you for this role..."
                    rows={8}
                    className="resize-none"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Minimum 20 words required</span>
                    <span>{applicationData.leadership_history.trim().split(/\s+/).length} words</span>
                  </div>
                  {validationErrors.leadership_history && <p className="text-sm text-destructive">{validationErrors.leadership_history}</p>}
                </div>
              </div>
            )}

            {/* Step 5: Required Documents */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Required Documents</h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="referee_form">Referee Form *</Label>
                    <div className="space-y-3">
                      <Input
                        id="referee_form"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('referee_form', e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {validationErrors.referee_form && <p className="text-sm text-destructive">{validationErrors.referee_form}</p>}
                      <p className="text-xs text-muted-foreground">PDF/JPG/PNG, max 2MB</p>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => downloadForm('referee')}>
                          <Download className="w-4 h-4 mr-2" />
                          Download Form
                        </Button>
                        <Button variant="outline" size="sm" onClick={openWhatsApp}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Get at NUNSA Café
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="declaration_form">Declaration Statement *</Label>
                    <div className="space-y-3">
                      <Input
                        id="declaration_form"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('declaration_form', e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {validationErrors.declaration_form && <p className="text-sm text-destructive">{validationErrors.declaration_form}</p>}
                      <p className="text-xs text-muted-foreground">PDF/JPG/PNG, max 2MB</p>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => downloadForm('declaration')}>
                          <Download className="w-4 h-4 mr-2" />
                          Download Form
                        </Button>
                        <Button variant="outline" size="sm" onClick={openWhatsApp}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Get at NUNSA Café
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">Document Requirements:</p>
                      <ul className="text-blue-800 space-y-1">
                        <li>• Referee form must be completed and signed by an academic staff</li>
                        <li>• Declaration statement must be signed and dated</li>
                        <li>• All documents must be clearly legible</li>
                        <li>• Contact NUNSA Café via WhatsApp: 07040640646 for physical forms</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 6: Payment Proof */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Payment Proof</h2>
                
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
            <div className="flex justify-between pt-8 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < 6 ? (
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
          </Card>

          {/* Back to Dashboard */}
          <div className="text-center mt-8">
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