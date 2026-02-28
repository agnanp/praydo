import { fetch } from '@tauri-apps/plugin-http';

const GEOCODE_BASE_URL = 'https://nominatim.openstreetmap.org/search';

export const geocode = async (place: string) => {
  const url = GEOCODE_BASE_URL;

  const params = new URLSearchParams({
    q: place,
    format: 'json',
    limit: '1',
  });

  try {
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Praydo/0.4 (https://github.com/agnanp/praydo; praydo@apr.my.id)',
      },
    });
    return response;
  } catch (error) {
    console.error('Geocoding error:', error);
    // Return a mock response object that matches the expected interface for errors
    return {
      ok: false,
      status: 500,
      statusText: error instanceof Error ? error.message : 'Unknown error',
      json: () => Promise.resolve([]),
    } as any;
  }
};
