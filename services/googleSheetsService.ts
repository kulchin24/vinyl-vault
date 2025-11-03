import { RecordItem } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxo4vHXMs7taMrwuuxf7nnchekK_Cj1zbhViddniBnb9sW2e5boaIWRd4-FspAXDpNp/exec';

const fetchData = async (sheetName: 'Inventory' | 'Wishlist'): Promise<RecordItem[]> => {
    const response = await fetch(`${SCRIPT_URL}?sheet=${sheetName}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${sheetName} data.`);
    }
    return await response.json();
};

export const getInventory = () => fetchData('Inventory');
export const getWishlist = () => fetchData('Wishlist');

export const postData = async (body: { action: string, payload: any }): Promise<any> => {
    // By removing 'no-cors', we can now properly handle the response from the script.
    // This is crucial for knowing if an operation succeeded or failed.
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        // We keep text/plain to avoid a CORS preflight OPTIONS request, which Apps Script doesn't handle.
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(body),
        redirect: 'follow'
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not read error response.');
        console.error("Google Sheets API Error:", errorText);
        throw new Error(`Database operation failed with status: ${response.status}`);
    }
    
    // The script should return a JSON response on success.
    const result = await response.json();

    if (result.status !== 'success') {
        throw new Error(`Database operation reported an error: ${result.message}`);
    }

    return result;
};
