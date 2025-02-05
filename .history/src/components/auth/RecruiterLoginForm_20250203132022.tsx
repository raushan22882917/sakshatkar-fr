import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";when clikc then open new .tsx page for underlyingSymbol  .not popup make exact same ui like image 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export function RecruiterLoginForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("=== Login Process Started ===");

    try {
      // Use Supabase Auth for sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("No user data received after login");
      }

      console.log("Authentication successful, fetching recruiter profile...");

      // Fetch recruiter profile data
      const { data: recruiter, error: profileError } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error("Failed to fetch recruiter profile");
      }

      if (!recruiter) {
        throw new Error("Recruiter profile not found");
      }

      // Update last login timestamp
      const { error: updateError } = await supabase
        .from('recruiter_profiles')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', recruiter.id);

      if (updateError) {
        console.error('Update timestamp error:', updateError);
        // Don't throw here, as login was successful
      }

      // Store recruiter session info
      const sessionData = {
        id: recruiter.id,
        email: recruiter.email,
        first_name: recruiter.first_name,
        last_name: recruiter.last_name,
        company_name: recruiter.company_name,
        phone_number: recruiter.phone_number,
        user_type: 'recruiter' // Changed from role to user_type
      };

      // Set user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { user_type: 'recruiter' } // Changed from role to user_type
      });

      if (metadataError) {
        console.error('Metadata update error:', metadataError);
      }

      localStorage.setItem('recruiter_session', JSON.stringify(sessionData));

      console.log("=== Login Process Completed Successfully ===");

      toast({
        title: "Success!",
        description: `Welcome back${recruiter.first_name ? ', ' + recruiter.first_name : ''}!`,
      });

      // Redirect to recruiter home page
      navigate("/recruiter");
    } catch (error: any) {
      console.error('=== Login Process Failed ===');
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white/50 dark:bg-gray-800"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-white/50 dark:bg-gray-800"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login as Recruiter"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate("/signup")}
        className="w-full hover:bg-white/20"
      >
        Don't have an account? Sign up
      </Button>
    </form>
  );
}