import type { FxRatesMeta } from '@/types';

export const FX_SYMBOLS = ['EUR', 'KES', 'MXN', 'COP', 'UYU'] as const;
export const FX_PROVIDER_NAME = 'Frankfurter';
export const FX_BASE_CURRENCY = 'USD';
export const FX_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
const FX_ENDPOINT =
  `https://api.frankfurter.dev/v1/latest?base=${FX_BASE_CURRENCY}&symbols=${FX_SYMBOLS.join(',')}`;

export interface FxRatesPayload {
  rates: Record<string, number>;
  asOfDate: string;
  fetchedAt: string;
  provider: string;
  baseCurrency: string;
}

interface FrankfurterResponse {
  base: string;
  date: string;
  rates: Partial<Record<(typeof FX_SYMBOLS)[number], number>>;
}

export function getDefaultFxRatesMeta(): FxRatesMeta {
  return {
    provider: FX_PROVIDER_NAME,
    baseCurrency: FX_BASE_CURRENCY,
    asOfDate: null,
    fetchedAt: null,
    status: 'idle',
    error: null,
  };
}

export function shouldRefreshFxRates(meta: FxRatesMeta): boolean {
  if (!meta.fetchedAt) return true;
  const fetchedAt = Date.parse(meta.fetchedAt);
  if (Number.isNaN(fetchedAt)) return true;
  return (Date.now() - fetchedAt) >= FX_REFRESH_INTERVAL_MS;
}

export async function fetchLatestExchangeRates(): Promise<FxRatesPayload> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(FX_ENDPOINT, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`FX request failed with status ${response.status}`);
    }

    const data = await response.json() as FrankfurterResponse;
    const rates: Record<string, number> = {};

    for (const symbol of FX_SYMBOLS) {
      const rate = data.rates[symbol];
      if (typeof rate !== 'number' || !Number.isFinite(rate)) {
        throw new Error(`Missing ${symbol} rate from ${FX_PROVIDER_NAME}`);
      }
      rates[symbol] = rate;
    }

    return {
      rates,
      asOfDate: data.date,
      fetchedAt: new Date().toISOString(),
      provider: FX_PROVIDER_NAME,
      baseCurrency: data.base || FX_BASE_CURRENCY,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('FX request timed out');
    }
    throw error instanceof Error ? error : new Error('Unable to refresh exchange rates');
  } finally {
    window.clearTimeout(timeoutId);
  }
}
