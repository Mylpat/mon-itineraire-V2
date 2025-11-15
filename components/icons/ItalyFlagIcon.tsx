import React from 'react';

export default function ItalyFlagIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className}>
      <path fill="#009246" d="M0 0h1v2H0z"/>
      <path fill="#fff" d="M1 0h1v2H1z"/>
      <path fill="#CE2B37" d="M2 0h1v2H2z"/>
    </svg>
  );
}
