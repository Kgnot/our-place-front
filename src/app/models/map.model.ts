export interface PlaceCategory {
  code: string;
  name: string;
  iconUrl: string;
}

export interface SavedPlace {
  id: string;
  categoryCode: string;
  categoryName: string;
  categoryIconUrl: string;
  name: string;
  description: string;
  locationWkt: string;
  visitedAt: string | null;
}

export interface CreateSavedPlacePayload {
  categoryCode: string;
  name: string;
  description: string;
  locationWkt: string;
  visitedAt: string | null;
}
