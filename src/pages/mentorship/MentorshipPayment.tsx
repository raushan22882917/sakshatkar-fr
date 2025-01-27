```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mentor } from '@/types/mentorship';

export default function MentorshipPayment() {
  const { id } = useParams();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [amount, setAmount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMentor = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('mentor_profiles')
        .select(`
          *,
          profiles:user_id (
            name,
            email,
            company_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch mentor details",
          variant: "destructive",
        });
        return;
      }

      setMentor(data);
      setAmount(data.one_on_one_price || 0);
    };

    fetchMentor();
  }, [id]);

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toString()
        }
      }],
      intent: "CAPTURE"
    });
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();
      
      // Save payment details to database
      const { error } = await supabase
        .from('mentorship_payments')
        .insert({
          mentor_id: id,
          amount: amount,
          payment_id: details.id,
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  if (!mentor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Book Mentorship Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Mentor Details</h3>
            <p>Name: {mentor.profiles?.name}</p>
            <p>Company: {mentor.profiles?.company_name}</p>
            <p>Rate: ${amount}/hour</p>
          </div>

          <PayPalScriptProvider options={{ 
            "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "" 
          }}>
            <PayPalButtons 
              createOrder={createOrder}
              onApprove={onApprove}
              style={{ layout: "horizontal" }}
            />
          </PayPalScriptProvider>
        </CardContent>
      </Card>
    </div>
  );
}
```