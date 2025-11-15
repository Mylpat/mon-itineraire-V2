import React from 'react';
import type { ItineraryRequest } from '../types';
import { TransportMode } from '../types';
import { translations } from '../lib/i18n';

import DepartIcon from './icons/DepartIcon';
import DestinationIcon from './icons/DestinationIcon';
import SendIcon from './icons/SendIcon';
import CarIcon from './icons/CarIcon';
import WalkIcon from './icons/WalkIcon';
import DragHandleIcon from './icons/DragHandleIcon';
import LocationIcon from './icons/LocationIcon';
import PlusIcon from './icons/PlusIcon';
import ReturnIcon from './icons/ReturnIcon';
import TrashIcon from './icons/TrashIcon';

interface ItineraryFormProps {
    request: ItineraryRequest;
    onChange: (request: ItineraryRequest) => void;
    onGenerate: (request: ItineraryRequest) => void;
    isLoading: boolean;
    onReset: () => void;
    isSavedItineraryLoaded: boolean;
    t: typeof translations.fr;
}

export default function ItineraryForm({ request, onChange, onGenerate, isLoading, onReset, isSavedItineraryLoaded, t }: ItineraryFormProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const { name, transportMode, parcours } = request;

  const handleParcoursChange = (index: number, value: string) => {
    const newParcours = parcours.map((p, i) => i === index ? { ...p, value } : p);
    onChange({ ...request, parcours: newParcours });
  };
  
  const handleAddStep = () => {
    const newParcours = [...parcours];
    newParcours.splice(parcours.length - 1, 0, { id: Date.now(), value: '' });
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
          const newText = t.currentLocationText(latitude.toFixed(6), longitude.toFixed(6));
          newParcours[0] = { ...newParcours[0], value: newText };
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
    if (!name || !parcours[0]?.value || !parcours[parcours.length - 1]?.value) {
      setError(t.formError);
      return;
    }
    setError(null);
    onGenerate(request);
  };

  const handlePrepareReturn = () => {
    const returnSuffixes = (Object.keys(translations) as Array<keyof typeof translations>)
      .map(lang => translations[lang].returnTripSuffix)
      .filter((value, index, self) => self.indexOf(value) === index)
      .join('|');
      
    const regex = new RegExp(` - (${returnSuffixes})$`);
    const baseName = name.replace(regex, '');
    
    const newName = `${baseName} - ${t.returnTripSuffix}`;
    
    const reversedParcours = [...parcours].reverse();
    
    onChange({ ...request, name: newName, parcours: reversedParcours });
  };
  
  const prepareReturnButton = isSavedItineraryLoaded ? (
      <button 
          type="button" 
          onClick={handlePrepareReturn} 
          className="inline-flex items-center gap-2 text-slate-800 font-semibold hover:text-slate-900 transition py-2 px-4 bg-amber-300/50 hover:bg-amber-400/80 rounded-lg shadow-sm"
      >
          <ReturnIcon className="h-5 w-5" />
          {t.prepareReturn}
      </button>
  ) : null;
  
  const baseInputClass = "w-full px-4 py-3 text-lg bg-white/50 border-0 rounded-xl focus:ring-2 focus:ring-violet-400 outline-none transition placeholder:text-slate-600/80 text-slate-900";

  const transportOptions = [
    { mode: TransportMode.CAR, icon: CarIcon, label: t.transportModes.CAR },
    { mode: TransportMode.PEDESTRIAN, icon: WalkIcon, label: t.transportModes.PEDESTRIAN },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="flex items-center gap-3">
            <LocationIcon className="h-6 w-6 text-slate-800" />
            <h2 className="text-2xl font-bold text-slate-800">{t.createItineraryTitle}</h2>
        </div>

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">{t.itineraryNameLabel}</label>
        <div className="relative">
            <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => onChange({ ...request, name: e.target.value })}
                placeholder={t.itineraryNamePlaceholder}
                className={`${baseInputClass} pr-10`}
                required
            />
            <div className="absolute inset-y-0 right-0 px-3 flex items-center pointer-events-none text-slate-500">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.532a9.001 9.001 0 010 16.936m0-16.936a9 9 0 000 16.936" /></svg>
            </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">{t.transportModeLabel}</label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {transportOptions.map(({ mode, icon: Icon, label }) => (
            <div key={mode}>
              <input 
                type="radio" 
                id={`transport-${mode}`} 
                name="transportMode" 
                value={mode}
                checked={transportMode === mode}
                onChange={() => onChange({ ...request, transportMode: mode })}
                className="sr-only peer"
              />
              <label 
                htmlFor={`transport-${mode}`}
                className="flex flex-col sm:flex-row items-center justify-center gap-2 p-2 text-slate-700 bg-white/50 rounded-xl border-2 border-transparent cursor-pointer transition-all peer-checked:border-violet-500 peer-checked:bg-violet-100/70 peer-checked:text-violet-800 peer-checked:shadow-md hover:bg-white/80"
              >
                <Icon className="h-6 w-6" />
                <span className="font-semibold text-sm sm:text-base">{label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
            <h3 className="block text-sm font-medium text-slate-700">{t.parcoursLabel}</h3>
            <p className="text-xs text-slate-600">{t.parcoursSublabel}</p>
        </div>
        {parcours.map((point, index) => {
          const isStart = index === 0;
          const isDestination = index === parcours.length - 1;
          const isStep = !isStart && !isDestination;

          let labelText = '';
          let placeholder = '';
          if (isStart) {
            labelText = t.parcoursStart;
            placeholder = t.parcoursStartPlaceholder;
          } else if (isDestination) {
            labelText = t.parcoursEnd;
            placeholder = t.parcoursEndPlaceholder;
          } else {
            labelText = `${t.parcoursStep} ${index}`;
            placeholder = `${t.parcoursStepPlaceholder} ${index}`;
          }

          return (
             <div
              key={point.id}
              className={`flex flex-col sm:flex-row sm:items-center sm:gap-2 transition-opacity ${draggedIndex === index ? 'opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="flex items-center gap-2 mb-1 sm:mb-0 sm:w-32 sm:shrink-0">
                  {isStart && <DepartIcon className="h-6 w-6" />}
                  {isDestination && <DestinationIcon className="h-6 w-6" />}
                  {isStep && <div className="w-6 h-6"></div>}
                  <label htmlFor={`parcours-${index}`} className="font-semibold text-slate-700">{labelText}</label>
              </div>

              <div className="flex items-center gap-2 flex-grow">
                  <div
                      className="p-1 cursor-move touch-none"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                  >
                      <DragHandleIcon className="h-6 w-6 text-slate-500 hover:text-slate-700" />
                  </div>
                  <div className="relative flex-grow">
                      <input
                          type="text"
                          id={`parcours-${index}`}
                          value={point.value}
                          onChange={(e) => handleParcoursChange(index, e.target.value)}
                          placeholder={placeholder}
                          className={`${baseInputClass} pr-12`}
                          required={isStart || isDestination}
                      />
                      {isStart && (
                          <button type="button" onClick={handleGeolocate} className="absolute inset-y-0 right-0 px-3 flex items-center text-purple-600 hover:text-purple-800 transition" title={t.useCurrentLocation}>
                              <SendIcon className="h-5 w-5" />
                          </button>
                      )}
                  </div>
                  {isStep ? (
                      <button type="button" onClick={() => handleRemoveStep(index)} className="p-1 text-red-500 hover:text-red-700 transition">
                          <TrashIcon className="h-5 w-5" />
                      </button>
                  ) : (
                      <div className="w-[28px] shrink-0"></div>
                  )}
              </div>
            </div>
          );
        })}
        <div className="pl-12 flex items-center flex-wrap gap-4">
          <button type="button" onClick={handleAddStep} className="inline-flex items-center gap-2 text-slate-800 font-semibold hover:text-slate-900 transition py-2 px-4 bg-white/50 hover:bg-white/80 rounded-lg shadow-sm">
            <PlusIcon className="h-5 w-5" /> {t.addStep}
          </button>
          {prepareReturnButton}
        </div>
      </div>
      
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <button type="submit" disabled={isLoading} className="flex-grow w-full flex justify-center items-center bg-white text-purple-700 font-bold py-4 px-4 rounded-xl hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100 shadow-lg">
          {isLoading ? t.generating : t.generate}
        </button>
        <button type="button" onClick={onReset} className="flex-shrink-0 bg-purple-200/20 text-white font-bold py-4 px-8 rounded-xl hover:bg-purple-200/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition">
          {t.reset}
        </button>
      </div>
    </form>
  );
}