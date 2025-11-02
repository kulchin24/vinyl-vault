export interface RecordItem {
  id: number;
  title: string;
  artist: string;
  year: number | string;
  cover_image: string;
  discogs_id?: number; // Added for consistency
}

export interface RecordDetail extends RecordItem {
  tracklist: {
    position: string;
    title: string;
    duration: string;
  }[];
  formats: {
    name: string;
    descriptions?: string[];
  }[];
  country: string;
  priceSuggestion?: {
    currency: string;
    value: number;
  };
  notes?: string;
}