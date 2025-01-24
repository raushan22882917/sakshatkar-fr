import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobPostFormData {
  full_name: string;
  email: string;
  phone_number: string;
  company_name: string;
  company_website: string;
  company_logo: File | null;
  job_title: string;
  job_type: string;
  job_location: string;
  job_description: string;
  required_qualifications: string;
  salary_range: string;
  start_date: string;
  end_date: string;
  application_deadline: string;
  application_instructions: string;
  terms_agreement: boolean;
}

export function JobPostForm() {
  const [formData, setFormData] = useState<JobPostFormData>({
    full_name: '',
    email: '',
    phone_number: '',
    company_name: '',
    company_website: '',
    company_logo: null,
    job_title: '',
    job_type: '',
    job_location: '',
    job_description: '',
    required_qualifications: '',
    salary_range: '',
    start_date: '',
    end_date: '',
    application_deadline: '',
    application_instructions: '',
    terms_agreement: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, company_logo: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.terms_agreement) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user session
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      
      if (sessionError || !user) {
        throw new Error('No authenticated user found');
      }

      console.log("Current user:", user.id); // Debug log

      // Generate 6-digit job ID
      const jobId = Math.floor(100000 + Math.random() * 900000).toString();

      // Upload company logo if exists
      let logoUrl = null;
      if (formData.company_logo) {
        const fileExt = formData.company_logo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, formData.company_logo);

        if (uploadError) throw uploadError;
        logoUrl = uploadData.path;
      }

      // Create job post with the current user's ID as recruiter_id
      const { data, error } = await supabase
        .from('job_posts')
        .insert([
          {
            id: jobId,
            recruiter_id: user.id, // Set the authenticated user's ID
            full_name: formData.full_name,
            email: formData.email,
            phone_number: formData.phone_number,
            company_name: formData.company_name,
            company_website: formData.company_website,
            company_logo: logoUrl,
            job_title: formData.job_title,
            job_type: formData.job_type,
            job_location: formData.job_location,
            job_description: formData.job_description,
            required_qualifications: formData.required_qualifications,
            salary_range: formData.salary_range,
            start_date: formData.start_date,
            end_date: formData.end_date,
            application_deadline: formData.application_deadline,
            application_instructions: formData.application_instructions,
            status: 'active'
          }
        ]);

      if (error) {
        console.error("Job post error:", error); // Debug log
        throw error;
      }

      toast({
        title: "Success",
        description: `Job post created successfully! Job ID: ${jobId}`,
      });

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        company_name: '',
        company_website: '',
        company_logo: null,
        job_title: '',
        job_type: '',
        job_location: '',
        job_description: '',
        required_qualifications: '',
        salary_range: '',
        start_date: '',
        end_date: '',
        application_deadline: '',
        application_instructions: '',
        terms_agreement: false,
      });

    } catch (error: any) {
      console.error("Full error:", error); // Debug log
      toast({
        title: "Error",
        description: error.message || "Failed to create job post",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_website">Company Website</Label>
                <Input
                  id="company_website"
                  name="company_website"
                  type="url"
                  value={formData.company_website}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_logo">Company Logo</Label>
                <Input
                  id="company_logo"
                  name="company_logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job/Internship Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job/Internship Title *</Label>
                <Input
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type *</Label>
                <Select
                  name="job_type"
                  value={formData.job_type}
                  onValueChange={(value) => handleSelectChange(value, 'job_type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_location">Job Location *</Label>
                <Input
                  id="job_location"
                  name="job_location"
                  value={formData.job_location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="application_deadline">Application Deadline *</Label>
                <Input
                  id="application_deadline"
                  name="application_deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_description">Job Description *</Label>
              <Textarea
                id="job_description"
                name="job_description"
                value={formData.job_description}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="required_qualifications">Required Qualifications *</Label>
              <Textarea
                id="required_qualifications"
                name="required_qualifications"
                value={formData.required_qualifications}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
              />
            </div>
          </div>

          {/* Application Process */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Application Process</h3>
            <div className="space-y-2">
              <Label htmlFor="application_instructions">Application Instructions</Label>
              <Textarea
                id="application_instructions"
                name="application_instructions"
                value={formData.application_instructions}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>
          </div>

          {/* Terms and Agreement */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms_agreement"
              checked={formData.terms_agreement}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, terms_agreement: checked as boolean }))
              }
            />
            <Label htmlFor="terms_agreement">
              I agree to the terms and conditions of posting a job
            </Label>
          </div>

          <Button type="submit" className="w-full">
            Post Job
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
