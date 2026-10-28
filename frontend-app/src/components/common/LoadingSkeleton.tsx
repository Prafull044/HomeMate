import React from 'react';

export const PropertySkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
    <div className="w-full h-48 bg-slate-200 rounded-xl" />
    <div className="h-4 bg-slate-200 rounded-md w-3/4" />
    <div className="h-4 bg-slate-200 rounded-md w-1/2" />
    <div className="flex gap-2 pt-2">
      <div className="h-6 w-16 bg-slate-200 rounded-md" />
      <div className="h-6 w-16 bg-slate-200 rounded-md" />
    </div>
  </div>
);

export const RoommateSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 bg-slate-200 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-200 rounded-md w-2/3" />
        <div className="h-3 bg-slate-200 rounded-md w-1/3" />
      </div>
    </div>
    <div className="h-12 bg-slate-100 rounded-xl" />
    <div className="h-8 bg-slate-200 rounded-xl" />
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-16 bg-slate-100 rounded-xl w-full" />
    ))}
  </div>
);
