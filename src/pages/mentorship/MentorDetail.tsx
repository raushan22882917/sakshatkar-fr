import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';
import { Clock, Mail, Calendar, Star, Award, BookOpen, Users, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { loadRazorpay } from '@/lib/razorpay';

interface MentorProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  expertise: string[];
  experience_years: number;
  one_on_one_price: number;
  hourly_rate: number;
  email: string;
  total_sessions: number;
  rating: number;
  availability: string;
  achievements: string[];
  education: string;
}

interface BookingDetails {
  id: string;
  payment_method: string;
  payment_id: string;
  amount: number;
  status: string;
  booking_date: string;
}

export default function MentorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [{ isPending }] = usePayPalScriptReducer();
  const [isBooked, setIsBooked] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [exchangeRate, setExchangeRate] = useState(83); // Default INR/USD rate

  useEffect(() => {
    fetchMentorDetails();
    checkBookingStatus();
    fetchExchangeRate();
  }, [id]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      setExchangeRate(data.rates.INR);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Fallback to default rate if API fails
    }
  };

  const checkBookingStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('mentorship_bookings')
        .select('*')
        .eq('mentor_id', id)
        .eq('user_id', session.user.id)
        .eq('status', 'confirmed')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setIsBooked(true);
        setBookingDetails(data);
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
  };

  const fetchMentorDetails = async () => {
    try {
      if (!id) {
        setError('Mentor ID is required');
        return;
      }

      const { data, error } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        setError('Mentor not found');
        return;
      }

      setMentor(data);
    } catch (err: any) {
      console.error('Error fetching mentor details:', err);
      setError(err.message || 'Failed to load mentor details');
      toast({
        title: 'Error',
        description: 'Failed to load mentor details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaypalPayment = async (data: any, actions: any) => {
    const price = mentor?.one_on_one_price || mentor?.hourly_rate || 0;
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: price.toString(),
            currency_code: 'USD'
          },
          description: `Mentorship session with ${mentor?.full_name}`
        }
      ]
    });
  };

  const handlePaypalApprove = async (data: any, actions: any) => {
    try {
      await actions.order.capture();
      await saveMentorshipBooking('paypal', data.orderID);
      setIsBooked(true);
      await checkBookingStatus(); // Refresh booking details
      toast({
        title: "Success",
        description: "Payment successful! Your session has been booked.",
      });
      setShowPaymentDialog(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('PayPal payment error:', error);
      toast({
        title: "Error",
        description: "Payment failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const price = mentor?.one_on_one_price || mentor?.hourly_rate || 0;
      const priceInINR = Math.round(price * exchangeRate * 100); // Convert to INR and smallest unit

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: priceInINR,
        currency: 'INR',
        name: 'Sakshatkar',
        description: `Mentorship session with ${mentor?.full_name}`,
        handler: async (response: any) => {
          await saveMentorshipBooking('razorpay', response.razorpay_payment_id);
          setIsBooked(true);
          await checkBookingStatus(); // Refresh booking details
          toast({
            title: "Success",
            description: "Payment successful! Your session has been booked.",
          });
          setShowPaymentDialog(false);
          navigate('/dashboard');
        },
        prefill: {
          email: mentor?.email,
        },
        theme: {
          color: '#7C3AED',
        },
      };

      const RazorpayConstructor = await loadRazorpay();
      const razorpayInstance = new RazorpayConstructor(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      toast({
        title: "Error",
        description: "Payment failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveMentorshipBooking = async (paymentMethod: string, paymentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id || !mentor?.id) return;

      const price = mentor.one_on_one_price || mentor.hourly_rate || 0;

      // Save to FastAPI backend
      const response = await fetch('/api/payments/mentorship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session.user.id,
          mentor_id: mentor.id,
          amount: price,
          payment_method: paymentMethod,
          payment_id: paymentId,
          currency: paymentMethod === 'razorpay' ? 'INR' : 'USD',
          status: 'confirmed',
          booking_date: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save payment details');
      }

      // Also save to Supabase for real-time updates
      const { error } = await supabase
        .from('mentorship_bookings')
        .insert({
          mentor_id: mentor.id,
          user_id: session.user.id,
          payment_method: paymentMethod,
          payment_id: paymentId,
          amount: price,
          status: 'confirmed',
          booking_date: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader type="spinner" size="large" message="Loading mentor details..." />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'Mentor not found'}</p>
            <Button onClick={() => navigate('/mentorship')} variant="outline">
              Back to Mentor List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="relative">
          <Button
            onClick={() => navigate('/mentorship')}
            variant="outline"
            className="absolute top-4 right-4"
          >
            Back to Mentor List
          </Button>
          <div className="flex items-center space-x-6">
            <img
              src={mentor.avatar_url || '/default-avatar.png'}
              alt={mentor.full_name}
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {mentor.full_name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                {mentor.expertise.join(', ')}
              </p>
              <div className="flex items-center mt-2 text-yellow-500">
                <Star className="w-5 h-5 mr-2" />
                <span className="ml-1 text-gray-700 dark:text-gray-200">
                  {mentor.rating.toFixed(1)} Rating
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                About Me
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{mentor.bio}</p>
              
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Award className="w-5 h-5" />
                <span>{mentor.experience_years} Years of Experience</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <BookOpen className="w-5 h-5" />
                <span>{mentor.education}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Mentorship Details
              </h2>
              
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Clock className="w-5 h-5" />
                <span>${mentor.one_on_one_price || mentor.hourly_rate}/Month</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Calendar className="w-5 h-5" />
                <span>Availability: {mentor.availability}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Users className="w-5 h-5" />
                <span>{mentor.total_sessions} Sessions Completed</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Mail className="w-5 h-5" />
                <span>{mentor.email}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Achievements
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              {mentor.achievements?.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>

          {bookingDetails && (
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                <Check className="w-5 h-5 mr-2" />
                Booking Details
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>
                  <span className="font-medium">Booking ID:</span> {bookingDetails.id}
                </p>
                <p>
                  <span className="font-medium">Payment Method:</span>{' '}
                  {bookingDetails.payment_method.toUpperCase()}
                </p>
                <p>
                  <span className="font-medium">Amount Paid:</span> ${bookingDetails.amount}
                </p>
                <p>
                  <span className="font-medium">Booking Date:</span>{' '}
                  {new Date(bookingDetails.booking_date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {bookingDetails.status}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="mt-8">
            {isBooked ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white cursor-not-allowed"
                disabled
              >
                <Check className="w-4 h-4 mr-2" />
                Session Booked
              </Button>
            ) : (
              <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Book a Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Choose Payment Method</DialogTitle>
                    <DialogDescription>
                      Select your preferred payment method to book a session with {mentor?.full_name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-4">
                      {isPending ? (
                        <div className="flex justify-center">
                          <Loader type="spinner" size="small" />
                        </div>
                      ) : (
                        <PayPalButtons
                          createOrder={handlePaypalPayment}
                          onApprove={handlePaypalApprove}
                          style={{ layout: "horizontal" }}
                        />
                      )}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or pay with
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={handleRazorpayPayment}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Pay with Razorpay
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
