import React from 'react';

export default function GermanyFlagIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className={className}>
      <rect width="5" height="3" fill="#000"/>
      <rect y="1" width="5" height="2" fill="#D00"/>
      <rect y="2" width="5" height="1" fill="#FFCE00"/>
    </svg>
  );
}