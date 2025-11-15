import React from 'react';

export default function DepartIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 12V18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 15H15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
