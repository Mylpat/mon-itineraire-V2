import React, { useState, useRef, useEffect } from 'react';
import type { Language } from '../lib/i18n';
import { languageNames, SUPPORTED_LANGUAGES } from '../lib/i18n';
import FranceFlagIcon from './icons/FranceFlagIcon';
import UKFlagIcon from './icons/UKFlagIcon';
import GermanyFlagIcon from './icons/GermanyFlagIcon';
import ItalyFlagIcon from './icons/ItalyFlagIcon';
import NetherlandsFlagIcon from './icons/NetherlandsFlagIcon';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
}

const flagComponents: { [key in Language]: React.FC<{ className?: string }> } = {
  fr: FranceFlagIcon,
  en: UKFlagIcon,
  de: GermanyFlagIcon,
  it: ItalyFlagIcon,
  nl: NetherlandsFlagIcon,
};

export default function LanguageSwitcher({ currentLang, onLangChange }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  const CurrentFlag = flagComponents[currentLang];
  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center sm:justify-start gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition w-12 h-12 sm:w-auto sm:h-auto sm:py-2 sm:pl-3 sm:pr-4"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <CurrentFlag className="h-5 w-5 rounded-full shrink-0" />
        <span className="hidden sm:inline">{languageNames[currentLang]}</span>
        <svg className="w-4 h-4 text-white hidden sm:inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5"
          role="menu"
          aria-orientation="vertical"
        >
          {(Object.keys(languageNames) as Language[]).map((langCode) => {
            const FlagComponent = flagComponents[langCode];
            return (
              <button
                key={langCode}
                onClick={() => { onLangChange(langCode); setIsOpen(false); }}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <FlagComponent className="h-5 w-5 rounded-full" />
                <span>{languageNames[langCode]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
