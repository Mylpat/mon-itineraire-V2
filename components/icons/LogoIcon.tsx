import React from 'react';

export default function LogoIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="96" height="96" rx="22" fill="#fdfcfb" stroke="#f0eade" strokeWidth="1"/>
      
      {/* Map Lines */}
      <g stroke="#EAE6E1" strokeWidth="2.5" strokeLinecap="round">
        <path d="M25 10 L 25 30 L 15 30" />
        <path d="M45 15 L 45 45 L 65 45 L 65 25" />
        <path d="M85 20 L 85 55 L 70 55" />
        <path d="M15 50 L 40 50" />
        <path d="M15 75 L 35 75 L 35 90" />
        <path d="M55 90 L 55 70 L 85 70" />
      </g>
      
      {/* Route */}
      <path d="M33 41 C 45 60, 60 52, 77 72" stroke="#4F86F7" strokeWidth="5" fill="none" strokeLinecap="round"/>
      
      {/* Pin A */}
      <g transform="translate(33, 41)">
        <path d="M 0,-2 C 12.15,-2 22,-11.85 22,0 C 22,15 0,22 0,22 C 0,22 -22,15 -22,0 C -22,-11.85 -12.15,-2 0,-2 Z" transform="scale(0.6)" fill="#EA4335"/>
        <text x="0" y="2.5" fontSize="13" fill="white" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A</text>
      </g>
      
      {/* Pin B */}
      <g transform="translate(77, 72)">
        <path d="M 0,-2 C 12.15,-2 22,-11.85 22,0 C 22,15 0,22 0,22 C 0,22 -22,15 -22,0 C -22,-11.85 -12.15,-2 0,-2 Z" transform="scale(0.6)" fill="#4F86F7"/>
        <text x="0" y="2.5" fontSize="13" fill="white" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">B</text>
      </g>
    </svg>
  );
}