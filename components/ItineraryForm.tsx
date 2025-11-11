
import React from 'react';
import { TransportMode } from '../types';
import type { ItineraryRequest } from '../types';
import { translations } from '../lib/i18n';
import CarIcon from './icons/CarIcon';
import WalkIcon from './icons/WalkIcon';
import LocationIcon from './icons/LocationIcon';
import TrashIcon from './icons/TrashIcon';
import DragHandleIcon from './icons/DragHandleIcon';

interface ItineraryFormProps {
  request: ItineraryRequest;
  onChange: (request: ItineraryRequest) => void;
  onGenerate: (request: ItineraryRequest) => void;
  isLoading: boolean;
  onReset: () => void;
  isSavedItineraryLoaded: boolean;
  t: typeof translations.fr;
}

export default function ItineraryForm({ request, onChange, onGenerate, isLoading, onReset, isSavedItineraryLoaded, t }: ItineraryFormProps): React.ReactElement {
  const [error, setError] = React.useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    const newParcours = [...parcours];
    const [draggedItem] = newParcours.splice(draggedIndex, 1);
    newParcours.splice(dropIndex, 0, draggedItem);
    onChange({ ...request, parcours: newParcours });
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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
          alert(t.geolocateError);
        }
      );
    } else {
      alert(t.geolocateUnsupported);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !parcours[0] || !parcours[parcours.length - 1]) {
      setError(t.formError);
      return;
    }
    setError(null);
    onGenerate(request);
  };
  
  const handlePrepareReturn = () => {
    const returnSuffixes = [translations.fr.returnTripSuffix, translations.en.returnTripSuffix].join('|');
    const regex = new RegExp(` - (${returnSuffixes})$`);
    const baseName = name.replace(regex, '');
    const newName = `${baseName} - ${t.returnTripSuffix}`;
    const reversedParcours = [...parcours].reverse();
    onChange({ ...request, name: newName, parcours: reversedParcours });
  };

  const transportOptions = [
    { value: TransportMode.CAR, label: t.transportModes.CAR, icon: <CarIcon className="h-5 w-5" /> },
    { value: TransportMode.PEDESTRIAN, label: t.transportModes.PEDESTRIAN, icon: <WalkIcon className="h-5 w-5" /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-blue-800 mb-1">{t.itineraryNameLabel}</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => onChange({ ...request, name: e.target.value })}
            placeholder={t.itineraryNamePlaceholder}
            className="w-full px-4 py-1.5 bg-white/80 border border-sky-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />
        </div>
        <div>
          <label htmlFor="transportMode" className="block text-sm font-medium text-blue-800 mb-1">{t.transportModeLabel}</label>
          <div className="relative">
            <select
              id="transportMode"
              value={transportMode}
              onChange={(e) => onChange({ ...request, transportMode: e.target.value as TransportMode })}
              className="w-full appearance-none px-4 py-1.5 bg-white/80 border border-sky-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
        <h3 className="block text-sm font-medium text-blue-800">{t.parcoursLabel}</h3>
        {parcours.map((point, index) => {
          const isStart = index === 0;
          const isDestination = index === parcours.length - 1;
          const isStep = !isStart && !isDestination;

          let label = '';
          let placeholder = '';
          if (isStart) {
            label = t.parcoursStart;
            placeholder = t.parcoursStartPlaceholder;
          } else if (isDestination) {
            label = t.parcoursEnd;
            placeholder = t.parcoursEndPlaceholder;
          } else {
            label = `${t.parcoursStep} ${index}`;
            placeholder = `${t.parcoursStepPlaceholder} ${index}`;
          }

          return (
            <div 
              key={index} 
              className={`flex flex-col sm:flex-row sm:items-center sm:space-x-2 transition-opacity ${draggedIndex === index ? 'opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <label htmlFor={`parcours-${index}`} className="font-normal text-xs text-gray-600 sm:w-24 sm:text-right shrink-0 mb-1 sm:mb-0">{label}</label>
              <div className="flex items-center space-x-1 flex-grow">
                <div 
                  className="p-1 cursor-move touch-none"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <DragHandleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600"/>
                </div>
                <div className="relative flex-grow">
                  <input
                    type="text"
                    id={`parcours-${index}`}
                    value={point}
                    onChange={(e) => handleParcoursChange(index, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-1.5 bg-white/80 border border-sky-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10"
                    required={isStart || isDestination}
                  />
                  {isStart && (
                    <button type="button" onClick={handleGeolocate} className="absolute inset-y-0 right-0 px-3 flex items-center text-blue-600 hover:text-blue-800 transition" title={t.useCurrentLocation}>
                      <LocationIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {isStep && (
                  <button type="button" onClick={() => handleRemoveStep(index)} className="p-1 text-red-500 hover:text-red-700 transition"><TrashIcon className="h-5 w-5" /></button>
                )}
              </div>
            </div>
          );
        })}
        <div className="sm:pl-28 flex items-center gap-4">
          <button type="button" onClick={handleAddStep} className="text-blue-800 font-semibold hover:text-blue-900 transition py-2 px-3 bg-sky-200 hover:bg-sky-300 rounded-lg">
            <span>{t.addStep}</span>
          </button>
          {isSavedItineraryLoaded && (
            <button 
                type="button" 
                onClick={handlePrepareReturn} 
                className="text-orange-800 font-semibold hover:text-orange-900 transition py-2 px-3 bg-orange-200 hover:bg-orange-300 rounded-lg"
            >
                <span>{t.prepareReturn}</span>
            </button>
        )}
        </div>
      </div>
      
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button type="submit" disabled={isLoading} className="flex-grow w-full flex justify-center items-center bg-blue-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100">
          {isLoading ? t.generating : t.generate}
        </button>
        <button type="button" onClick={onReset} className="flex-shrink-0 bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition">
          {t.reset}
        </button>
      </div>
    </form>
  );
}