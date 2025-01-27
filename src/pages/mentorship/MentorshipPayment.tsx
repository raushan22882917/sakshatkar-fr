import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mentor } from "@/types/mentorship";

export default function MentorshipPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  const mentorId = location.state?.mentorId;
  const sessionType = location.state?.sessionType;

  useEffect(() => {
    if (!mentorId) {
      navigate("/mentorship");
      return;
    }

    fetchMentorDetails();
  }, [mentorId, navigate]);

  const fetchMentorDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select(`
          *,
          profile:profiles(name, email, company_name)
        `)
        .eq("id", mentorId)
        .single();

      if (error) throw error;
      setMentor(data);
    } catch (error) {
      console.error("Error fetching mentor details:", error);
      toast({
        title: "Error",
        description: "Failed to load mentor details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    try {
      // Record the payment in your database
      const { error } = await supabase.from("mentor_bookings").insert({
        mentor_id: mentorId,
        student_id: (await supabase.auth.getUser()).data.user?.id,
        booking_date: new Date().toISOString(),
        status: "confirmed",
        payment_id: details.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment successful! Your session has been booked.",
      });
      
      navigate("/mentorship/success");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  if (loading || !mentor) {
    return <div>Loading...</div>;
  }

  const amount = sessionType === "one_on_one" ? mentor.one_on_one_price : mentor.group_price;

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Book Session with {mentor.profile?.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Session Details</h3>
            <p>Type: {sessionType === "one_on_one" ? "1-on-1 Session" : "Group Session"}</p>
            <p>Price: ${amount}</p>
          </div>

          <PayPalScriptProvider options={{ 
            clientId: process.env.VITE_PAYPAL_CLIENT_ID || "",
            intent: "capture"
          }}>
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: amount.toString(),
                      },
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                if (actions.order) {
                  const details = await actions.order.capture();
                  handlePaymentSuccess(details);
                }
              }}
            />
          </PayPalScriptProvider>
        </CardContent>
      </Card>
    </div>
  );
}