
import React from 'react';

export default function WalkIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1"/>
      <path d="M9 20l3-6"/>
      <path d="M12 14l5 6"/>
      <path d="m7 10 5 1 5-6"/>
    </svg>
  );
}
