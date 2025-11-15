import React from 'react';

export default function CarIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16.94a4 4 0 1 0-8 0"/>
      <path d="M5.34 12.36a4 4 0 0 1 0-4.72l.7-1.21a4 4 0 0 1 3.47-2h4.98a4 4 0 0 1 3.47 2l.7 1.21a4 4 0 0 1 0 4.72l-.7 1.21a4 4 0 0 1-3.47 2H9.51a4 4 0 0 1-3.47-2Z"/>
      <path d="M2 12h2.5"/>
      <path d="M19.5 12H22"/>
    </svg>
  );
}