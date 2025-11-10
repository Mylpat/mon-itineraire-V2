import React from 'react';
import type { Language } from '../lib/i18n';
import FranceFlagIcon from './icons/FranceFlagIcon';
import UKFlagIcon from './icons/UKFlagIcon';
import GermanyFlagIcon from './icons/GermanyFlagIcon';
import ItalyFlagIcon from './icons/ItalyFlagIcon';
import NetherlandsFlagIcon from './icons/NetherlandsFlagIcon';


interface LanguageSwitcherProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
}

// FIX: Store component types instead of instances to preserve prop types and avoid issues with React.cloneElement.
const languageMap: { code: Language; icon: React.ComponentType<{ className?: string }>; }[] = [
    { code: 'fr', icon: FranceFlagIcon },
    { code: 'en', icon: UKFlagIcon },
    { code: 'de', icon: GermanyFlagIcon },
    { code: 'it', icon: ItalyFlagIcon },
    { code: 'nl', icon: NetherlandsFlagIcon },
];

export default function LanguageSwitcher({ currentLang, onLangChange }: LanguageSwitcherProps): React.ReactElement {
  return (
    <div className="flex items-center space-x-2 bg-white/70 p-1.5 rounded-full shadow-sm">
      {languageMap.map(({ code, icon: Icon }) => (
        <button
          key={code}
          onClick={() => onLangChange(code)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ring-2 ring-transparent ${
            currentLang === code
              ? 'ring-blue-500 scale-110 cursor-default'
              : 'hover:ring-blue-300 hover:scale-110'
          }`}
          disabled={currentLang === code}
          title={code.toUpperCase()}
        >
          {/* FIX: Render the component directly instead of using React.cloneElement to fix the type error. */}
          <Icon className="w-6 h-6 rounded-full object-cover" />
        </button>
      ))}
    </div>
  );
}
