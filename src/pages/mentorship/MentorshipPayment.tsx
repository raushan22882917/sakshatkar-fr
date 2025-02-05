import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PayPalButtons } from "@paypal/react-paypal-js";

const MentorshipPayment = () => {
  const { toast } = useToast();

  const createOrder = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "100.00"
        }
      }
    ]
  };

  const handleApprove = (data: any) => {
    toast({
      title: "Payment Successful",
      description: "Thank you for your payment!",
      variant: "default",
    });
  };

  const handleError = (error: any) => {
    toast({
      title: "Payment Error",
      description: error.message || "An error occurred during the payment process.",
      variant: "destructive",
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Mentorship Payment</h2>
      <PayPalButtons
        createOrder={() => Promise.resolve(createOrder)}
        onApprove={handleApprove}
        onError={handleError}
      />
    </div>
  );
};

export default MentorshipPayment;
