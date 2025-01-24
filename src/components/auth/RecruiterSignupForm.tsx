import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { validatePassword } from "@/utils/auth";
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaLock } from "react-icons/fa";

export function RecruiterSignupForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting recruiter signup process");
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Invalid Password",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: existingRecruiter } = await supabase
        .from("recruiter_profiles")
        .select("email")
        .eq("email", email)
        .single();

      if (existingRecruiter) {
        throw new Error("An account with this email already exists");
      }

      const { error: profileError } = await supabase
        .from("recruiter_profiles")
        .insert({
          id: crypto.randomUUID(),
          first_name: firstName,
          last_name: lastName,
          email,
          phone_number: phoneNumber,
          company_name: companyName,
          password_hash: password,
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw profileError;
      }

      toast({
        title: "Success!",
        description: "Account created successfully. Please log in.",
      });

      navigate("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-6 bg-gray-100 p-6 rounded-lg shadow-lg dark:bg-gray-900">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <div className="flex items-center bg-white/50 dark:bg-gray-800 rounded-md">
            <FaUser className="mx-2 text-gray-500" />
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="border-none focus:ring-0 w-full bg-transparent"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <div className="flex items-center bg-white/50 dark:bg-gray-800 rounded-md">
            <FaUser className="mx-2 text-gray-500" />
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="border-none focus:ring-0 w-full bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="flex items-center bg-white/50 dark:bg-gray-800 rounded-md">
          <FaEnvelope className="mx-2 text-gray-500" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-none focus:ring-0 w-full bg-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <div className="flex items-center bg-white/50 dark:bg-gray-800 rounded-md">
          <FaPhone className="mx-2 text-gray-500" />
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="border-none focus:ring-0 w-full bg-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <div className="flex items-center bg-white/50 dark:bg-gray-800 rounded-md">
          <FaBuilding className="mx-2 text-gray-500" />
          <Input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="border-none focus:ring-0 w-full bg-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="flex items-center bg-white/50 dark:bg-gray-800 rounded-md">
          <FaLock className="mx-2 text-gray-500" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="border-none focus:ring-0 w-full bg-transparent"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 flex items-center justify-center"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Sign Up as Recruiter"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate("/login")}
        className="w-full flex items-center justify-center hover:bg-white/20"
      >
        Already have an account? Login
      </Button>
    </form>
  );
}
