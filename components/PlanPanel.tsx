/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Crown, Zap, Sparkles, CreditCard } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out',
    features: [
      '5 video generations/month',
      'Basic avatars',
      '720p resolution',
      'Standard rendering',
      'Community support',
    ],
    icon: Zap,
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For content creators',
    features: [
      '100 video generations/month',
      'All premium avatars',
      '1080p resolution',
      'Priority rendering',
      'Face replacement',
      'Voice cloning',
      'Email support',
    ],
    icon: Sparkles,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For teams & businesses',
    features: [
      'Unlimited generations',
      'Custom avatars',
      '4K resolution',
      'Instant rendering',
      'Advanced face replacement',
      'Custom voice training',
      'API access',
      'Dedicated support',
      'Team collaboration',
    ],
    icon: Crown,
    popular: false,
  },
];

const PlanPanel: React.FC = () => {
  const { isPlanPanelOpen, setIsPlanPanelOpen } = useApp();
  const [selectedPlan, setSelectedPlan] = useState('pro');

  if (!isPlanPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsPlanPanelOpen(false)}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto m-4 bg-card border border-border rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={() => setIsPlanPanelOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h2>
            <p className="text-muted-foreground">Unlock the full potential of AI video creation</p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                      : 'border-border bg-card hover:border-primary/50'
                  } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {isSelected ? 'Get Started' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Payment Section */}
          <div className="mt-10 p-6 bg-muted/50 rounded-2xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Secure payment powered by Stripe. Cancel anytime.
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>We accept:</span>
                <div className="flex gap-2">
                  <div className="px-2 py-1 bg-background rounded">Visa</div>
                  <div className="px-2 py-1 bg-background rounded">Mastercard</div>
                  <div className="px-2 py-1 bg-background rounded">Amex</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanPanel;
