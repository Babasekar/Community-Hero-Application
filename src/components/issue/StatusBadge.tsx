/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IssueStatus } from '../../types';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config: Record<IssueStatus, { label: string; bg: string; text: string; dot: string }> = {
    open: { label: 'Open', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    assigned: { label: 'Assigned', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
    claim_pending: { label: 'Claim Pending', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500 animate-pulse' },
    in_progress: { label: 'In Progress', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    escalated: { label: 'Escalated', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500 animate-pulse' },
    resolved: { label: 'Resolved', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', dot: 'bg-teal-500' }
  };

  const current = config[status] || config.open;

  return (
    <span id={`status-${status}`} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};
