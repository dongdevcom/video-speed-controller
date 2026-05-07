import { GM_setValue, GM_getValue } from '$';
import { writable, get } from 'svelte/store';
import { debounce } from '$lib/utils';

/**
 * Creates a Svelte writable store backed by Tampermonkey's persistent storage.
 * Reads the initial value via `GM_getValue` and debounces writes to `GM_setValue`
 * so rapid state updates don't hammer the storage API.
 *
 * @param key - The storage key used by GM_getValue / GM_setValue.
 * @param defaultValue - Fallback value when no stored value exists.
 */
export function gm<T>(key: string, defaultValue: T) {
  const initial = GM_getValue(key, defaultValue);
  const store = writable<T>(initial);

  const save = debounce((value: T) => {
    GM_setValue(key, value);
  }, 200);

  store.subscribe(save);

  return {
    store,
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    get: () => get(store),
  };
}