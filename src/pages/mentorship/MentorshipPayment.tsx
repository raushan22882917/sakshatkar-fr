
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PayPalButtons } from "@paypal/react-paypal-js";
import type { PayPalButtonsComponentProps } from "@paypal/react-paypal-js";

interface MentorshipPaymentProps {}

const MentorshipPayment: React.FC<MentorshipPaymentProps> = () => {
  const { toast } = useToast();

  const createOrder: PayPalButtonsComponentProps['createOrder'] = async () => {
    return "test-order-id"; // Return order ID from your server
  };

  const handleApprove: PayPalButtonsComponentProps['onApprove'] = async (data) => {
    toast({
      title: "Payment Successful",
      description: "Thank you for your payment!",
      variant: "default",
    });
    return Promise.resolve();
  };

  const handleError: PayPalButtonsComponentProps['onError'] = (error) => {
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
        createOrder={createOrder}
        onApprove={handleApprove}
        onError={handleError}
      />
    </div>
  );
};

export default MentorshipPayment;
