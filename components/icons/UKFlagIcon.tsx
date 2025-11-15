import React from 'react';

export default function UKFlagIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className}>
      <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
      <path d="M0 0v30h60V0z" fill="#012169"/>
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" clipPath="url(#a)"/>
      <path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#a)"/>
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" clipPath="url(#a)"/>
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" clipPath="url(#a)"/>
    </svg>
  );
}
