import { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mentor } from '@/types/mentorship';

export default function MentorshipPayment() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [sessionType, setSessionType] = useState<'group' | 'one-on-one'>('one-on-one');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch mentor details and set the price based on session type
    const fetchMentorDetails = async () => {
      // Assume we get the mentor ID from somewhere (e.g., route params)
      const mentorId = 'some-mentor-id';
      const { data, error } = await supabase
        .from('mentors')
        .select('*')
        .eq('id', mentorId)
        .single();

      if (error) {
        console.error('Error fetching mentor details:', error);
        return;
      }

      setMentor(data);
      setPrice(sessionType === 'group' ? 20 : 50); // Example pricing
    };

    fetchMentorDetails();
  }, [sessionType]);

  const createOrder = async () => {
    // Logic to create an order
    return 'order-id'; // Return the order ID
  };

  const onApprove = async (data: any) => {
    // Logic to handle successful payment
    toast({
      title: 'Payment Successful',
      description: 'Your session has been booked!',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Book a Session with {mentor?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Session Type: {sessionType}</p>
            <p>Price: ${price}</p>
            <PayPalScriptProvider options={{ 
              clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
              intent: "capture"
            }}>
              <PayPalButtons 
                createOrder={createOrder}
                onApprove={onApprove}
              />
            </PayPalScriptProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
