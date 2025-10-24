import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AdminStudentRoster() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csv = "matric,name\n21/08nus001,John Doe\n21/08nus002,Jane Smith";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_roster_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "Fill the template with student data (matric, name)",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      // Skip header
      const dataLines = lines.slice(1);
      
      const students = dataLines.map(line => {
        const [matric, name] = line.split(",").map(s => s.trim());
        return { matric: matric.toLowerCase(), name };
      });

      // Validate data
      const errors: string[] = [];
      const validStudents = students.filter((s, idx) => {
        if (!s.matric || !s.name) {
          errors.push(`Line ${idx + 2}: Missing matric or name`);
          return false;
        }
        if (!/^\d{2}\/\d{2}[a-z]{3}\d{3}$/.test(s.matric)) {
          errors.push(`Line ${idx + 2}: Invalid matric format - ${s.matric}`);
          return false;
        }
        return true;
      });

      if (validStudents.length === 0) {
        toast({
          title: "No Valid Data",
          description: "CSV contains no valid student records",
          variant: "destructive",
        });
        setUploadResult({ success: 0, errors });
        return;
      }

      // Bulk insert
      const { data, error } = await supabase
        .from("student_roster")
        .upsert(validStudents, { onConflict: "matric" });

      if (error) throw error;

      setUploadResult({ success: validStudents.length, errors });
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${validStudents.length} student records`,
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload CSV",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Student Roster Management</h2>
        <p className="text-muted-foreground">
          Upload CSV file to add or update student records for voter verification
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">CSV Template</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download the template, fill it with student data (matric number and full name), then upload it back.
            </p>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Upload Student Data</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-upload">Select CSV File</Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Format: matric,name (e.g., 21/08nus001,John Doe)
                </p>
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing CSV file...</span>
                </div>
              )}

              {uploadResult && (
                <div className="space-y-3">
                  {uploadResult.success > 0 && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <AlertDescription>
                        Successfully uploaded {uploadResult.success} student records
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {uploadResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-2">
                          {uploadResult.errors.length} errors found:
                        </div>
                        <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                          {uploadResult.errors.slice(0, 10).map((err, idx) => (
                            <li key={idx}>• {err}</li>
                          ))}
                          {uploadResult.errors.length > 10 && (
                            <li>... and {uploadResult.errors.length - 10} more</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">CSV Format Requirements:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• First row must be headers: matric,name</li>
              <li>• Matric format: YY/YYddd### (e.g., 21/08nus001)</li>
              <li>• No empty rows or missing values</li>
              <li>• Duplicate matric numbers will be updated</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
