import React from 'react';
import type { ItineraryRequest, ItineraryResponse } from '../types';
import { TransportMode } from '../types';
import { translations } from '../lib/i18n';

import DepartIcon from './icons/DepartIcon';
import DestinationIcon from './icons/DestinationIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import SaveIcon from './icons/SaveIcon';


interface ItineraryDisplayProps {
    response: ItineraryResponse;
    request: ItineraryRequest;
    onSave: () => void;
    isUpdate: boolean;
    t: typeof translations.fr;
}

export default function ItineraryDisplay({ response, request, onSave, isUpdate, t }: ItineraryDisplayProps) {
  const { routeName } = response;
  const { transportMode, parcours } = request;

  const parcoursValues = parcours.map(p => p.value);
  const start = parcoursValues[0] || '';
  const destination = parcoursValues[parcoursValues.length - 1] || '';
  const steps = parcoursValues.slice(1, -1).filter(s => s.trim() !== '');

  const waypoints = steps.join('|');

  const travelModeMapping: { [key in TransportMode]: string } = {
    [TransportMode.CAR]: 'driving',
    [TransportMode.PEDESTRIAN]: 'walking',
  };
  const travelmode = travelModeMapping[transportMode];

  const constructedMapUrl = new URL('https://www.google.com/maps/dir/');
  constructedMapUrl.searchParams.append('api', '1');
  constructedMapUrl.searchParams.append('origin', start);
  constructedMapUrl.searchParams.append('destination', destination);
  if (waypoints) {
    constructedMapUrl.searchParams.append('waypoints', waypoints);
  }
  constructedMapUrl.searchParams.append('travelmode', travelmode);
  const mapUrl = constructedMapUrl.toString();
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(mapUrl)}&size=150x150&bgcolor=ffffff&color=1e293b&qzone=1`;

  const mailtoLink = `mailto:?subject=${encodeURIComponent(t.mailtoSubject)} ${encodeURIComponent(routeName)}&body=${encodeURIComponent(t.mailtoBody(routeName, mapUrl))}`;

  return (
    <div className="mt-8 pt-8 border-t border-white/20">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-6 sm:mb-8">{t.yourItinerary} : {routeName}</h2>
      
      <div className="space-y-6">
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/40">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 border-b pb-2 border-white/50">{t.itineraryReadyTitle}</h3>
            
            <div className="my-4 space-y-3 text-slate-800">
                <div className="flex items-center gap-3">
                    <DepartIcon className="h-6 w-6 text-green-600 shrink-0" />
                    <div>
                        <span className="text-xs font-semibold uppercase text-slate-500">{t.parcoursStart}</span>
                        <p className="font-medium">{start}</p>
                    </div>
                </div>
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 pl-1">
                        <ArrowDownIcon className="h-5 w-5 text-slate-400 shrink-0" />
                        <div>
                            <span className="text-xs font-semibold uppercase text-slate-500">{`${t.parcoursStep} ${index + 1}`}</span>
                            <p className="font-medium">{step}</p>
                        </div>
                    </div>
                ))}
                <div className="flex items-center gap-3">
                    <DestinationIcon className="h-6 w-6 text-red-600 shrink-0" />
                    <div>
                        <span className="text-xs font-semibold uppercase text-slate-500">{t.parcoursEnd}</span>
                        <p className="font-medium">{destination}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/50 text-slate-700 space-y-4">
                <p>
                    {t.itineraryReadyBody1}
                </p>
                <p>
                    {t.itineraryReadyBody2} <span className="font-bold">"{t.openInMapsButton}"</span>, le <span className="font-bold">QR code</span> à scanner, ou le lien <span className="font-bold">envoyé par e-mail</span>.
                </p>
            </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/40">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center flex-shrink-0">
                    <img src={qrCodeUrl} alt="QR Code pour l'itinéraire" className="rounded-xl border-4 border-white shadow-sm mx-auto" />
                    <p className="text-sm mt-2 text-slate-600">{t.qrCodeText}</p>
                </div>
                <div className="w-full space-y-3">
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-blue-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-500 transition shadow-md">
                        {t.openInMapsButton}
                    </a>
                    <a href={mailtoLink} className="block w-full text-center bg-green-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-green-500 transition shadow-md">
                       {t.sendByEmail}
                    </a>
                    <button
                      onClick={onSave}
                      className="flex items-center justify-center gap-2 w-full text-center bg-slate-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-slate-500 transition shadow-md"
                    >
                      <SaveIcon className="h-5 w-5" />
                      {isUpdate ? t.updateItinerary : t.saveItinerary}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
