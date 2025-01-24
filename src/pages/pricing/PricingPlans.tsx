import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const plans = [
  {
    name: "1 Month",
    price: "$2.99",
    period: "month",
    description: "Best for short-term job seekers",
    features: [
      "Unlimited job applications",
      "Priority profile listing",
      "Advanced job search filters",
      "Application tracking",
      "Resume builder",
      "24/7 Priority support",
      "Interview preparation tools",
    ],
    popular: false,
  },
  {
    name: "3 Months",
    price: "$7.99",
    period: "3 months",
    description: "Save more with a 3-month plan",
    features: [
      "All 1 Month features",
      "Higher priority profile listing",
      "Personalized job recommendations",
      "Exclusive job market insights",
    ],
    popular: true,
  },
  {
    name: "6 Months",
    price: "$14.99",
    period: "6 months",
    description: "Best for serious job seekers",
    features: [
      "All 3 Months features",
      "Early access to premium jobs",
      "Exclusive career-building webinars",
    ],
    popular: false,
  },
  {
    name: "12 Months",
    price: "$24.99",
    period: "year",
    description: "For committed career growth",
    features: [
      "All 6 Months features",
      "1-on-1 career coaching sessions",
      "Salary negotiation tools",
      "Networking opportunities",
    ],
    popular: false,
  },
];

export function PricingPlans({ subscription }: { subscription: any }) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = (plan: typeof plans[0]) => {
    navigate('/payment', { 
      state: { 
        plan: {
          name: plan.name,
          price: parseFloat(plan.price.replace('$', '')),
          period: plan.period
        }
      }
    });
  };

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 w-full max-w-7xl px-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative transition-transform transform hover:scale-105 w-full max-w-xs mx-auto ${
              plan.popular
                ? "border-2 border-blue-500 dark:border-blue-400 shadow-lg"
                : "border border-gray-200 dark:border-gray-700"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {plan.name}
              </CardTitle>
              <div className="text-center">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {plan.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-3 text-lg ${
                  plan.popular
                    ? "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white"
                    : "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
                }`}
                onClick={() => handleSubscribe(plan)}
                disabled={subscription?.subscription_type === plan.name.toLowerCase()}
              >
                {subscription?.subscription_type === plan.name.toLowerCase()
                  ? "Current Plan"
                  : "Subscribe Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
