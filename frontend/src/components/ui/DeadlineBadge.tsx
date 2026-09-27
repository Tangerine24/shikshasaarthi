import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeadlineInfo } from '../../types';
import { Clock, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  deadlineInfo?: DeadlineInfo;
  deadlineDate?: string;
  className?: string;
}

export const DeadlineBadge: React.FC<Props> = ({ deadlineInfo, deadlineDate, className = '' }) => {
  const { t } = useTranslation();

  if (!deadlineInfo && deadlineDate) {
    const diff = Math.ceil((new Date(deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    let status: DeadlineInfo['status'] = 'NORMAL';
    if (diff < 0) status = 'EXPIRED';
    else if (diff <= 2) status = 'CRITICAL';
    else if (diff <= 6) status = 'URGENT';
    else if (diff <= 14) status = 'UPCOMING';
    deadlineInfo = { status, daysLeft: Math.max(0, diff) };
  }

  if (!deadlineInfo) return null;

  const { status, daysLeft } = deadlineInfo;

  const styleMap = {
    CRITICAL: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertCircle,
      text: t('deadline.CRITICAL', { days: daysLeft, defaultValue: `${daysLeft} days left — urgent` }),
    },
    URGENT: {
      bg: 'bg-orange-50 text-orange-800 border-orange-200',
      icon: AlertTriangle,
      text: t('deadline.URGENT', { days: daysLeft, defaultValue: `${daysLeft} days left — apply soon` }),
    },
    UPCOMING: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock,
      text: t('deadline.UPCOMING', { days: daysLeft, defaultValue: `${daysLeft} days left` }),
    },
    NORMAL: {
      bg: 'bg-stone-50 text-stone-700 border-stone-200',
      icon: Clock,
      text: t('deadline.NORMAL', { days: daysLeft, defaultValue: `${daysLeft} days left` }),
    },
    EXPIRED: {
      bg: 'bg-stone-100 text-stone-500 border-stone-200',
      icon: Clock,
      text: t('deadline.EXPIRED', 'Deadline passed'),
    },
  }[status];

  const Icon = styleMap.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleMap.bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {styleMap.text}
    </span>
  );
};
