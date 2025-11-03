import { RecordItem, RecordDetail } from '../types';

const API_TOKEN = process.env.DISCOGS_API_TOKEN;
const BASE_URL = 'https://api.discogs.com';

export const searchRecords = async (query: string): Promise<RecordItem[]> => {
  if (!query) return [];
  const response = await fetch(`${BASE_URL}/database/search?q=${encodeURIComponent(query)}&type=release&per_page=20`, {
    headers: {
      'Authorization': `Discogs token=${API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from Discogs API.');
  }

  const data = await response.json();
  return data.results.map((item: any) => ({
    id: item.id,
    title: item.title.split(' - ')[1] || item.title,
    artist: item.title.split(' - ')[0] || 'Unknown Artist',
    year: item.year || 'N/A',
    cover_image: item.cover_image,
  }));
};

export const getRecordDetails = async (id: number): Promise<RecordDetail> => {
    const releasePromise = fetch(`${BASE_URL}/releases/${id}`, {
        headers: { 'Authorization': `Discogs token=${API_TOKEN}` },
    });
    // The Discogs Marketplace API is separate and sometimes fails, so we fetch it separately.
    const pricePromise = fetch(`${BASE_URL}/marketplace/stats/${id}?curr_abbr=JPY`, {
        headers: { 'Authorization': `Discogs token=${API_TOKEN}` },
    });

    const [releaseResponse, priceResponse] = await Promise.all([releasePromise, pricePromise]);

    if (!releaseResponse.ok) {
        throw new Error('Record not found');
    }

    const releaseData = await releaseResponse.json();
    let priceSuggestion = null;

    if (priceResponse.ok) {
        try {
            const priceData = await priceResponse.json();
            if (priceData && priceData.lowest_price) {
                priceSuggestion = {
                    currency: priceData.lowest_price.currency,
                    value: priceData.lowest_price.value,
                };
            }
        } catch (e) {
            console.error("Could not parse pricing data:", e);
        }
    }
    
    return {
        id: releaseData.id,
        title: releaseData.title,
        artist: releaseData.artists.map((a: any) => a.name).join(', '),
        year: releaseData.year,
        cover_image: releaseData.images?.[0]?.uri || '',
        tracklist: releaseData.tracklist || [],
        formats: releaseData.formats || [],
        country: releaseData.country || 'Unknown',
        priceSuggestion,
    };
};
