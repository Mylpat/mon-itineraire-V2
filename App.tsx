
import React, { useState, useEffect } from 'react';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import SavedItineraries from './components/SavedItineraries';
import LanguageSwitcher from './components/LanguageSwitcher';
import { generateItinerary } from './services/geminiService';
import { getTranslator, type Language } from './lib/i18n';
import type { ItineraryRequest, ItineraryResponse, SavedItinerary } from './types';
import { TransportMode } from './types';
import SpinnerIcon from './components/icons/SpinnerIcon';

const LOCAL_STORAGE_KEY = 'mon-itineraire-sauvegardes';
const LANGUAGE_STORAGE_KEY = 'jyvais-language';

const initialItineraryRequest: ItineraryRequest = {
  name: '',
  transportMode: TransportMode.CAR,
  parcours: ['', ''],
  currentLocation: null,
};

const SUPPORTED_LANGUAGES: Language[] = ['fr', 'en', 'de', 'it', 'nl'];

export default function App(): React.ReactElement {
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as Language)) {
      return storedLang as Language;
    }
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
      return browserLang as Language;
    }
    return 'en'; // Default to English
  });

  const t = getTranslator(language);
  
  const [itineraryRequest, setItineraryRequest] = useState<ItineraryRequest>(initialItineraryRequest);
  const [itineraryResponse, setItineraryResponse] = useState<ItineraryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadedItineraryId, setLoadedItineraryId] = useState<number | null>(null);

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

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };
  
  const handleRequestChange = (newRequest: ItineraryRequest) => {
    setItineraryRequest(newRequest);
    // If form is changed, the displayed result is no longer valid
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
    setItineraryRequest(initialItineraryRequest);
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
  const isSavedItineraryLoaded = !!loadedItineraryId;

  return (
    <div className="min-h-screen font-sans p-3 sm:p-4 md:p-8 text-slate-800">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
            <div className="grid grid-cols-3 items-center">
                <div className="flex-1"></div> {/* Spacer */}
                <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-blue-900">JyVais</h1>
                </div>
                <div className="flex-1 flex justify-end">
                    <LanguageSwitcher currentLang={language} onLangChange={handleLangChange} />
                </div>
            </div>
            <p className="text-lg text-slate-600">{t.tagline}</p>
        </header>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 text-green-800 border border-green-500/30 rounded-2xl text-center" role="alert">
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        <main className="space-y-8">
          <div className="bg-white/40 backdrop-blur-xl p-6 sm:p-8 rounded-[28px] shadow-2xl shadow-blue-500/10 border border-white/50">
            <ItineraryForm
              request={itineraryRequest}
              onChange={handleRequestChange}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              onReset={handleNewItinerary}
              isSavedItineraryLoaded={isSavedItineraryLoaded}
              t={t}
            />

            {isLoading && (
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <SpinnerIcon className="h-12 w-12 animate-spin text-slate-700" />
                <p className="mt-4 text-lg font-semibold">{t.loadingTitle}</p>
                <p className="text-slate-600">{t.loadingSubtitle}</p>
              </div>
            )}

            {error && (
              <div className="mt-8 p-4 bg-red-500/20 text-red-800 border border-red-500/30 rounded-2xl text-center">
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
          
          {savedItineraries.length > 0 && (
            <SavedItineraries
              itineraries={savedItineraries}
              onView={handleViewItinerary}
              onDelete={handleDeleteItinerary}
              t={t}
            />
          )}
        </main>
        
        <footer className="text-center mt-8 text-sm text-slate-500">
            <p>{t.poweredBy}</p>
        </footer>
      </div>
    </div>
  );
}