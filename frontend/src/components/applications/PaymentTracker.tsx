import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentTrackerProps {
  applicationId: string;
}

const steps = [
  { id: 'APPROVED', label: 'Approved' },
  { id: 'SANCTIONED', label: 'Sanctioned' },
  { id: 'PAYMENT_INITIATED', label: 'Payment Initiated' },
  { id: 'BANK_VALIDATION', label: 'Bank Validation' },
  { id: 'DBT_PROCESSING', label: 'DBT Processing' },
  { id: 'PAID', label: 'Paid' }
];

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({ applicationId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setData({
        currentStep: 'BANK_VALIDATION',
        amount: '₹50,000',
        transactionRef: 'TXN987654321',
        status: 'PROCESSING' // could be FAILED
      });
      setLoading(false);
    }, 500);
  }, [applicationId]);

  if (loading) {
    return <div className="p-4 text-text-muted">Loading payment status...</div>;
  }

  if (!data) {
    return <div className="p-4 text-text-muted bg-surface border border-border rounded-lg text-center">Payment processing has not yet started.</div>;
  }

  const currentIndex = steps.findIndex(s => s.id === data.currentStep);

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-primary-dark mb-6">DBT Payment Status</h3>
      
      <div className="relative">
        <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border -z-10 hidden md:block"></div>
        <div className="space-y-6 md:space-y-0 md:flex md:justify-between relative z-10">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFailed = isCurrent && data.status === 'FAILED';

            return (
              <div key={step.id} className="flex md:flex-col items-center md:items-center gap-4 md:gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-surface
                  ${isCompleted ? 'border-success text-success' : 
                    isCurrent && isFailed ? 'border-danger text-danger' :
                    isCurrent ? 'border-primary text-primary' : 
                    'border-border text-border'}
                `}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : 
                   isCurrent && isFailed ? <AlertCircle className="w-5 h-5" /> :
                   isCurrent ? <Clock className="w-5 h-5" /> : 
                   <div className="w-2.5 h-2.5 rounded-full bg-border" />}
                </div>
                <div className="md:text-center">
                  <p className={`font-medium text-sm ${isCurrent ? 'text-primary' : isCompleted ? 'text-text-primary' : 'text-text-muted'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Horizontal line for desktop */}
        <div className="hidden md:block absolute top-4 left-0 right-0 h-0.5 bg-border -z-10" />
      </div>

      <div className="mt-8 bg-background p-4 rounded-md border border-border flex justify-between items-center">
        <div>
          <p className="text-xs text-text-secondary uppercase">Sanctioned Amount</p>
          <p className="font-bold text-lg text-text-primary">{data.amount}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-secondary uppercase">Transaction Ref</p>
          <p className="font-mono text-sm text-text-primary">{data.transactionRef || 'Pending'}</p>
        </div>
      </div>

      {data.status === 'FAILED' && (
        <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-sm">
          <strong>Payment Failed:</strong> {data.failureReason || 'Bank account validation failed. Please update your account details.'}
        </div>
      )}
    </div>
  );
};
