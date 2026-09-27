import React from 'react';
import { useTranslation } from 'react-i18next';
import { MatchLevel } from '../../types';
import { Sparkles, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface Props {
  level: MatchLevel;
  className?: string;
  showIcon?: boolean;
}

export const MatchLabel: React.FC<Props> = ({ level, className = '', showIcon = true }) => {
  const { t } = useTranslation();

  const config = {
    STRONG_MATCH: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: Sparkles,
      label: t('match.STRONG_MATCH', 'Strong Match'),
    },
    GOOD_MATCH: {
      bg: 'bg-green-50 text-green-800 border-green-200',
      icon: CheckCircle2,
      label: t('match.GOOD_MATCH', 'Good Match'),
    },
    NEEDS_INFORMATION: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertCircle,
      label: t('match.NEEDS_INFORMATION', 'Needs Information'),
    },
    NOT_ELIGIBLE: {
      bg: 'bg-stone-100 text-stone-600 border-stone-200',
      icon: XCircle,
      label: t('match.NOT_ELIGIBLE', 'Not Eligible'),
    },
  }[level] || {
    bg: 'bg-stone-100 text-stone-600 border-stone-200',
    icon: AlertCircle,
    label: level,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
};
