import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Plan {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "1 Month",
    price: 2.99,
    description: "Best for short-term job seekers",
    features: [
      "Unlimited job applications",
      "Basic profile customization",
      "Email support",
      "Job alerts"
    ],
    popular: false
  },
  {
    name: "3 Months",
    price: 7.99,
    description: "Save more with a 3-month plan",
    features: [
      "All 1 Month features",
      "Priority profile visibility",
      "Chat support",
      "Resume builder"
    ],
    popular: true
  },
  {
    name: "6 Months",
    price: 14.99,
    description: "Best for serious job seekers",
    features: [
      "All 3 Months features",
      "AI-powered job matching",
      "Interview preparation"
    ],
    popular: false
  },
  {
    name: "12 Months",
    price: 24.99,
    description: "For committed career growth",
    features: [
      "All 6 Months features",
      "Career counseling sessions",
      "Skill assessments",
      "Networking events access"
    ],
    popular: false
  }
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PricingPlans() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<{ subscription_type: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const storeSubscription = async (plan: Plan, paymentId: string, provider: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user?.id,
          subscription_type: plan.name.toLowerCase(),
          payment_id: paymentId,
          provider: provider,
          amount: plan.price,
          status: 'active',
          email: user?.email,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + getDurationInDays(plan.name) * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Subscription Activated",
        description: `Your ${plan.name} subscription has been activated successfully.`,
      });
      
      await fetchUserSubscription();
    } catch (error) {
      console.error('Error storing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to activate subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDurationInDays = (planName: string): number => {
    const durationMap: { [key: string]: number } = {
      "1 Month": 30,
      "3 Months": 90,
      "6 Months": 180,
      "12 Months": 365
    };
    return durationMap[planName] || 30;
  };

  const convertToINR = (usdPrice: number): number => {
    // Using a fixed conversion rate of 1 USD = 83 INR (you might want to use a real-time rate)
    const conversionRate = 83;
    return Math.round(usdPrice * conversionRate * 100); // Convert to paisa
  };

  const handleRazorpayPayment = async (plan: Plan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe to a plan.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    const amountInINR = convertToINR(plan.price);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amountInINR,
      currency: "INR",
      name: "Sakshatkar",
      description: `${plan.name} Subscription`,
      handler: async function (response: any) {
        if (response.razorpay_payment_id) {
          await storeSubscription(plan, response.razorpay_payment_id, 'razorpay');
        }
      },
      prefill: {
        name: user?.email?.split('@')[0],
        email: user?.email,
      },
      theme: {
        color: "#3B82F6",
      },
      notes: {
        usd_amount: plan.price.toString()
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const createPayPalOrder = async (plan: Plan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe to a plan.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${import.meta.env.VITE_PAYPAL_CLIENT_ID}:${import.meta.env.VITE_PAYPAL_CLIENT_SECRET}`)}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: plan.price.toString(),
              },
              description: `${plan.name} Subscription`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      toast({
        title: "Error",
        description: "Failed to create PayPal order. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const onPayPalApprove = async (plan: Plan, data: any) => {
    try {
      const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${data.orderID}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${import.meta.env.VITE_PAYPAL_CLIENT_ID}:${import.meta.env.VITE_PAYPAL_CLIENT_SECRET}`)}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to capture PayPal order');
      }

      const orderData = await response.json();
      await storeSubscription(plan, orderData.id, 'paypal');
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      toast({
        title: "Error",
        description: "Failed to process PayPal payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 w-full max-w-7xl px-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
            {plan.popular && (
              <div className="absolute top-0 right-0 text-white px-4 py-2 text-sm rounded-bl border-2 border-primary bg-gradient-to-r from-blue-600 to-blue-400 shadow-md transform hover:scale-105 transition-all">
              Popular
            </div>
            
            )}
            <CardHeader>
              <CardTitle>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{plan.name}</span>
                  <span className="text-3xl font-bold mt-2">
                    {formatPrice(plan.price)}
                    <span className="text-base font-normal text-gray-600">/month</span>
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-4">
                <Button
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleRazorpayPayment(plan)}
                  disabled={loading || subscription?.subscription_type === plan.name.toLowerCase()}
                >
                  <CreditCard className="h-5 w-5" />
                  Pay with Razorpay (₹{(convertToINR(plan.price) / 100).toFixed(2)})
                </Button>

                <div className="w-full">
                  <PayPalButtons
                    createOrder={() => createPayPalOrder(plan)}
                    onApprove={(data) => onPayPalApprove(plan, data)}
                    style={{ layout: "horizontal" }}
                    disabled={loading || subscription?.subscription_type === plan.name.toLowerCase()}
                  />
                </div>

                {subscription?.subscription_type === plan.name.toLowerCase() && (
                  <div className="text-center text-sm text-green-600">
                    Current Active Plan
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
