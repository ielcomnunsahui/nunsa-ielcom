import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@2.0.0";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
     const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    // ... inside try block ...
    const { voterId, email } = await req.json();

// 1. [NEW STEP] Invalidate any existing unverified OTPs for this voter
    const { error: invalidateError } = await supabaseAdmin
     .from("voter_otp")
  .update({ verified: true }) // Mark them as "used" or "verified" so they can't be used
  .eq("voter_id", voterId)
  .eq("verified", false)
  .gt("expires_at", new Date().toISOString());

if (invalidateError) {
  console.error("OTP invalidation error:", invalidateError);
  // Do NOT throw. This is a cleanup step. Log and continue.
}

// Generate 6-digit OTP
const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
 
// The verify-otp function currently checks for `expires_at`.
const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000).toISOString();

// Store OTP in database
const { error: otpError } = await supabaseAdmin
  .from("voter_otp")
  .insert({
    voter_id: voterId,
    otp_code: otpCode,
    expires_at: tenMinutesFromNow, // ADD THIS LINE (if your table supports it)
  });

    if (otpError) {
      console.error("OTP insert error:", otpError);
      throw otpError;
    }

    // Send OTP via email
    const emailResponse = await resend.emails.send({
      from: "NUNSA Elections <onboarding@resend.dev>",
      to: [email],
      subject: "Your NUNSA Election Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">NUNSA Election Verification</h1>
          <p>Your NUNSA Election verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">NUNSA Independent Student Electoral Committee</p>
        </div>
      `,
    });

    console.log("Email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});