import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Mentor } from '@/types/mentorship';

export function MentorshipSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mentor, sessionType, selectedDate, selectedTimeSlot, price } = location.state as {
    mentor: Mentor;
    sessionType: 'group' | 'one-on-one';
    selectedDate: Date;
    selectedTimeSlot: string;
    price: number;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">Session Details</h3>
              <p className="text-gray-600">
                <span className="font-medium">Mentor:</span> {mentor.profiles?.name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Session Type:</span> {sessionType === 'group' ? 'Group Session' : 'One-on-One Session'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Date:</span> {format(selectedDate, 'MMMM d, yyyy')}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Time:</span> {selectedTimeSlot}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Amount Paid:</span> ${price}
              </p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600">
                A confirmation email has been sent to your registered email address.
              </p>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MentorshipSuccess;