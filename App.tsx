import React, { useState, useEffect } from 'react';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import SavedItineraries from './components/SavedItineraries';
import { generateItinerary } from './services/geminiService';
import type { ItineraryRequest, ItineraryResponse, SavedItinerary } from './types';
import { TransportMode } from './types';
import SpinnerIcon from './components/icons/SpinnerIcon';

const LOCAL_STORAGE_KEY = 'mon-itineraire-sauvegardes';

const initialItineraryRequest: ItineraryRequest = {
  name: '',
  transportMode: TransportMode.CAR,
  parcours: ['', ''],
  currentLocation: null,
};

export default function App(): React.ReactElement {
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
      const response = await generateItinerary(request);
      setItineraryResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
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
      setSuccessMessage("Sauvegarde modifiée avec succès !");
    } else {
      const newSavedItinerary: SavedItinerary = {
        id: Date.now(),
        request: itineraryRequest,
        response: itineraryResponse,
      };
      setSavedItineraries((prev) => [...prev, newSavedItinerary]);
      setSuccessMessage("Itinéraire sauvegardé avec succès !");
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
    <div className="min-h-screen font-sans p-4 sm:p-6 md:p-8 text-blue-900">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-blue-900">JyVais</h1>
          <p className="mt-2 text-lg text-blue-800">
            Planifiez, visualisez et partagez vos trajets en toute simplicité.
          </p>
        </header>

        <main>
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg text-center" role="alert">
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          <div className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg">
            <ItineraryForm
              request={itineraryRequest}
              onChange={handleRequestChange}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              onReset={handleNewItinerary}
              isSavedItineraryLoaded={isSavedItineraryLoaded}
            />

            {isLoading && (
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <SpinnerIcon className="h-12 w-12 animate-spin text-blue-900" />
                <p className="mt-4 text-lg font-semibold">Génération de votre itinéraire en cours...</p>
                <p className="text-blue-800">L'IA prépare le meilleur chemin pour vous.</p>
              </div>
            )}

            {error && (
              <div className="mt-8 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg text-center">
                <p className="font-bold">Erreur de génération</p>
                <p>{error}</p>
              </div>
            )}

            {itineraryResponse && !isLoading && (
              <ItineraryDisplay 
                response={itineraryResponse} 
                request={itineraryRequest}
                onSave={handleSaveItinerary}
                isUpdate={isUpdate}
              />
            )}
          </div>

          {savedItineraries.length > 0 && (
            <SavedItineraries
              itineraries={savedItineraries}
              onView={handleViewItinerary}
              onDelete={handleDeleteItinerary}
            />
          )}
        </main>
        
        <footer className="text-center mt-8 text-sm text-blue-700/80">
            <p>Propulsé par Gemini & Google Maps</p>
        </footer>
      </div>
    </div>
  );
}