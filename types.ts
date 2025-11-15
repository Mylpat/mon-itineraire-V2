export enum TransportMode {
  CAR = 'CAR',
  PEDESTRIAN = 'PEDESTRIAN',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ItineraryRequest {
  name: string;
  transportMode: TransportMode;
  parcours: { id: number; value: string }[];
  currentLocation: Coordinates | null;
}

export interface ItineraryResponse {
  description: string;
  routeName: string;
}

export interface SavedItinerary {
  id: number;
  request: ItineraryRequest;
  response: ItineraryResponse;
}