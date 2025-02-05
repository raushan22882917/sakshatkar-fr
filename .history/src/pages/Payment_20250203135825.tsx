import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Loader2 as Spinner } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// PayPal button wrapper component
const PayPalButtonWrapper = ({ selectedPlan, onSuccess }: { selectedPlan: any, onSuccess: (details: any) => void }) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleError = (error: any) => {
    console.error('PayPal Error:', error);
    
    // Get specific error message based on error type
    let errorMessage = "There was an error processing your payment. Please try again.";
    
    if (error.message) {
      if (error.message.includes('cancelled')) {
        errorMessage = "Payment was cancelled. Please try again when you're ready.";
      } else if (error.message.includes('invalid_client')) {
        errorMessage = "PayPal configuration error. Please contact support.";
      } else if (error.message.includes('invalid_currency')) {
        errorMessage = "Currency not supported. Please try a different payment method.";
      } else if (error.message.includes('amount')) {
        errorMessage = "Invalid payment amount. Please contact support.";
      }
    }

    // Check if we should retry
    if (retryCount < maxRetries && !error.message?.includes('cancelled')) {
      setRetryCount(prev => prev + 1);
      errorMessage += " Retrying payment...";
      
      // Retry after 2 seconds
      setTimeout(() => {
        toast({
          title: "Retrying Payment",
          description: `Attempt ${retryCount + 1} of ${maxRetries}`,
          variant: "default",
        });
      }, 2000);
    }

    toast({
      title: "Payment Failed",
      description: errorMessage,
      variant: "destructive",
      action: error.message?.includes('cancelled') ? (
        <ToastAction altText="Try again">Try again</ToastAction>
      ) : undefined
    });
  };

  if (isPending) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center space-x-2 py-4">
          <Spinner className="h-4 w-4" />
          <span>Loading PayPal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  value: selectedPlan.price.toString(),
                  currency_code: "USD"
                },
                description: `${selectedPlan.name} Plan Subscription`
              },
            ],
          }).catch((error) => {
            handleError(error);
            throw error; // Re-throw to prevent PayPal from proceeding
          });
        }}
        onApprove={async (data, actions) => {
          try {
            if (actions.order) {
              const details = await actions.order.capture();
              await onSuccess(details);
              
              toast({
                title: "Payment Successful",
                description: "Your subscription has been activated.",
                variant: "default",
              });
            }
          } catch (error) {
            handleError(error);
          }
        }}
        onError={handleError}
        onCancel={() => {
          toast({
            title: "Payment Cancelled",
            description: "You've cancelled the payment. No charges were made.",
            variant: "default",
            action: <ToastAction altText="Try again">Try again</ToastAction>
          });
        }}
      />
      {retryCount > 0 && retryCount < maxRetries && (
        <div className="mt-2 text-sm text-gray-500 text-center">
          Retry attempt {retryCount} of {maxRetries}
        </div>
      )}
      {retryCount >= maxRetries && (
        <div className="mt-4 text-sm text-red-500 text-center">
          Maximum retry attempts reached. Please try a different payment method or contact support.
        </div>
      )}
    </div>
  );
};

const RazorpayButton = ({ selectedPlan, onSuccess }: { selectedPlan: any, onSuccess: (details: any) => void }) => {
  const { toast } = useToast();
  const [inrAmount, setInrAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const convertToINR = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const rate = data.rates.INR;
        const convertedAmount = Math.ceil(selectedPlan.price * rate);
        setInrAmount(convertedAmount);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        // Fallback conversion rate if API fails (1 USD = 83 INR approximately)
        const fallbackRate = 86;
        const convertedAmount = Math.ceil(selectedPlan.price * fallbackRate);
        setInrAmount(convertedAmount);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedPlan?.price) {
      convertToINR();
    }
  }, [selectedPlan?.price]);

  const handlePayment = () => {
    const options = {
      key: 'rzp_live_PtUXKVx5CraZEI',
      amount: inrAmount * 100, // Convert to paise
      currency: 'INR',
      name: 'Sakshatkar',
      description: `${selectedPlan.name} Plan Subscription`,
      handler: async function (response: any) {
        try {
          await onSuccess({
            id: response.razorpay_payment_id,
            payer: {
              payer_id: response.razorpay_payment_id
            },
            payment_source: 'razorpay',
            amount: {
              value: selectedPlan.price,
              currency_code: 'USD',
              converted_amount: {
                value: inrAmount,
                currency_code: 'INR'
              }
            }
          });
        } catch (error) {
          console.error('Payment verification failed:', error);
          toast({
            title: "Payment Failed",
            description: "There was an error verifying your payment. Please contact support.",
            variant: "destructive",
          });
        }
      },
      prefill: {
        name: '',
        email: ''
      },
      theme: {
        color: '#6366f1'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  if (isLoading) {
    return (
      <Button 
        disabled
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Loading exchange rate...
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-center text-gray-500">
        Amount in INR: ₹{inrAmount}
      </div>
      <Button 
        onClick={handlePayment}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Pay ₹{inrAmount} with Razorpay
      </Button>
    </div>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (location.state?.plan) {
      setSelectedPlan(location.state.plan);
    }
  }, [location.state]);

  useEffect(() => {
    const loadRazorpay = async () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    };
    loadRazorpay();
    
    return () => {
      const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const calculateEndDate = (period: string) => {
    const date = new Date();
    if (period === 'month') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString();
  };

  const handlePaymentSuccess = async (details: any) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const subscriptionData = {
        user_id: user.id,
        plan_name: selectedPlan.name,
        price: selectedPlan.price,
        period: selectedPlan.period,
        payment_method: details.paymentSource || 'razorpay',
        payment_id: details.id || 'unknown',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: calculateEndDate(selectedPlan.period)
      };

      // Record the payment in Supabase
      const { error: paymentError } = await supabase
        .from('user_subscriptions')
        .insert([
          subscriptionData
        ]);

      if (paymentError) throw paymentError;

      // Update user's subscription status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_type: 'premium',
          subscription_end_date: calculateEndDate(selectedPlan.period)
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Payment Successful!",
        description: `You are now subscribed to the ${selectedPlan.name} plan.`,
        variant: "default",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Plan Selected</h1>
            <Button onClick={() => navigate('/pricing')}>View Plans</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
  <Navbar />
  <div className="flex-grow flex">
    {/* Left Side - Payment Instructions */}
    <div className="w-1/2 hidden md:flex flex-col justify-center items-center p-12 ">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4">Secure Payment</h2>
        <p className="text-lg mb-6 opacity-90">
          Choose your preferred payment method and complete your subscription securely.
        </p>
        <ul className="space-y-3 text-left text-sm">
          {[
            "100% Secure Payments",
            "Multiple Payment Options",
            "Instant Activation",
          ].map((text, index) => (
            <li key={index} className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Right Side - Payment Card */}
    <div className="w-full md:w-1/2 flex justify-center items-center p-6">
      <Card className="w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
        <CardHeader className="text-center bg-gray-50 dark:bg-gray-800 py-6 rounded-t-xl">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Complete Your Subscription
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
            Subscribe to{" "}
            <span className="font-semibold text-primary">{selectedPlan?.name}</span> Plan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              ${selectedPlan?.price}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              per {selectedPlan?.period || "month"}
            </div>
          </div>

          <div className="space-y-4">
            {/* PayPal Button */}
            <PayPalScriptProvider
              options={{
                clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
                currency: "USD",
              }}
            >
              <PayPalButtonWrapper
                selectedPlan={selectedPlan}
                onSuccess={handlePaymentSuccess}
              />
            </PayPalScriptProvider>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                  Or pay in INR
                </span>
              </div>
            </div>

            {/* Razorpay Button */}
            {razorpayLoaded && (
              <RazorpayButton
                selectedPlan={selectedPlan}
                onSuccess={handlePaymentSuccess}
              />
            )}
          </div>
        </CardContent>

        <div className="px-6 pb-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Secured by{" "}
          <span className="font-semibold text-primary">
            Sakshatkar Payments
          </span>
        </div>
      </Card>
    </div>
  </div>
</div>

  );
};

export default PaymentPage;
