
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const plans = [
  {
    name: 'Silver',
    price: '$49',
    period: '/ month',
    description: 'Perfect for small teams and startups getting started with marketing.',
    features: [
      '5 Team Members',
      '10 Social Accounts',
      '500 AI Content Credits/mo',
      'Unlimited Scheduling',
      'Core Analytics',
      '25 GB Asset Storage',
      'Community Support',
    ],
    cta: 'Choose Silver',
    recommended: false,
  },
  {
    name: 'Gold',
    price: '$99',
    period: '/ month',
    description: 'Ideal for growing businesses that need more power and collaboration.',
    features: [
      '20 Team Members',
      '25 Social Accounts',
      '2000 AI Content Credits/mo',
      'Competitor Intelligence',
      'Advanced Analytics & Reporting',
      '100 GB Asset Storage',
      'Priority Email Support',
    ],
    cta: 'Choose Gold',
    recommended: true,
  },
  {
    name: 'Diamond',
    price: '$199',
    period: '/ month',
    description: 'The ultimate solution for large teams and agencies scaling their operations.',
    features: [
      'Unlimited Team Members',
      'Unlimited Social Accounts',
      '10,000 AI Content Credits/mo',
      'API Access',
      'Custom Branding',
      '500 GB Asset Storage',
      'Dedicated Account Manager',
    ],
    cta: 'Choose Diamond',
    recommended: false,
  },
];

export default function PremiumPage() {
  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="mb-8 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Find the Perfect Plan for Your Team</h1>
            <p className="mt-3 text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock powerful features to supercharge your marketing efforts. Choose the plan that fits your needs and scale as you grow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col h-full shadow-lg rounded-xl transition-transform duration-300 ${
                plan.recommended ? 'border-2 border-purple-600 scale-105 bg-white' : 'bg-white'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-center my-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 font-medium">{plan.period}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-4">
                <Button 
                  className={`w-full text-base py-3 ${
                    plan.recommended ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            By upgrading, you agree to our 
            <a href={createPageUrl("TermsAndConditions")} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline mx-1">
              Terms & Conditions
            </a> 
            and 
            <a href={createPageUrl("PrivacyPolicy")} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-1">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
