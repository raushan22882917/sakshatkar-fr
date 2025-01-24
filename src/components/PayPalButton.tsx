import { useEffect } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PayPalButtonProps {
  amount: string;
  planType: 'pro' | 'enterprise';
  onSuccess?: () => void;
}

const PLAN_IDS = {
  pro: 'P-5ML4271244454362WRXYZ', // Example Pro plan ID - Replace with your actual PayPal plan ID
  enterprise: 'P-8NM4271244454362WXYZ' // Example Enterprise plan ID - Replace with your actual PayPal plan ID
};

export function PayPalButton({ amount, planType, onSuccess }: PayPalButtonProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubscription = async (subscriptionId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check for existing subscription
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSubscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_type: planType,
            payment_id: subscriptionId,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            subscription_type: planType,
            payment_id: subscriptionId,
            payment_provider: 'paypal',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `You are now subscribed to the ${planType.toUpperCase()} plan!`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <PayPalButtons
      createSubscription={(data, actions) => {
        return actions.subscription
          .create({
            plan_id: PLAN_IDS[planType],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
              user_action: 'SUBSCRIBE_NOW',
              return_url: window.location.href,
              cancel_url: window.location.href
            }
          })
          .catch(err => {
            console.error('PayPal subscription creation error:', err);
            toast({
              title: "Error",
              description: "Failed to create subscription. Please try again.",
              variant: "destructive",
            });
            throw err;
          });
      }}
      onApprove={async (data, actions) => {
        try {
          if (data.subscriptionID) {
            await handleSubscription(data.subscriptionID);
          } else {
            throw new Error('No subscription ID received');
          }
        } catch (err) {
          console.error('PayPal approval error:', err);
          toast({
            title: "Error",
            description: "Failed to process approval. Please try again.",
            variant: "destructive",
          });
        }
      }}
      onError={(err) => {
        console.error('PayPal error:', err);
        toast({
          title: "Error",
          description: "PayPal transaction failed. Please try again.",
          variant: "destructive",
        });
      }}
      onCancel={() => {
        toast({
          title: "Cancelled",
          description: "You've cancelled the subscription process.",
          variant: "default",
        });
      }}
      style={{
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "subscribe"
      }}
    />
  );
}