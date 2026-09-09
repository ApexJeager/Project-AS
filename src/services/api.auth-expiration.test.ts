import { afterEach, describe, expect, it, vi } from 'vitest';

function installBrowserMocks(token: string | null = 'expired-token') {
  let storedToken = token;
  const removeItem = vi.fn(() => { storedToken = null; });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: vi.fn(() => storedToken),
      setItem: vi.fn((_key: string, value: string) => { storedToken = value; }),
      removeItem,
    },
  });
  const dispatchEvent = vi.fn();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { dispatchEvent },
  });
  return { removeItem, dispatchEvent, getToken: () => storedToken };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('session expiration handling', () => {
  it('coalesces five concurrent 401 responses into one event and token removal', async () => {
    const browser = installBrowserMocks();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'expired' }), { status: 401 })));
    const { api } = await import('./api');

    await Promise.allSettled(Array.from({ length: 5 }, () => api.getChildren()));

    expect(browser.dispatchEvent).toHaveBeenCalledTimes(1);
    expect(browser.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'astronautes:auth-expired',
    }));
    expect(browser.removeItem).toHaveBeenCalledTimes(1);
    expect(browser.getToken()).toBeNull();
  });

  it('resets the guard after a successful login and handles a later expiration once', async () => {
    const browser = installBrowserMocks();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'expired' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        token: 'new-token',
        user: { id: 'user_dev_1', name: 'Justin (Dev)', role: 'Dev', color_group: null },
      }), { status: 200 }))
      .mockResolvedValue(new Response(JSON.stringify({ error: 'expired' }), { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);
    const { api } = await import('./api');

    await Promise.allSettled([api.getChildren()]);
    await api.login('user_dev_1', '1926');
    await Promise.allSettled(Array.from({ length: 5 }, () => api.getChildren()));

    expect(browser.dispatchEvent).toHaveBeenCalledTimes(2);
    expect(browser.removeItem).toHaveBeenCalledTimes(2);
  });

  it('does not dispatch expiration for failed PIN attempts', async () => {
    const browser = installBrowserMocks(null);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'invalid PIN' }), { status: 401 })));
    const { api } = await import('./api');

    await expect(api.login('user_dev_1', '0000')).rejects.toThrow('invalid PIN');

    expect(browser.dispatchEvent).not.toHaveBeenCalled();
    expect(browser.removeItem).not.toHaveBeenCalled();
  });
});
