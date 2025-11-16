import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { TransportMode, type ItineraryRequest, type ItineraryResponse, type SavedItinerary, type Coordinates } from './types';
import { getTranslator, SUPPORTED_LANGUAGES, type Language } from './lib/i18n';
import { generateItinerary } from './services/geminiService';
import LanguageSwitcher from './components/LanguageSwitcher';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import SavedItineraries from './components/SavedItineraries';
import LogoIcon from './components/icons/LogoIcon';
import SpinnerIcon from './components/icons/SpinnerIcon';

const LOCAL_STORAGE_KEY = 'mon-itineraire-sauvegardes';
const LANGUAGE_STORAGE_KEY = 'jyvais-language';

const createInitialRequest = (): ItineraryRequest => ({
  name: '',
  transportMode: TransportMode.CAR,
  parcours: [
    { id: Date.now(), value: '' },
    { id: Date.now() + 1, value: '' }
  ],
  currentLocation: null,
});

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as Language)) {
      return storedLang as Language;
    }
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
      return browserLang as Language;
    }
    return 'fr';
  });
  
  const t = getTranslator(language);
  const [itineraryRequest, setItineraryRequest] = useState<ItineraryRequest>(createInitialRequest());
  const [itineraryResponse, setItineraryResponse] = useState<ItineraryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadedItineraryId, setLoadedItineraryId] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedItineraries(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load itineraries from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedItineraries));
    } catch (error) {
      console.error("Failed to save itineraries to local storage", error);
    }
  }, [savedItineraries]);

  useEffect(() => {
    if ((itineraryResponse || error || isLoading) && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [itineraryResponse, error, isLoading]);
  
  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const handleRequestChange = (newRequest: ItineraryRequest) => {
    setItineraryRequest(newRequest);
    if (itineraryResponse) {
      setItineraryResponse(null);
    }
  };

  const handleGenerate = async (request: ItineraryRequest) => {
    setIsLoading(true);
    setError(null);
    setItineraryResponse(null);
    setItineraryRequest(request);

    try {
      const response = await generateItinerary(request, language);
      setItineraryResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewItinerary = () => {
    setItineraryRequest(createInitialRequest());
    setItineraryResponse(null);
    setError(null);
    setLoadedItineraryId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveItinerary = () => {
    if (!itineraryRequest || !itineraryResponse) return;

    const loadedItinerary = loadedItineraryId ? savedItineraries.find(it => it.id === loadedItineraryId) : null;
    const isUpdateOperation = !!(loadedItinerary && itineraryRequest.name === loadedItinerary.request.name);

    if (isUpdateOperation && loadedItinerary) {
      const updatedItinerary: SavedItinerary = {
        id: loadedItinerary.id,
        request: itineraryRequest,
        response: itineraryResponse,
      };
      setSavedItineraries((prev) =>
        prev.map((it) => (it.id === loadedItinerary.id ? updatedItinerary : it))
      );
      setSuccessMessage(t.updateSuccess);
    } else {
      const newSavedItinerary: SavedItinerary = {
        id: Date.now(),
        request: itineraryRequest,
        response: itineraryResponse,
      };
      setSavedItineraries((prev) => [...prev, newSavedItinerary]);
      setSuccessMessage(t.saveSuccess);
    }
    
    handleNewItinerary();

    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleDeleteItinerary = (id: number) => {
    setSavedItineraries(prev => prev.filter(it => it.id !== id));
    if (loadedItineraryId === id) {
        handleNewItinerary();
    }
  };

  const handleViewItinerary = (saved: SavedItinerary) => {
    setItineraryRequest(saved.request);
    setItineraryResponse(saved.response);
    setLoadedItineraryId(saved.id);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadedItinerary = loadedItineraryId ? savedItineraries.find(it => it.id === loadedItineraryId) : null;
  const isUpdate = !!(loadedItinerary && itineraryRequest.name === loadedItinerary.request.name);
  const isSavedItineraryLoaded = !!loadedItineraryId || (!!itineraryResponse && !isLoading);
  const taglineParts = t.tagline.split('|');

  return (
    <div className="min-h-screen font-sans p-3 sm:p-4 md:p-8 text-[#5D0079]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-4">
            <div className="relative text-center flex flex-col items-center gap-2">
                <div className="absolute top-0 right-0 z-10">
                    <LanguageSwitcher currentLang={language} onLangChange={handleLangChange} />
                </div>
                <div className="flex items-center gap-4">
                    <LogoIcon />
                    <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white">JyVais</h1>
                </div>
                <p className="text-lg text-violet-200 max-w-xs sm:max-w-none mx-auto">
                  {taglineParts[0]}
                  {taglineParts.length > 1 && (
                      <>
                          <br className="sm:hidden" />
                          <span className="hidden sm:inline"> </span>
                          {taglineParts[1]}
                      </>
                  )}
                </p>
            </div>
        </header>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 text-green-800 border border-green-500/30 rounded-2xl text-center" role="alert">
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        <main className="space-y-6">
          <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] shadow-2xl shadow-violet-900/20 border border-white/30">
            <ItineraryForm
              request={itineraryRequest}
              onChange={handleRequestChange}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              onReset={handleNewItinerary}
              isSavedItineraryLoaded={isSavedItineraryLoaded}
              t={t}
            />
          </div>

          {(isLoading || error || itineraryResponse) && (
            <div ref={resultsRef} className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] shadow-2xl shadow-violet-900/20 border border-white/30">
              {isLoading && (
                <div className="flex flex-col items-center justify-center text-center text-[#5D0079]">
                  <SpinnerIcon className="h-12 w-12 animate-spin" />
                  <p className="mt-4 text-lg font-semibold">{t.loadingTitle}</p>
                  <p>{t.loadingSubtitle}</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/20 text-red-800 border border-red-500/30 rounded-2xl text-center">
                  <p className="font-bold">{t.generationErrorTitle}</p>
                  <p>{error}</p>
                </div>
              )}
              
              {itineraryResponse && !isLoading && (
                  <ItineraryDisplay 
                    response={itineraryResponse} 
                    request={itineraryRequest}
                    onSave={handleSaveItinerary}
                    isUpdate={isUpdate}
                    t={t}
                  />
              )}
            </div>
          )}
          
          {savedItineraries.length > 0 && (
              <SavedItineraries
                itineraries={savedItineraries}
                onView={handleViewItinerary}
                onDelete={handleDeleteItinerary}
                t={t}
              />
          )}
        </main>
        
        <footer className="text-center mt-8 text-sm text-violet-200/80">
            <p>{t.poweredBy}</p>
        </footer>
      </div>
    </div>
  );
}