import { derived } from 'svelte/store';
import { getSiteId } from '$lib/utils';
import { gm } from '$lib/stores/gm';
import { DEFAULT_CONFIG } from '$lib/constants';
import type { Readable } from 'svelte/store';
import type { ConfigData } from '$lib/types';

/**
 * Persistent application config store.
 *
 * Extends the base GM store with per-site playback rate helpers so that each
 * hostname can remember its own speed independently.
 */
function normalizeConfig(data?: Partial<ConfigData>): ConfigData {
  return {
    ...DEFAULT_CONFIG,
    ...data,

    key: {
      ...DEFAULT_CONFIG.key,
      ...data?.key
    },

    rates: data?.rates ?? {},
    exclusions: data?.exclusions ?? []
  };
}

export const config = (() => {
  const rawStore = gm<ConfigData>('config', DEFAULT_CONFIG);
  rawStore.update(c => normalizeConfig(c));

  const store = {
    ...rawStore,
    get(): ConfigData {
      return normalizeConfig(rawStore.get());
    },
    update(updater: (config: ConfigData) => ConfigData): void {
      rawStore.update(c => updater(normalizeConfig(c)));
    }
  };

  return {
    ...store,

    /** Returns a derived store that emits the current site's playback rate. */
    rate(): Readable<number> {
      const host = getSiteId();

      return derived(rawStore, ($config) => {
        const c = normalizeConfig($config);
        return c.rates[host]?.rate ?? 1.0;
      });
    },

    /** Synchronously reads the persisted rate for the current site. */
    getRate(): number {
      const host = getSiteId();
      const c = store.get();
      return c.rates[host]?.rate ?? 1.0;
    },

    /** Persists `rate` for the current site. */
    setRate(rate: number): void {
      const host = getSiteId();
      store.update(c => ({
        ...c,
        rates: {
          ...c.rates,
          [host]: { rate }
        }
      }));
    },

    disabled(): boolean {
      const host = getSiteId();
      const c = store.get();
      return c.exclusions.includes(host);
    },

    disable(): void {
      const host = getSiteId();
      store.update(c => {
        if (c.exclusions.includes(host)) {
          return c;
        }
        return {
          ...c,
          exclusions: [...c.exclusions, host]
        };
      });
    },

    enable(): void {
      const host = getSiteId();
      store.update(c => ({
        ...c,
        exclusions: c.exclusions.filter(x => x !== host)
      }));
    },

    reset(): void {
      rawStore.set(structuredClone(DEFAULT_CONFIG));
    }
  };
})();
