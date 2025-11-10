import React from 'react';
import type { ItineraryRequest, ItineraryResponse } from '../types';
import { translations } from '../lib/i18n';
import { TransportMode } from '../types';
import SaveIcon from './icons/SaveIcon';

interface ItineraryDisplayProps {
  response: ItineraryResponse;
  request: ItineraryRequest;
  onSave: () => void;
  isUpdate: boolean;
  t: typeof translations.fr;
}

export default function ItineraryDisplay({ response, request, onSave, isUpdate, t }: ItineraryDisplayProps): React.ReactElement {
  const { routeName } = response;
  const { transportMode, parcours } = request;

  const start = parcours[0] || '';
  const destination = parcours[parcours.length - 1] || '';
  const steps = parcours.slice(1, -1).filter(s => s.trim() !== '');

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
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(mapUrl)}&size=150x150&bgcolor=f0f9ff`;

  const mailtoLink = `mailto:?subject=${encodeURIComponent(t.mailtoSubject)} ${encodeURIComponent(routeName)}&body=${encodeURIComponent(t.mailtoBody(routeName, mapUrl))}`;

  return (
    <div className="mt-8 pt-8 border-t border-sky-300 space-y-8">
      <h2 className="text-3xl font-bold text-center">{t.yourItinerary} : {routeName}</h2>
      
      <div className="space-y-8">
        <div className="bg-white/80 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-sky-200">{t.itineraryReadyTitle}</h3>
            <div className="mt-4 text-blue-800 space-y-4">
                <p className="text-lg">
                    {t.itineraryReadyBody1}
                </p>
                <p className="text-md">
                    {t.itineraryReadyBody2} <span className="font-bold">"{t.openInMapsButton}"</span>, le <span className="font-bold">QR code</span> à scanner, ou le lien <span className="font-bold">envoyé par e-mail</span>.
                </p>
            </div>
        </div>
        
        <div className="bg-white/80 p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center flex-shrink-0">
                    <img src={qrCodeUrl} alt="QR Code pour l'itinéraire" className="rounded-lg border-4 border-white shadow-sm mx-auto" />
                    <p className="text-sm mt-2 text-blue-800">{t.qrCodeText}</p>
                </div>
                <div className="w-full space-y-3">
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                        {t.openInMapsButton}
                    </a>
                    <a href={mailtoLink} className="block w-full text-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                       {t.sendByEmail}
                    </a>
                    <button
                      onClick={onSave}
                      className="flex items-center justify-center gap-2 w-full text-center bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition"
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