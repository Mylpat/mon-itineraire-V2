import { GoogleGenAI } from "@google/genai";
import type { ItineraryRequest, ItineraryResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
  
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `Tu es un assistant de voyage expert. Génère un itinéraire détaillé et formaté en Markdown en te basant sur la demande de l'utilisateur et les données de Google Maps.
- Fournis des instructions claires, étape par étape, dans l'ordre.
- Si le transport est "Transport en commun", suggère les lignes pertinentes (bus, métro, etc.).
- Termine toujours par un résumé de la durée et de la distance estimées.`;

function buildUserQuery(request: ItineraryRequest): string {
    const start = request.parcours[0];
    const destination = request.parcours[request.parcours.length - 1];
    const steps = request.parcours.slice(1, -1).filter(s => s.trim() !== '');

    const stepsText = steps.length > 0
        ? ` en passant par les étapes suivantes dans cet ordre : ${steps.join(' ; ')}`
        : "";

    return `Je veux un itinéraire nommé "${request.name}" pour aller de "${start}" à "${destination}" en ${request.transportMode.toLowerCase()}${stepsText}.`;
}

export async function generateItinerary(request: ItineraryRequest): Promise<ItineraryResponse> {
    const userQuery = buildUserQuery(request);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userQuery,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleMaps: {} }],
                toolConfig: request.currentLocation ? {
                    retrievalConfig: {
                        latLng: {
                            latitude: request.currentLocation.latitude,
                            longitude: request.currentLocation.longitude,
                        }
                    }
                } : undefined,
            },
        });

        const description = response.text;
        
        if (!description) {
            throw new Error("L'API n'a retourné aucune description pour l'itinéraire.");
        }

        return { description, routeName: request.name };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("La génération de l'itinéraire a échoué. Veuillez vérifier votre connexion ou réessayer plus tard.");
    }
}