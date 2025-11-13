
import { GoogleGenAI } from "@google/genai";
import type { ItineraryRequest, ItineraryResponse } from '../types';
import { getTranslator, type Language } from "../lib/i18n";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
  
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function buildUserQuery(request: ItineraryRequest, lang: Language): string {
    const t = getTranslator(lang);
    const parcoursValues = request.parcours.map(p => p.value);
    const start = parcoursValues[0];
    const destination = parcoursValues[parcoursValues.length - 1];
    const steps = parcoursValues.slice(1, -1).filter(s => s.trim() !== '');

    const transportModeText = t.transportModes[request.transportMode].toLowerCase();

    const stepsText = steps.length > 0
        ? ` ${t.geminiUserQueryVia} ${steps.join(' ; ')}`
        : "";

    return `${t.geminiUserQueryIntro} "${request.name}" ${t.geminiUserQueryFrom} "${start}" ${t.geminiUserQueryTo} "${destination}" ${t.geminiUserQueryWithTransport} ${transportModeText}${stepsText}.`;
}

export async function generateItinerary(request: ItineraryRequest, lang: Language): Promise<ItineraryResponse> {
    const t = getTranslator(lang);
    const userQuery = buildUserQuery(request, lang);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userQuery,
            config: {
                systemInstruction: t.geminiSystemInstruction,
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
            throw new Error("The API returned no description for the itinerary.");
        }

        return { description, routeName: request.name };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error(t.geminiApiError);
    }
}
