import { describe, it, expect, vi } from 'vitest';
import { geocode } from './GeocodeApi';
import { fetch } from '@tauri-apps/plugin-http';

vi.mock('@tauri-apps/plugin-http', () => ({
  fetch: vi.fn(),
}));

describe('GeocodeApi', () => {
  it('should return data when fetch is successful', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve([{ lat: '1.23', lon: '4.56', display_name: 'Test' }]),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as any);

    const response = await geocode('Test Place');
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data[0].lat).toBe('1.23');
  });

  it('should handle network failures gracefully', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const response = await geocode('Test Place');
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('should handle non-ok responses', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as any);

    const response = await geocode('Test Place');
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });
});
