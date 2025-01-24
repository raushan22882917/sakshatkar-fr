import React from 'react';
import { Navbar } from '@/components/Navbar';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  ShieldCheck, 
  GraduationCap, 
  RefreshCcw, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

const offers = [
  {
    icon: GraduationCap,
    title: "Student Discount",
    description: "50% off for students with valid academic email",
    color: "bg-blue-50 dark:bg-blue-900/30",
    iconColor: "text-blue-600"
  },
  {
    icon: Clock,
    title: "30-Day Money-Back",
    description: "Full refund if you're not completely satisfied",
    color: "bg-green-50 dark:bg-green-900/30",
    iconColor: "text-green-600"
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "256-bit encryption for all transactions",
    color: "bg-purple-50 dark:bg-purple-900/30",
    iconColor: "text-purple-600"
  }
];

const frequentlyAskedQuestions = [
  {
    question: "Can I switch plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and take effect immediately."
  },
  {
    question: "Do you offer a free trial?",
    answer: "We offer a free tier with limited features. For full access to premium features, you'll need to subscribe to one of our paid plans."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major credit cards, PayPal, and Razorpay for international payments."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption and follow strict data protection guidelines to ensure your information remains private and secure."
  }
];

export function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Offers Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
            Why Choose Sakshatkar?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <Card 
                key={index} 
                className={`transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${offer.color}`}
              >
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${offer.iconColor} bg-opacity-20`}>
                    <offer.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {offer.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {offer.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {frequentlyAskedQuestions.map((faq, index) => (
              <details
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
              >
                <summary className="p-4 cursor-pointer flex items-center justify-between text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-primary">
                  <span>{faq.question}</span>
                  <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
