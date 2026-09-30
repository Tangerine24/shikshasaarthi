import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [consents, setConsents] = useState({
    eligibility: false,
    assistant: false,
    analytics: false,
  });

  if (!isOpen) return null;

  const handleToggle = (key: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isEligibilityChecked = consents.eligibility;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/60 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-border">
        <div className="bg-primary p-6 text-white flex items-center gap-3">
          <Shield className="h-8 w-8 text-white/90" />
          <div>
            <h2 className="text-xl font-bold">Data Processing Consent</h2>
            <p className="text-primary/20 text-sm mt-1 text-white/70">डेटा प्रसंस्करण सहमति (DPDP Act 2023)</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-text-secondary text-sm">
            Please provide your consent to process your personal data for the following purposes:
          </p>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 bg-background border border-border rounded-lg cursor-pointer hover:bg-border/30 transition-colors">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                checked={consents.eligibility}
                onChange={() => handleToggle('eligibility')}
              />
              <div>
                <p className="font-medium text-text-primary text-sm">Eligibility Evaluation <span className="text-danger">*</span></p>
                <p className="text-xs text-text-muted mt-1">Automated checking against scholarship criteria using your academic and demographic data.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-background border border-border rounded-lg cursor-pointer hover:bg-border/30 transition-colors">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                checked={consents.assistant}
                onChange={() => handleToggle('assistant')}
              />
              <div>
                <p className="font-medium text-text-primary text-sm">JAGO Assistant Context</p>
                <p className="text-xs text-text-muted mt-1">Grounding JAGO guidance using your verified profile for personalized assistance.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-background border border-border rounded-lg cursor-pointer hover:bg-border/30 transition-colors">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                checked={consents.analytics}
                onChange={() => handleToggle('analytics')}
              />
              <div>
                <p className="font-medium text-text-primary text-sm">Ministry Analytics</p>
                <p className="text-xs text-text-muted mt-1">De-identified aggregate reporting to improve government scholarship schemes.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-background/50">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-md text-text-secondary hover:bg-border/50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onAccept}
            disabled={!isEligibilityChecked}
            className={`px-5 py-2 rounded-md font-medium transition-colors shadow-sm
              ${isEligibilityChecked 
                ? 'bg-primary text-white hover:bg-primary-dark' 
                : 'bg-border text-text-muted cursor-not-allowed'}`}
          >
            I understand and consent
          </button>
        </div>
      </div>
    </div>
  );
};
