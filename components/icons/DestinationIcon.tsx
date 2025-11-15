import React from 'react';

export default function DestinationIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 3V21" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 3H17.4C17.96 3 18.24 3.66 17.82 4.08L14.82 7.08C14.4 7.5 14.4 8.16 14.82 8.58L17.82 11.58C18.24 12 17.96 12.66 17.4 12.66H6" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
