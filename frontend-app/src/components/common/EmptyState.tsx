import React from 'react';
import { Link } from 'react-router-dom';
import { Search, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Search,
  actionText,
  actionLink,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
        <Icon className="w-8 h-8 stroke-[1.75]" />
      </div>
      <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">{description}</p>
      {actionText && (actionLink || onActionClick) && (
        actionLink ? (
          <Link
            to={actionLink}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onActionClick}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};
