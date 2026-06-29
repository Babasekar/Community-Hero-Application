/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IssueCategory } from '../../types';
import { Navigation, Droplets, Lightbulb, Trash2, ShieldAlert, FileText } from 'lucide-react';

interface CategoryBadgeProps {
  category: IssueCategory;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const config: Record<IssueCategory, { label: string; bg: string; text: string; icon: any }> = {
    road: { label: 'Road & Pothole', bg: 'bg-amber-50', text: 'text-amber-700 border-amber-200', icon: Navigation },
    water: { label: 'Water Leak', bg: 'bg-blue-50', text: 'text-blue-700 border-blue-200', icon: Droplets },
    lighting: { label: 'Street Light', bg: 'bg-yellow-50', text: 'text-yellow-700 border-yellow-200', icon: Lightbulb },
    waste: { label: 'Waste Dumping', bg: 'bg-rose-50', text: 'text-rose-700 border-rose-200', icon: Trash2 },
    drainage: { label: 'Drainage/Sewer', bg: 'bg-purple-50', text: 'text-purple-700 border-purple-200', icon: ShieldAlert },
    other: { label: 'Other Civic Issue', bg: 'bg-slate-50', text: 'text-slate-700 border-slate-200', icon: FileText }
  };

  const current = config[category] || config.other;
  const Icon = current.icon;

  return (
    <span id={`cat-${category}`} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {current.label}
    </span>
  );
};
