'use client';

import { useState } from 'react';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export default function ExpandableSection({ 
  title, 
  children, 
  defaultExpanded = false,
  className = ""
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border-clean ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 text-left hover-invert flex items-center justify-between font-mono text-sm font-medium"
      >
        <span>{title}</span>
        <span className="text-lg">
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-4 animate-slide-down">
          <div className="border-t border-gray-200 pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
