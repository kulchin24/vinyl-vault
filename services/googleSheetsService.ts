import { RecordItem } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxo4vHXMs7taMrwuuxf7nnchekK_Cj1zbhViddniBnb9sW2e5boaIWRd4-FspAXDpNp/exec';

const handleApiResponse = async (response: Response) => {
    if (!response.ok && response.type !== 'opaque') {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
    }
    // For 'no-cors' mode, we can't access the response body, so we assume success.
    if (response.type === 'opaque') {
        return { success: true };
    }
    try {
        return await response.json();
    } catch (e) {
        // Handle cases where response might be non-JSON (like redirects from Google)
        console.warn("Response was not JSON, assuming success due to redirect.");
        return { success: true };
    }
};

const fetchData = async (sheetName: 'Inventory' | 'Wishlist'): Promise<RecordItem[]> => {
    const response = await fetch(`${SCRIPT_URL}?sheet=${sheetName}`);
    const data = await handleApiResponse(response);
    return data;
};

export const getInventory = () => fetchData('Inventory');
export const getWishlist = () => fetchData('Wishlist');

export const postData = async (body: { action: string, payload: any }): Promise<any> => {
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Bypasses CORS issues with Google Scripts
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Use text/plain to avoid preflight
        },
        body: JSON.stringify(body)
    });

    // In 'no-cors' mode, we don't get a readable response, so we optimistically assume success.
    // The app's UI handles reverting on failure.
    return { success: true };
};