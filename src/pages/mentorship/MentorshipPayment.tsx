import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface MentorshipPaymentProps {
  mentorId?: string;
  sessionType?: 'one-time' | 'monthly';
}

const amount = {
  currency_code: 'USD',
  value: '100.00'
};

export default function MentorshipPayment({ mentorId, sessionType }: MentorshipPaymentProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [mentor, setMentor] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('mentors')
          .select('*')
          .eq('id', mentorId || id)
          .single();

        if (error) throw error;
        setMentor(data);
      } catch (err) {
        setError('Failed to load mentor details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorDetails();
  }, [mentorId, id]);

  const handlePaymentSuccess = async (details: any) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.from('mentorship_sessions').insert({
        mentor_id: mentorId || id,
        student_id: session.session.user.id,
        payment_id: details.id,
        status: 'paid',
        session_type: sessionType || 'one-time',
        amount: parseFloat(amount.value)
      });

      if (error) throw error;

      toast({
        title: 'Payment Successful',
        description: 'Your mentorship session has been booked.',
      });

      navigate('/dashboard/mentorship');
    } catch (err) {
      console.error('Error saving payment details:', err);
      toast({
        title: 'Error',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error || 'Mentor not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Book Mentorship Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Mentor Details</h3>
              <p>{mentor.name}</p>
              <p className="text-sm text-gray-500">{mentor.expertise}</p>
            </div>

            <div>
              <h3 className="font-medium">Session Details</h3>
              <p>Type: {sessionType || 'One-time'} session</p>
              <p>Amount: ${amount.value} USD</p>
            </div>

            <div className="pt-4">
              <PayPalScriptProvider options={{
                "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID
              }}>
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: amount
                        }
                      ]
                    });
                  }}
                  onApprove={async (data, actions) => {
                    if (actions.order) {
                      const details = await actions.order.capture();
                      handlePaymentSuccess(details);
                    }
                  }}
                  onError={(err) => {
                    console.error('PayPal Error:', err);
                    toast({
                      title: 'Payment Error',
                      description: 'There was an error processing your payment. Please try again.',
                      variant: 'destructive',
                    });
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}