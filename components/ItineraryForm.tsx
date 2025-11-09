import React, { useCallback } from 'react';
import { TransportMode } from '../types';
import type { ItineraryRequest } from '../types';
import CarIcon from './icons/CarIcon';
import WalkIcon from './icons/WalkIcon';
import BusIcon from './icons/BusIcon';
import LocationIcon from './icons/LocationIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ReturnIcon from './icons/ReturnIcon';

interface ItineraryFormProps {
  request: ItineraryRequest;
  onChange: (request: ItineraryRequest) => void;
  onGenerate: (request: ItineraryRequest) => void;
  isLoading: boolean;
  onReset: () => void;
  isSavedItineraryLoaded: boolean;
}

export default function ItineraryForm({ request, onChange, onGenerate, isLoading, onReset, isSavedItineraryLoaded }: ItineraryFormProps): React.ReactElement {
  const [error, setError] = React.useState<string | null>(null);
  const { name, transportMode, parcours, currentLocation } = request;

  const handleParcoursChange = (index: number, value: string) => {
    const newParcours = [...parcours];
    newParcours[index] = value;
    onChange({ ...request, parcours: newParcours });
  };
  
  const handleAddStep = () => {
    const newParcours = [...parcours];
    newParcours.splice(parcours.length - 1, 0, '');
    onChange({ ...request, parcours: newParcours });
  };

  const handleRemoveStep = (index: number) => {
    if (parcours.length <= 2) return;
    const newParcours = parcours.filter((_, i) => i !== index);
    onChange({ ...request, parcours: newParcours });
  };
    
  const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
    const newParcours = [...parcours];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newParcours.length) return;
    [newParcours[index], newParcours[targetIndex]] = [newParcours[targetIndex], newParcours[index]];
    onChange({ ...request, parcours: newParcours });
  }, [parcours, onChange, request]);


  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newParcours = [...parcours];
          newParcours[0] = `Ma position actuelle (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          onChange({ ...request, parcours: newParcours, currentLocation: { latitude, longitude } });
        },
        () => {
          alert("Impossible d'obtenir la position. Veuillez l'autoriser et réessayer, ou l'entrer manuellement.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !parcours[0] || !parcours[parcours.length - 1]) {
      setError('Veuillez remplir tous les champs obligatoires : nom, départ et destination.');
      return;
    }
    setError(null);
    onGenerate(request);
  };
  
  const handlePrepareReturn = () => {
    const baseName = name.replace(/ - Retour$/, '').replace(/^Retour : /, '');
    const newName = `${baseName} - Retour`;
    const reversedParcours = [...parcours].reverse();
    onChange({ ...request, name: newName, parcours: reversedParcours });
  };

  const transportOptions = [
    { value: TransportMode.CAR, label: 'Voiture', icon: <CarIcon className="h-5 w-5" /> },
    { value: TransportMode.PEDESTRIAN, label: 'Piéton', icon: <WalkIcon className="h-5 w-5" /> },
    { value: TransportMode.TRANSIT, label: 'Transport en commun', icon: <BusIcon className="h-5 w-5" /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-blue-800 mb-1">Nom de l'itinéraire *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => onChange({ ...request, name: e.target.value })}
            placeholder="Ex: Vacances en Bretagne"
            className="w-full px-4 py-2 bg-white/80 border border-sky-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />
        </div>
        <div>
          <label htmlFor="transportMode" className="block text-sm font-medium text-blue-800 mb-1">Moyen de transport *</label>
          <div className="relative">
            <select
              id="transportMode"
              value={transportMode}
              onChange={(e) => onChange({ ...request, transportMode: e.target.value as TransportMode })}
              className="w-full appearance-none px-4 py-2 bg-white/80 border border-sky-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              {transportOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-800">
               {transportOptions.find(o => o.value === transportMode)?.icon}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-md font-medium text-blue-800">Parcours *</h3>
        {parcours.map((point, index) => {
          const isStart = index === 0;
          const isDestination = index === parcours.length - 1;
          const isStep = !isStart && !isDestination;

          let label = '';
          let placeholder = '';
          if (isStart) {
            label = 'Départ';
            placeholder = 'Adresse de départ';
          } else if (isDestination) {
            label = 'Arrivée';
            placeholder = 'Adresse de destination';
          } else {
            label = `Étape ${index}`;
            placeholder = `Adresse de l'étape ${index}`;
          }

          return (
            <div key={index} className="flex items-center space-x-2">
              <label htmlFor={`parcours-${index}`} className="font-semibold text-gray-600 w-20 text-right shrink-0">{label}</label>
              <div className="relative flex-grow">
                <input
                  type="text"
                  id={`parcours-${index}`}
                  value={point}
                  onChange={(e) => handleParcoursChange(index, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-2 bg-white/80 border border-sky-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10"
                  required={isStart || isDestination}
                />
                {isStart && (
                  <button type="button" onClick={handleGeolocate} className="absolute inset-y-0 right-0 px-3 flex items-center text-blue-600 hover:text-blue-800 transition" title="Utiliser ma position actuelle">
                    <LocationIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button type="button" onClick={() => moveStep(index, 'up')} disabled={isStart} className="p-1 text-blue-600 disabled:text-gray-300 hover:text-blue-800 transition"><ArrowUpIcon className="h-5 w-5"/></button>
              <button type="button" onClick={() => moveStep(index, 'down')} disabled={isDestination} className="p-1 text-blue-600 disabled:text-gray-300 hover:text-blue-800 transition"><ArrowDownIcon className="h-5 w-5"/></button>
              {isStep && (
                <button type="button" onClick={() => handleRemoveStep(index)} className="p-1 text-red-500 hover:text-red-700 transition"><TrashIcon className="h-5 w-5" /></button>
              )}
            </div>
          );
        })}
        <div className="pl-24 flex items-center gap-4">
          <button type="button" onClick={handleAddStep} className="flex items-center space-x-2 text-blue-800 font-semibold hover:text-blue-900 transition py-2 px-3 bg-sky-200 hover:bg-sky-300 rounded-lg">
            <PlusIcon className="h-5 w-5" />
            <span>Ajouter une étape</span>
          </button>
          {isSavedItineraryLoaded && (
            <button 
                type="button" 
                onClick={handlePrepareReturn} 
                className="flex items-center space-x-2 text-orange-800 font-semibold hover:text-orange-900 transition py-2 px-3 bg-orange-200 hover:bg-orange-300 rounded-lg"
            >
                <ReturnIcon className="h-5 w-5" />
                <span>Préparer le retour</span>
            </button>
        )}
        </div>
      </div>
      
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button type="submit" disabled={isLoading} className="flex-grow w-full flex justify-center items-center bg-blue-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100">
          {isLoading ? 'Génération...' : "Générer l'itinéraire"}
        </button>
        <button type="button" onClick={onReset} className="flex-shrink-0 bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition">
          Réinitialiser
        </button>
      </div>
    </form>
  );
}