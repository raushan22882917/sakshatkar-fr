import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PricingPlans } from "./pricing/PricingPlans";
import { FAQ } from "./pricing/FAQ";

export function Pricing() {
  const { user } = useAuth();
  
  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_type, subscription_end_date')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent drop-shadow-md">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that's right for you. All paid plans include a 30-day money-back guarantee.
          </p>
          {subscription && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg inline-block">
              <p className="text-blue-600 dark:text-blue-400">
                Current Plan: <span className="font-semibold">{subscription.subscription_type}</span>
                {subscription.subscription_end_date && (
                  <span className="ml-2">
                    (Expires: {new Date(subscription.subscription_end_date).toLocaleDateString()})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <PricingPlans subscription={subscription} />
        <FAQ />
      </div>
    </div>
  );
}

export default Pricing;