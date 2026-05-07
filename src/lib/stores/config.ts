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
export const config = (() => {
  const store = gm<ConfigData>('config', DEFAULT_CONFIG);

  return {
    ...store,

    /** Returns a derived store that emits the current site's playback rate. */
    rate(): Readable<number> {
      const host = getSiteId();
      return derived(store, ($config) => $config.rates[host]?.rate ?? 1.0);
    },

    /** Synchronously reads the persisted rate for the current site. */
    getRate(): number {
      const host = getSiteId();
      return store.get().rates[host]?.rate ?? 1.0;
    },

    /** Persists `rate` for the current site. */
    setRate(rate: number): void {
      const host = getSiteId();
      store.update(v => {
        v.rates[host] = { rate };
        return v;
      });
    },
  };
})();
