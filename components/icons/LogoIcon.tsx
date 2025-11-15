import React from 'react';

export default function LogoIcon({ className }: { className?: string }): React.ReactElement {
    return (
        <svg viewBox="0 0 100 100" className={`w-16 h-16 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none">
            <rect width="100" height="100" rx="20" fill="#FBF9F7"/>
            <path stroke="#E6D8D4" strokeWidth="2" d="M25 85L35 75M75 15L65 25M25 15L75 65M65 75L75 85M25 45L45 25M15 25L25 35"/>
            <path d="M76 56C76 65.9411 67.9411 74 58 74C48.0589 74 40 65.9411 40 56C40 46.0589 58 28 58 28C58 28 76 46.0589 76 56Z" fill="#5E99F1"/>
            <path d="M76 56C76 65.9411 67.9411 74 58 74C48.0589 74 40 65.9411 40 56C40 46.0589 58 28 58 28C58 28 76 46.0589 76 56Z" stroke="white" strokeWidth="2"/>
            <foreignObject x="40" y="49" width="36" height="30">
                <p className="text-white font-bold text-lg text-center">B</p>
            </foreignObject>
            <path d="M52 38C52 45.732 45.732 52 38 52C30.268 52 24 45.732 24 38C24 30.268 38 16 38 16C38 16 52 30.268 52 38Z" fill="#F26659"/>
            <path d="M52 38C52 45.732 45.732 52 38 52C30.268 52 24 45.732 24 38C24 30.268 38 16 38 16C38 16 52 30.268 52 38Z" stroke="white" strokeWidth="2"/>
            <foreignObject x="24" y="31" width="28" height="30">
                <p className="text-white font-bold text-lg text-center">A</p>
            </foreignObject>
            <path d="M42.5 48.5C46.6667 53.3333 52.8 54.6 55 54C57.2 53.4 57.5 50.5 54 48.5C50.5 46.5 45.3333 46.8333 42.5 48.5Z" stroke="#5E99F1" strokeWidth="3" strokeLinecap="round"/>
        </svg>
    );
}
