import React from 'react';

export default function NetherlandsFlagIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className}>
      <path fill="#21468B" d="M0 0h3v2H0z"/>
      <path fill="#fff" d="M0 0h3v1.333H0z"/>
      <path fill="#AE1C28" d="M0 0h3v.667H0z"/>
    </svg>
  );
}