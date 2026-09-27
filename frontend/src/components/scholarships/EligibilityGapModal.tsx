import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface EligibilityGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  scholarshipId: string;
  scholarshipTitle: string;
}

// Mock API call
const checkEligibility = async (id: string) => {
  return [
    { id: '1', criteria: 'Category', required: 'OBC, SC, ST', current: 'OBC', status: 'MET' },
    { id: '2', criteria: 'Family Income', required: '< ₹8,00,000/yr', current: 'Unknown', status: 'MISSING' },
    { id: '3', criteria: 'Previous Year CGPA', required: '> 7.5', current: '7.0', status: 'NOT_ELIGIBLE' },
  ];
};

export const EligibilityGapModal: React.FC<EligibilityGapModalProps> = ({ isOpen, onClose, scholarshipId, scholarshipTitle }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      checkEligibility(scholarshipId).then((res) => {
        setData(res);
        setLoading(false);
      });
    }
  }, [isOpen, scholarshipId]);

  if (!isOpen) return null;

  const met = data.filter(d => d.status === 'MET');
  const missing = data.filter(d => d.status === 'MISSING');
  const notEligible = data.filter(d => d.status === 'NOT_ELIGIBLE');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-border"
        >
          <div className="flex justify-between items-center p-6 border-b border-border bg-background/50">
            <div>
              <h2 className="text-xl font-bold text-primary-dark">Eligibility Check</h2>
              <p className="text-sm text-text-secondary mt-1">{scholarshipTitle}</p>
            </div>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            {loading ? (
              <div className="text-center py-8 text-text-muted">Analyzing eligibility...</div>
            ) : (
              <>
                {/* Not Eligible */}
                {notEligible.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-danger uppercase tracking-wider mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> Not Eligible
                    </h3>
                    <div className="space-y-3">
                      {notEligible.map(item => (
                        <div key={item.id} className="p-3 bg-danger/5 border border-danger/20 rounded-md">
                          <p className="font-medium text-text-primary">{item.criteria}</p>
                          <p className="text-sm text-text-secondary mt-1">Required: {item.required} <span className="mx-2">•</span> Current: {item.current}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Info */}
                {missing.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-warning uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Missing Information
                    </h3>
                    <div className="space-y-3">
                      {missing.map(item => (
                        <div key={item.id} className="p-3 bg-warning/5 border border-warning/20 rounded-md flex justify-between items-center">
                          <div>
                            <p className="font-medium text-text-primary">{item.criteria}</p>
                            <p className="text-sm text-text-secondary mt-1">Required: {item.required}</p>
                          </div>
                          <button className="text-xs font-medium bg-primary text-white px-3 py-1.5 rounded hover:bg-primary-dark transition-colors">
                            Update
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Met */}
                {met.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-success uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Criteria Met
                    </h3>
                    <div className="space-y-3">
                      {met.map(item => (
                        <div key={item.id} className="p-3 bg-success/5 border border-success/20 rounded-md">
                          <p className="font-medium text-text-primary">{item.criteria}</p>
                          <p className="text-sm text-text-secondary mt-1">Current: {item.current}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="p-4 border-t border-border flex justify-end bg-background/50">
            <button onClick={onClose} className="px-4 py-2 border border-border rounded-md text-text-primary hover:bg-border/50 transition-colors">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
