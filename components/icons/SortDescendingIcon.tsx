import React from 'react';

export default function SortDescendingIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 8 4-4 4 4"/>
      <path d="M7 4v16"/>
      <path d="M11 4h10"/>
      <path d="M11 8h7"/>
      <path d="M11 12h4"/>
    </svg>
  );
}
