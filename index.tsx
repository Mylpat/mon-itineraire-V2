
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// ==========================================================================================
// FILE: types.ts
// ==========================================================================================
enum TransportMode {
  CAR = 'CAR',
  PEDESTRIAN = 'PEDESTRIAN',
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface ItineraryRequest {
  name: string;
  transportMode: TransportMode;
  parcours: { id: number; value: string }[];
  currentLocation: Coordinates | null;
}

interface ItineraryResponse {
  description: string;
  routeName: string;
}

interface SavedItinerary {
  id: number;
  request: ItineraryRequest;
  response: ItineraryResponse;
}

// ==========================================================================================
// FILE: lib/i18n.ts
// ==========================================================================================
const translations = {
  fr: {
    tagline: "Créez vos itinéraires Google Maps|en toute simplicité",
    saveSuccess: "Itinéraire sauvegardé avec succès !",
    updateSuccess: "Sauvegarde modifiée avec succès !",
    itineraryNameLabel: "Nom de l'itinéraire",
    itineraryNamePlaceholder: "Ex: Voyage à Paris",
    transportModeLabel: "Moyen de transport",
    transportModes: { CAR: 'Voiture', PEDESTRIAN: 'Piéton' },
    parcoursLabel: "Itinéraire (départ, étapes, destination)",
    parcoursSublabel: "Utilisez les poignées (⋮⋮) pour réorganiser tous les points de l'itinéraire",
    parcoursStart: "Départ",
    parcoursStartPlaceholder: "Ex: Paris, France",
    parcoursEnd: "Destination",
    parcoursEndPlaceholder: "Ex: Lyon, France",
    parcoursStep: "Étape",
    parcoursStepPlaceholder: "Adresse de l'étape",
    useCurrentLocation: "Utiliser ma position actuelle",
    currentLocationText: (lat: string, lon: string) => `${lat}, ${lon}`,
    geolocateError: "Impossible d'obtenir la position. Veuillez l'autoriser et réessayer, ou l'entrer manuellement.",
    geolocateUnsupported: "La géolocalisation n'est pas supportée par votre navigateur.",
    formError: "Veuillez remplir tous les champs obligatoires : nom, départ et destination.",
    addStep: "Ajouter une étape intermédiaire",
    prepareReturn: "Préparer le retour",
    returnTripSuffix: "Retour",
    generate: "Générer l'itinéraire",
    generating: "Génération...",
    reset: "Réinitialiser",
    loadingTitle: "Génération de votre itinéraire en cours...",
    loadingSubtitle: "L'IA prépare le meilleur chemin pour vous.",
    generationErrorTitle: "Erreur de génération",
    yourItinerary: "Votre itinéraire",
    itineraryReadyTitle: "Votre itinéraire est prêt !",
    itineraryReadyBody1: "Pour consulter les instructions détaillées et naviguer, veuillez ouvrir l'itinéraire directement dans Google Maps.",
    itineraryReadyBody2: "Vous pouvez utiliser le bouton",
    openInMapsButton: "Ouvrir dans Google Maps",
    qrCodeText: "Flashez pour ouvrir sur votre mobile.",
    sendByEmail: "Envoyer par e-mail",
    mailtoSubject: "Itinéraire :",
    mailtoBody: (routeName: string, mapUrl: string) => `Bonjour,\n\nVoici le lien vers l'itinéraire "${routeName}":\n${mapUrl}`,
    saveItinerary: "Sauvegarder l'itinéraire",
    updateItinerary: "Modifier sauvegarde",
    savedItinerariesTitle: "Mes itinéraires sauvegardés",
    searchPlaceholder: "Rechercher...",
    sortByName: "Trier par nom",
    noItinerariesFound: "Aucun itinéraire trouvé.",
    stepSingular: "étape",
    stepPlural: "étapes",
    viewAndLoad: "Voir et charger",
    delete: "Supprimer",
    previousPage: "Précédent",
    nextPage: "Suivant",
    page: "Page",
    of: "sur",
    poweredBy: "Propulsé par Gemini & Google Maps",
    geminiSystemInstruction: "Tu es un assistant de voyage dont le seul rôle est de traiter une demande d'itinéraire en utilisant l'outil Google Maps. NE GÉNÈRE AUCUN TEXTE en réponse. Ta réponse doit être vide. L'interface utilisateur affichera les messages nécessaires.",
    geminiUserQueryIntro: "Je veux un itinéraire nommé",
    geminiUserQueryFrom: "pour aller de",
    geminiUserQueryTo: "à",
    geminiUserQueryWithTransport: "en",
    geminiUserQueryVia: "en passant par les étapes suivantes dans cet ordre :",
    geminiApiError: "La génération de l'itinéraire a échoué. Veuillez vérifier votre connexion ou réessayer plus tard.",
    createItineraryTitle: "Créer un itinéraire",
  },
  en: {
    tagline: "Create your Google Maps routes|with ease.",
    saveSuccess: "Itinerary saved successfully!",
    updateSuccess: "Save updated successfully!",
    itineraryNameLabel: "Itinerary Name",
    itineraryNamePlaceholder: "Ex: Trip to Paris",
    transportModeLabel: "Means of transport",
    transportModes: { CAR: 'Car', PEDESTRIAN: 'Pedestrian' },
    parcoursLabel: "Itinerary (start, steps, destination)",
    parcoursSublabel: "Use the handles (⋮⋮) to reorganize all points of the itinerary",
    parcoursStart: "Start",
    parcoursStartPlaceholder: "Ex: Paris, France",
    parcoursEnd: "Destination",
    parcoursEndPlaceholder: "Ex: Lyon, France",
    parcoursStep: "Step",
    parcoursStepPlaceholder: "Address of step",
    useCurrentLocation: "Use my current location",
    currentLocationText: (lat: string, lon: string) => `${lat}, ${lon}`,
    geolocateError: "Could not get location. Please authorize it and try again, or enter it manually.",
    geolocateUnsupported: "Geolocation is not supported by your browser.",
    formError: "Please fill in all required fields: name, start, and destination.",
    addStep: "Add an intermediate step",
    prepareReturn: "Prepare return trip",
    returnTripSuffix: "Return",
    generate: "Generate Itinerary",
    generating: "Generating...",
    reset: "Reset",
    loadingTitle: "Generating your itinerary...",
    loadingSubtitle: "The AI is preparing the best path for you.",
    generationErrorTitle: "Generation Error",
    yourItinerary: "Your itinerary",
    itineraryReadyTitle: "Your itinerary is ready!",
    itineraryReadyBody1: "To view detailed instructions and navigate, please open the itinerary directly in Google Maps.",
    itineraryReadyBody2: "You can use the",
    openInMapsButton: "Open in Google Maps",
    qrCodeText: "Scan to open on your mobile.",
    sendByEmail: "Send by e-mail",
    mailtoSubject: "Itinerary:",
    mailtoBody: (routeName: string, mapUrl: string) => `Hello,\n\nHere is the link for the itinerary "${routeName}":\n${mapUrl}`,
    saveItinerary: "Save Itinerary",
    updateItinerary: "Update Save",
    savedItinerariesTitle: "My saved itineraries",
    searchPlaceholder: "Search...",
    sortByName: "Sort by name",
    noItinerariesFound: "No itineraries found.",
    stepSingular: "step",
    stepPlural: "steps",
    viewAndLoad: "View and load",
    delete: "Delete",
    previousPage: "Previous",
    nextPage: "Next",
    page: "Page",
    of: "of",
    poweredBy: "Powered by Gemini & Google Maps",
    geminiSystemInstruction: "You are a travel assistant whose only role is to process an itinerary request using the Google Maps tool. DO NOT GENERATE ANY TEXT in response. Your response must be empty. The user interface will display the necessary messages.",
    geminiUserQueryIntro: "I want an itinerary named",
    geminiUserQueryFrom: "to go from",
    geminiUserQueryTo: "to",
    geminiUserQueryWithTransport: "by",
    geminiUserQueryVia: "passing through the following steps in this order:",
    geminiApiError: "Itinerary generation failed. Please check your connection or try again later.",
    createItineraryTitle: "Create an itinerary",
  },
  de: {
    tagline: "Erstellen Sie Ihre Google Maps-Routen ganz einfach.",
    saveSuccess: "Route erfolgreich gespeichert!",
    updateSuccess: "Speicherung erfolgreich aktualisiert!",
    itineraryNameLabel: "Name der Route",
    itineraryNamePlaceholder: "Bsp: Reise nach Paris",
    transportModeLabel: "Transportmittel",
    transportModes: { CAR: 'Auto', PEDESTRIAN: 'Fußgänger' },
    parcoursLabel: "Route (Start, Etappen, Ziel)",
    parcoursSublabel: "Verwenden Sie die Griffe (⋮⋮), um alle Punkte der Route neu anzuordnen",
    parcoursStart: "Start",
    parcoursStartPlaceholder: "Bsp: Paris, Frankreich",
    parcoursEnd: "Ziel",
    parcoursEndPlaceholder: "Bsp: Lyon, Frankreich",
    parcoursStep: "Etappe",
    parcoursStepPlaceholder: "Adresse der Etappe",
    useCurrentLocation: "Meinen aktuellen Standort verwenden",
    currentLocationText: (lat: string, lon: string) => `${lat}, ${lon}`,
    geolocateError: "Standort konnte nicht abgerufen werden. Bitte genehmigen Sie ihn und versuchen Sie es erneut, oder geben Sie ihn manuell ein.",
    geolocateUnsupported: "Geolokalisierung wird von Ihrem Browser nicht unterstützt.",
    formError: "Bitte füllen Sie alle erforderlichen Felder aus: Name, Start und Ziel.",
    addStep: "Zwischenstopp hinzufügen",
    prepareReturn: "Rückfahrt vorbereiten",
    returnTripSuffix: "Rückfahrt",
    generate: "Route generieren",
    generating: "Generierung...",
    reset: "Zurücksetzen",
    loadingTitle: "Ihre Route wird generiert...",
    loadingSubtitle: "Die KI bereitet den besten Weg für Sie vor.",
    generationErrorTitle: "Fehler bei der Generierung",
    yourItinerary: "Ihre Route",
    itineraryReadyTitle: "Ihre Route ist fertig!",
    itineraryReadyBody1: "Um detaillierte Anweisungen anzuzeigen und zu navigieren, öffnen Sie die Route bitte direkt in Google Maps.",
    itineraryReadyBody2: "Sie können die Schaltfläche verwenden",
    openInMapsButton: "In Google Maps öffnen",
    qrCodeText: "Scannen, um auf Ihrem Handy zu öffnen.",
    sendByEmail: "Per E-Mail senden",
    mailtoSubject: "Route:",
    mailtoBody: (routeName: string, mapUrl: string) => `Hallo,\n\nhier ist der Link zur Route "${routeName}":\n${mapUrl}`,
    saveItinerary: "Route speichern",
    updateItinerary: "Speicherung aktualisieren",
    savedItinerariesTitle: "Meine gespeicherten Routen",
    searchPlaceholder: "Suchen...",
    sortByName: "Nach Name sortieren",
    noItinerariesFound: "Keine Routen gefunden.",
    stepSingular: "Etappe",
    stepPlural: "Etappen",
    viewAndLoad: "Ansehen und laden",
    delete: "Löschen",
    previousPage: "Zurück",
    nextPage: "Weiter",
    page: "Seite",
    of: "von",
    poweredBy: "Unterstützt von Gemini & Google Maps",
    geminiSystemInstruction: "Du bist ein Reiseassistent, dessen einzige Aufgabe es ist, eine Routenanfrage mit dem Google Maps-Tool zu bearbeiten. GENERIERE KEINEN TEXT als Antwort. Deine Antwort muss leer sein. Die Benutzeroberfläche zeigt die erforderlichen Nachrichten an.",
    geminiUserQueryIntro: "Ich möchte eine Route namens",
    geminiUserQueryFrom: "um von",
    geminiUserQueryTo: "nach",
    geminiUserQueryWithTransport: "mit",
    geminiUserQueryVia: "über die folgenden Etappen in dieser Reihenfolge:",
    geminiApiError: "Die Generierung der Route ist fehlgeschlagen. Bitte überprüfen Sie Ihre Verbindung oder versuchen Sie es später erneut.",
    createItineraryTitle: "Route erstellen",
  },
  it: {
    tagline: "Crea i tuoi percorsi su Google Maps con facilità.",
    saveSuccess: "Itinerario salvato con successo!",
    updateSuccess: "Salvataggio aggiornato con successo!",
    itineraryNameLabel: "Nome itinerario",
    itineraryNamePlaceholder: "Es: Viaggio a Parigi",
    transportModeLabel: "Mezzo di trasporto",
    transportModes: { CAR: 'Auto', PEDESTRIAN: 'A piedi' },
    parcoursLabel: "Itinerario (partenza, tappe, destinazione)",
    parcoursSublabel: "Usa le maniglie (⋮⋮) per riorganizzare tutti i punti dell'itinerario",
    parcoursStart: "Partenza",
    parcoursStartPlaceholder: "Es: Parigi, Francia",
    parcoursEnd: "Destinazione",
    parcoursEndPlaceholder: "Es: Lione, Francia",
    parcoursStep: "Tappa",
    parcoursStepPlaceholder: "Indirizzo della tappa",
    useCurrentLocation: "Usa la mia posizione attuale",
    currentLocationText: (lat: string, lon: string) => `${lat}, ${lon}`,
    geolocateError: "Impossibile ottenere la posizione. Si prega di autorizzarla e riprovare, o inserirla manualmente.",
    geolocateUnsupported: "La geolocalizzazione non è supportata dal tuo browser.",
    formError: "Si prega di compilare tutti i campi obbligatori: nome, partenza e destinazione.",
    addStep: "Aggiungi una tappa intermedia",
    prepareReturn: "Prepara il ritorno",
    returnTripSuffix: "Ritorno",
    generate: "Genera Itinerario",
    generating: "Generazione...",
    reset: "Reimposta",
    loadingTitle: "Generazione del tuo itinerario in corso...",
    loadingSubtitle: "L'IA sta preparando il percorso migliore per te.",
    generationErrorTitle: "Errore di generazione",
    yourItinerary: "Il tuo itinerario",
    itineraryReadyTitle: "Il tuo itinerario è pronto!",
    itineraryReadyBody1: "Per visualizzare le istruzioni dettagliate e navigare, apri l'itinerario direttamente in Google Maps.",
    itineraryReadyBody2: "Puoi usare il pulsante",
    openInMapsButton: "Apri in Google Maps",
    qrCodeText: "Scansiona per aprire sul tuo cellulare.",
    sendByEmail: "Invia per e-mail",
    mailtoSubject: "Itinerario:",
    mailtoBody: (routeName: string, mapUrl: string) => `Ciao,\n\nEcco il link per l'itinerario "${routeName}":\n${mapUrl}`,
    saveItinerary: "Salva Itinerario",
    updateItinerary: "Aggiorna Salvataggio",
    savedItinerariesTitle: "I miei itinerari salvati",
    searchPlaceholder: "Cerca...",
    sortByName: "Ordina per nome",
    noItinerariesFound: "Nessun itinerario trovato.",
    stepSingular: "tappa",
    stepPlural: "tappe",
    viewAndLoad: "Visualizza e carica",
    delete: "Elimina",
    previousPage: "Precedente",
    nextPage: "Successivo",
    page: "Pagina",
    of: "di",
    poweredBy: "Realizzato con Gemini & Google Maps",
    geminiSystemInstruction: "Sei un assistente di viaggio il cui unico ruolo è elaborare una richiesta di itinerario utilizzando lo strumento di Google Maps. NON GENERARE ALCUN TESTO in risposta. La tua risposta deve essere vuota. L'interfaccia utente visualizzerà i messaggi necessari.",
    geminiUserQueryIntro: "Voglio un itinerario chiamato",
    geminiUserQueryFrom: "per andare da",
    geminiUserQueryTo: "a",
    geminiUserQueryWithTransport: "con",
    geminiUserQueryVia: "passando per le seguenti tappe in questo ordine:",
    geminiApiError: "La generazione dell'itinerario non è riuscita. Controlla la tua connessione o riprova più tardi.",
    createItineraryTitle: "Crea un itinerario",
  },
  nl: {
    tagline: "Maak eenvoudig uw|Google Maps-routes.",
    saveSuccess: "Route succesvol opgeslagen!",
    updateSuccess: "Opslag succesvol bijgewerkt!",
    itineraryNameLabel: "Naam van de route",
    itineraryNamePlaceholder: "Bijv: Reis naar Parijs",
    transportModeLabel: "Vervoermiddel",
    transportModes: { CAR: 'Auto', PEDESTRIAN: 'Te voet' },
    parcoursLabel: "Route (start, etappes, bestemming)",
    parcoursSublabel: "Gebruik de handvatten (⋮⋮) om alle punten van de route te reorganiseren",
    parcoursStart: "Start",
    parcoursStartPlaceholder: "Bijv: Parijs, Frankrijk",
    parcoursEnd: "Bestemming",
    parcoursEndPlaceholder: "Bijv: Lyon, Frankrijk",
    parcoursStep: "Etappe",
    parcoursStepPlaceholder: "Adres van de etappe",
    useCurrentLocation: "Mijn huidige locatie gebruiken",
    currentLocationText: (lat: string, lon: string) => `${lat}, ${lon}`,
    geolocateError: "Kon de locatie niet ophalen. Sta dit toe en probeer het opnieuw, of voer het handmatig in.",
    geolocateUnsupported: "Geolocatie wordt niet ondersteund door uw browser.",
    formError: "Vul alstublieft alle verplichte velden in: naam, start en bestemming.",
    addStep: "Tussenstop toevoegen",
    prepareReturn: "Terugreis voorbereiden",
    returnTripSuffix: "Terugreis",
    generate: "Route genereren",
    generating: "Genereren...",
    reset: "Resetten",
    loadingTitle: "Uw route wordt gegenereerd...",
    loadingSubtitle: "De AI bereidt het beste pad voor u voor.",
    generationErrorTitle: "Generatiefout",
    yourItinerary: "Uw route",
    itineraryReadyTitle: "Uw route is klaar!",
    itineraryReadyBody1: "Om gedetailleerde instructies te bekijken en te navigeren, opent u de route rechtstreeks in Google Maps.",
    itineraryReadyBody2: "U kunt de knop gebruiken",
    openInMapsButton: "Openen in Google Maps",
    qrCodeText: "Scan om te openen op uw mobiel.",
    sendByEmail: "Verstuur per e-mail",
    mailtoSubject: "Route:",
    mailtoBody: (routeName: string, mapUrl: string) => `Hallo,\n\nHier is de link voor de route "${routeName}":\n${mapUrl}`,
    saveItinerary: "Route opslaan",
    updateItinerary: "Opslag bijwerken",
    savedItinerariesTitle: "Mijn opgeslagen routes",
    searchPlaceholder: "Zoeken...",
    sortByName: "Sorteer op naam",
    noItinerariesFound: "Geen routes gevonden.",
    stepSingular: "etappe",
    stepPlural: "etappes",
    viewAndLoad: "Bekijken en laden",
    delete: "Verwijderen",
    previousPage: "Vorige",
    nextPage: "Volgende",
    page: "Pagina",
    of: "van",
    poweredBy: "Aangedreven door Gemini & Google Maps",
    geminiSystemInstruction: "Je bent een reisassistent wiens enige rol het is om een routeverzoek te verwerken met de Google Maps-tool. GENEREER GEEN TEKST als antwoord. Je antwoord moet leeg zijn. De gebruikersinterface zal de nodige berichten weergeven.",
    geminiUserQueryIntro: "Ik wil een route genaamd",
    geminiUserQueryFrom: "om van",
    geminiUserQueryTo: "naar",
    geminiUserQueryWithTransport: "met",
    geminiUserQueryVia: "via de volgende etappes in deze volgorde:",
    geminiApiError: "Het genereren van de route is mislukt. Controleer uw verbinding of probeer het later opnieuw.",
    createItineraryTitle: "Een route maken",
  }
};
type Language = keyof typeof translations;
const SUPPORTED_LANGUAGES: Language[] = ['fr', 'en', 'de', 'it', 'nl'];
const languageNames: { [key in Language]: string } = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
  nl: 'Nederlands',
};
const getTranslator = (lang: Language) => {
  return translations[lang];
};

// ==========================================================================================
// FILE: services/geminiService.ts
// ==========================================================================================
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

async function generateItinerary(request: ItineraryRequest, lang: Language): Promise<ItineraryResponse> {
    const t = getTranslator(lang);
    let apiKey;
    try {
      apiKey = process.env.API_KEY;
    } catch (e) {
      console.error("Could not access process.env.API_KEY", e);
    }

    if (!apiKey) {
      throw new Error("API_KEY is not configured. Please set it in your deployment environment.");
    }
    
    const ai = new GoogleGenAI({ apiKey });
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
        return { description, routeName: request.name };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error(t.geminiApiError);
    }
}

// ==========================================================================================
// FILE: components/icons/*.tsx (All icon components)
// ==========================================================================================
function LogoIcon({ className }: { className?: string }): React.ReactElement {
    return (
        <svg viewBox="0 0 100 100" className={`w-16 h-16 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none">
            <rect width="100" height="100" rx="20" fill="#FBF9F7"/>
            <path stroke="#E6D8D4" strokeWidth="2" d="M25 85L35 75M75 15L65 25M25 15L75 65M65 75L75 85M25 45L45 25M15 25L25 35"/>
            <path d="M76 56C76 65.9411 67.9411 74 58 74C48.0589 74 40 65.9411 40 56C40 46.0589 58 28 58 28C58 28 76 46.0589 76 56Z" fill="#5E99F1"/>
            <path d="M76 56C76 65.9411 67.9411 74 58 74C48.0589 74 40 65.9411 40 56C40 46.0589 58 28 58 28C58 28 76 46.0589 76 56Z" stroke="white" strokeWidth="2"/>
            <foreignObject x="40" y="49" width="36" height="30">
                {/* FIX: Removed 'xmlns' attribute from <p> tag to resolve TypeScript error. Modern browsers can render HTML within <foreignObject> without it. */}
                <p className="text-white font-bold text-lg text-center">B</p>
            </foreignObject>
            <path d="M52 38C52 45.732 45.732 52 38 52C30.268 52 24 45.732 24 38C24 30.268 38 16 38 16C38 16 52 30.268 52 38Z" fill="#F26659"/>
            <path d="M52 38C52 45.732 45.732 52 38 52C30.268 52 24 45.732 24 38C24 30.268 38 16 38 16C38 16 52 30.268 52 38Z" stroke="white" strokeWidth="2"/>
            <foreignObject x="24" y="31" width="28" height="30">
                {/* FIX: Removed 'xmlns' attribute from <p> tag to resolve TypeScript error. Modern browsers can render HTML within <foreignObject> without it. */}
                <p className="text-white font-bold text-lg text-center">A</p>
            </foreignObject>
            <path d="M42.5 48.5C46.6667 53.3333 52.8 54.6 55 54C57.2 53.4 57.5 50.5 54 48.5C50.5 46.5 45.3333 46.8333 42.5 48.5Z" stroke="#5E99F1" strokeWidth="3" strokeLinecap="round"/>
        </svg>
    );
}
function DepartIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 12V18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 15H15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function DestinationIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 3V21" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 3H17.4C17.96 3 18.24 3.66 17.82 4.08L14.82 7.08C14.4 7.5 14.4 8.16 14.82 8.58L17.82 11.58C18.24 12 17.96 12.66 17.4 12.66H6" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function SendIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ArrowDownIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14"/>
      <path d="m19 12-7 7-7-7"/>
    </svg>
  );
}
function CarIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v9c0 .6.4 1 1 1h2"/>
      <path d="M7 17h10"/>
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  );
}
function DragHandleIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}
function EyeIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function LocationIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function PlusIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function ReturnIcon({ className }: { className?: string }): React.ReactElement {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 14 4 9 9 4"/>
            <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
        </svg>
    );
}
function SaveIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}
function SortAscendingIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 16 4 4 4-4"/>
      <path d="M7 20V4"/>
      <path d="M11 4h10"/>
      <path d="M11 8h7"/>
      <path d="M11 12h4"/>
    </svg>
  );
}
function SortDescendingIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 8 4-4 4 4"/>
      <path d="M7 4v16"/>
      <path d="M11 4h10"/>
      <path d="M11 8h7"/>
      <path d="M11 12h4"/>
    </svg>
  );
}
function SpinnerIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
function TrashIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}
function FranceFlagIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className}>
      <path fill="#002395" d="M0 0h1v2H0z"/>
      <path fill="#fff" d="M1 0h1v2H1z"/>
      <path fill="#ED2939" d="M2 0h1v2H2z"/>
    </svg>
  );
}
function UKFlagIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className}>
      <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
      <path d="M0 0v30h60V0z" fill="#012169"/>
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" clipPath="url(#a)"/>
      <path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#a)"/>
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" clipPath="url(#a)"/>
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" clipPath="url(#a)"/>
    </svg>
  );
}
function GermanyFlagIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className={className}>
      <path d="M0 0h5v3H0z"/>
      <path fill="#D00" d="M0 1h5v2H0z"/>
      <path fill="#FFCE00" d="M0 2h5v1H0z"/>
    </svg>
  );
}
function ItalyFlagIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className}>
      <path fill="#009246" d="M0 0h1v2H0z"/>
      <path fill="#fff" d="M1 0h1v2H1z"/>
      <path fill="#CE2B37" d="M2 0h1v2H2z"/>
    </svg>
  );
}
function NetherlandsFlagIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className}>
      <path fill="#21468B" d="M0 0h3v2H0z"/>
      <path fill="#fff" d="M0 0h3v1.333H0z"/>
      <path fill="#AE1C28" d="M0 0h3v.667H0z"/>
    </svg>
  );
}

// ==========================================================================================
// FILE: components/LanguageSwitcher.tsx
// ==========================================================================================
const flagComponents: { [key in Language]: React.FC<{ className?: string }> } = {
  fr: FranceFlagIcon,
  en: UKFlagIcon,
  de: GermanyFlagIcon,
  it: ItalyFlagIcon,
  nl: NetherlandsFlagIcon,
};
function LanguageSwitcher({ currentLang, onLangChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  const CurrentFlag = flagComponents[currentLang];
  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center sm:justify-start gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition w-12 h-12 sm:w-auto sm:h-auto sm:py-2 sm:pl-3 sm:pr-4"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <CurrentFlag className="h-5 w-5 rounded-full shrink-0" />
        <span className="hidden sm:inline">{languageNames[currentLang]}</span>
        <svg className="w-4 h-4 text-white hidden sm:inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5"
          role="menu"
          aria-orientation="vertical"
        >
          {(Object.keys(languageNames) as Language[]).map((langCode) => {
            const FlagComponent = flagComponents[langCode];
            return (
              <button
                key={langCode}
                onClick={() => { onLangChange(langCode); setIsOpen(false); }}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <FlagComponent className="h-5 w-5 rounded-full" />
                <span>{languageNames[langCode]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================================================================
// FILE: components/ItineraryForm.tsx
// ==========================================================================================
function ItineraryForm({ request, onChange, onGenerate, isLoading, onReset, isSavedItineraryLoaded, t }) {
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
  
  const handleTransportToggle = () => {
    const newMode = transportMode === TransportMode.CAR ? TransportMode.PEDESTRIAN : TransportMode.CAR;
    onChange({ ...request, transportMode: newMode });
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
    const returnSuffixes = (Object.keys(translations) as Language[])
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
        <label htmlFor="transportMode" className="block text-sm font-medium text-slate-700">{t.transportModeLabel}</label>
        <button type="button" onClick={handleTransportToggle} className={`${baseInputClass} flex items-center justify-between text-left`}>
            <div className="flex items-center gap-3">
                <span className="text-2xl">{transportMode === TransportMode.CAR ? '🚗' : '🚶‍♂️'}</span>
                <span className="font-medium">{t.transportModes[transportMode]}</span>
            </div>
             <CarIcon className="h-6 w-6 text-slate-500" />
        </button>
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
              key={point.id}
              className={`flex flex-col sm:flex-row sm:items-center sm:gap-2 transition-opacity ${draggedIndex === index ? 'opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Label on left for desktop, on top for mobile */}
              <div className="flex items-center gap-2 font-semibold text-slate-700 mb-1 sm:mb-0 sm:w-32 sm:shrink-0">
                  {isStart && <DepartIcon className="h-6 w-6" />}
                  {isDestination && <DestinationIcon className="h-6 w-6" />}
                  {isStep && <div className="w-6 h-6"></div>}
                  <label htmlFor={`parcours-${index}`}>{label}</label>
              </div>

              {/* Drag handle + input + button on right for desktop, below for mobile */}
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
                      <div className="w-[28px] shrink-0"></div> // Spacer to align fields if no trash icon
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

// ==========================================================================================
// FILE: components/ItineraryDisplay.tsx
// ==========================================================================================
function ItineraryDisplay({ response, request, onSave, isUpdate, t }) {
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

// ==========================================================================================
// FILE: components/SavedItineraries.tsx
// ==========================================================================================
const ITEMS_PER_PAGE = 5;

function SavedItineraries({ itineraries, onView, onDelete, t }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedItineraries = useMemo(() => {
    return itineraries
      .filter(it => it.request.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.request.name.localeCompare(b.request.name);
        }
        return b.request.name.localeCompare(a.request.name);
      });
  }, [itineraries, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedItineraries.length / ITEMS_PER_PAGE);
  const paginatedItineraries = filteredAndSortedItineraries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
      }
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="p-6 sm:p-8 bg-white/60 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/20 border border-white/30">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t.savedItinerariesTitle}</h2>
        <div className="flex items-center gap-2">
            <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on new search
                }}
                className="flex-grow px-3 py-2 bg-white/50 border-0 rounded-xl focus:ring-2 focus:ring-violet-400 outline-none transition text-sm placeholder:text-slate-600/80"
            />
            <button onClick={toggleSortOrder} title={t.sortByName} className="p-2 text-slate-600 hover:bg-white/30 rounded-full transition">
                {sortOrder === 'asc' ? <SortAscendingIcon className="h-5 w-5" /> : <SortDescendingIcon className="h-5 w-5" />}
            </button>
        </div>
      </div>
      <div className="space-y-3 min-h-[295px]">
        {paginatedItineraries.length > 0 ? paginatedItineraries.map(it => {
          const stepsCount = it.request.parcours.length - 2;
          const stepsText = stepsCount > 0 ? ` (${stepsCount} ${stepsCount > 1 ? t.stepPlural : t.stepSingular})` : '';

          return (
            <div key={it.id} className="flex items-center justify-between p-3 bg-white/40 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-white/30">
              <button
                onClick={() => onView(it)}
                className="font-semibold text-slate-800 truncate text-left hover:text-purple-700 transition focus:outline-none focus:ring-1 focus:ring-sky-300 rounded-sm p-1 -m-1"
                title={`${it.request.name}${stepsText}`}
              >
                {it.request.name}
                {stepsText && <span className="font-normal text-slate-600">{stepsText}</span>}
              </button>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <button onClick={() => onView(it)} title={t.viewAndLoad} className="p-2 text-sky-600 hover:bg-sky-100/50 rounded-full transition"><EyeIcon className="h-5 w-5"/></button>
                <button onClick={() => onDelete(it.id)} title={t.delete} className="p-2 text-red-600 hover:bg-red-100/50 rounded-full transition"><TrashIcon className="h-5 w-5"/></button>
              </div>
            </div>
          );
        }) : (
            <p className="text-center text-slate-500 pt-10">{t.noItinerariesFound}</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
            <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-semibold bg-white/30 text-slate-800 rounded-xl hover:bg-white/50 disabled:bg-white/10 disabled:text-slate-400 disabled:cursor-not-allowed transition"
            >
                {t.previousPage}
            </button>
            <span className="text-sm text-slate-600">
                {t.page} {currentPage} {t.of} {totalPages}
            </span>
            <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-semibold bg-white/30 text-slate-800 rounded-xl hover:bg-white/50 disabled:bg-white/10 disabled:text-slate-400 disabled:cursor-not-allowed transition"
            >
                {t.nextPage}
            </button>
        </div>
      )}
    </div>
  );
}


// ==========================================================================================
// FILE: App.tsx (Main App Component)
// ==========================================================================================
const LOCAL_STORAGE_KEY = 'mon-itineraire-sauvegardes';
const LANGUAGE_STORAGE_KEY = 'jyvais-language';

const createInitialRequest = (): ItineraryRequest => ({
  name: '',
  transportMode: TransportMode.CAR,
  parcours: [
    { id: Date.now(), value: '' },
    { id: Date.now() + 1, value: '' }
  ],
  currentLocation: null,
});

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as Language)) {
      return storedLang as Language;
    }
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
      return browserLang as Language;
    }
    return 'fr';
  });
  
  const t = getTranslator(language);
  const [itineraryRequest, setItineraryRequest] = useState<ItineraryRequest>(createInitialRequest());
  const [itineraryResponse, setItineraryResponse] = useState<ItineraryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadedItineraryId, setLoadedItineraryId] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (itineraryResponse && !isLoading && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [itineraryResponse, isLoading]);
  
  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const handleRequestChange = (newRequest: ItineraryRequest) => {
    setItineraryRequest(newRequest);
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
    setItineraryRequest(createInitialRequest());
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
  const isSavedItineraryLoaded = !!loadedItineraryId || (!!itineraryResponse && !isLoading);
  const taglineParts = t.tagline.split('|');

  return (
    <div className="min-h-screen font-sans p-3 sm:p-4 md:p-8 text-slate-800">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
            <div className="relative text-center flex flex-col items-center gap-2">
                <div className="absolute top-0 right-0 z-10">
                    <LanguageSwitcher currentLang={language} onLangChange={handleLangChange} />
                </div>
                <div className="flex items-center gap-4">
                    <LogoIcon />
                    <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white">JyVais</h1>
                </div>
                <p className="text-lg text-violet-200 max-w-xs sm:max-w-none mx-auto">
                  {taglineParts[0]}
                  {taglineParts.length > 1 && (
                      <>
                          <br className="sm:hidden" />
                          <span className="hidden sm:inline"> </span>
                          {taglineParts[1]}
                      </>
                  )}
                </p>
            </div>
        </header>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 text-green-800 border border-green-500/30 rounded-2xl text-center" role="alert">
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        <main className="space-y-8">
          <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] shadow-2xl shadow-violet-900/20 border border-white/30">
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
              <div className="mt-8 flex flex-col items-center justify-center text-center text-slate-800">
                <SpinnerIcon className="h-12 w-12 animate-spin" />
                <p className="mt-4 text-lg font-semibold">{t.loadingTitle}</p>
                <p>{t.loadingSubtitle}</p>
              </div>
            )}

            {error && (
              <div className="mt-8 p-4 bg-red-500/20 text-red-800 border border-red-500/30 rounded-2xl text-center">
                <p className="font-bold">{t.generationErrorTitle}</p>
                <p>{error}</p>
              </div>
            )}
            <div ref={resultsRef}>
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
        
        <footer className="text-center mt-8 text-sm text-violet-200/80">
            <p>{t.poweredBy}</p>
        </footer>
      </div>
    </div>
  );
}


// ==========================================================================================
// RENDER THE APP
// ==========================================================================================
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);