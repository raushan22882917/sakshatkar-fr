
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/components/ui/use-toast";
import { Mentor } from '@/types/mentorship';

export const MentorshipPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionType, setSessionType] = useState<'group' | 'one-on-one'>('group');
  const { mentor, selectedDate, selectedTimeSlot } = location.state as {
    mentor: Mentor;
    selectedDate: Date;
    selectedTimeSlot: string;
  };

  const price = sessionType === 'group' ? mentor.hourly_rate * 0.6 : mentor.hourly_rate;

  const handlePaymentSuccess = () => {
    navigate('/mentorship/success', {
      state: {
        mentor,
        sessionType,
        selectedDate,
        selectedTimeSlot,
        price
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Session Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Select Session Type</h3>
            <RadioGroup
              value={sessionType}
              onValueChange={(value) => setSessionType(value as 'group' | 'one-on-one')}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="group" id="group" />
                <Label htmlFor="group">Group Session (Max 5 students) - 40% off</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one-on-one" id="one-on-one" />
                <Label htmlFor="one-on-one">One-on-One Session</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>${price}</span>
            </div>
          </div>
        
          <div className="space-y-4">
            <PayPalButtons
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        currency_code: 'USD',
                        value: price.toString(),
                      },
                    },
                  ],
                });
              }}
              onApprove={(data, actions) => {
                return actions.order!.capture().then(() => {
                  handlePaymentSuccess();
                });
              }}
              onError={() => {
                toast({
                  title: "Payment Error",
                  description: "There was an error processing your payment. Please try again.",
                  variant: "destructive",
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

