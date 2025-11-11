
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
  
  const baseInputClass = "w-full px-4 py-2 bg-slate-100/50 border border-white/50 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition placeholder:text-slate-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">{t.itineraryNameLabel}</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => onChange({ ...request, name: e.target.value })}
            placeholder={t.itineraryNamePlaceholder}
            className={baseInputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="transportMode" className="block text-sm font-medium text-slate-700 mb-2">{t.transportModeLabel}</label>
          <div className="relative">
            <select
              id="transportMode"
              value={transportMode}
              onChange={(e) => onChange({ ...request, transportMode: e.target.value as TransportMode })}
              className={`${baseInputClass} appearance-none`}
            >
              {transportOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600">
               {transportOptions.find(o => o.value === transportMode)?.icon}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="block text-sm font-medium text-slate-700">{t.parcoursLabel}</h3>
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
              <label htmlFor={`parcours-${index}`} className="font-normal text-xs text-slate-600 sm:w-24 sm:text-right shrink-0 mb-1 sm:mb-0">{label}</label>
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
                    className={`${baseInputClass} pr-10`}
                    required={isStart || isDestination}
                  />
                  {isStart && (
                    <button type="button" onClick={handleGeolocate} className="absolute inset-y-0 right-0 px-3 flex items-center text-sky-600 hover:text-sky-800 transition" title={t.useCurrentLocation}>
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
        <div className="sm:pl-[124px] flex items-center gap-4 pt-2">
          <button type="button" onClick={handleAddStep} className="text-slate-800 font-semibold hover:text-slate-900 transition py-2 px-3 bg-sky-100 hover:bg-sky-200 rounded-lg border border-sky-200 shadow-sm">
            {t.addStep}
          </button>
          {isSavedItineraryLoaded && (
            <button 
                type="button" 
                onClick={handlePrepareReturn} 
                className="text-slate-800 font-semibold hover:text-slate-900 transition py-2 px-3 bg-orange-100 hover:bg-orange-200 rounded-lg border border-orange-200 shadow-sm"
            >
                {t.prepareReturn}
            </button>
        )}
        </div>
      </div>
      
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button type="submit" disabled={isLoading} className="flex-grow w-full flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100 shadow-lg shadow-blue-500/30">
          {isLoading ? t.generating : t.generate}
        </button>
        <button type="button" onClick={onReset} className="flex-shrink-0 bg-slate-200/80 text-slate-800 font-bold py-3 px-6 rounded-xl hover:bg-slate-300/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition">
          {t.reset}
        </button>
      </div>
    </form>
  );
}