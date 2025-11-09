
import React from 'react';

export default function ArrowDownIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14"/>
      <path d="m19 12-7 7-7-7"/>
    </svg>
  );
}
