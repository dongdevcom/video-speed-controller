import { get } from 'svelte/store';
import { t as i18n, locale, config } from '$lib/stores';
import { handleKeydown, handlePlaying, mountOverlay, registerMenu } from '$lib/content';

/**
 * Entry point for the userscript.
 * Sets the locale, registers Tampermonkey menu items, attaches the keyboard
 * listener, and starts observing the DOM for new video elements.
 */
export const init = (): void => {
  const cfg = config.get();
  locale.set(cfg.lang);

  const observer = new MutationObserver(() => {
    const videos = handlePlaying();
    mountOverlay(videos);
  });

  try {
    registerMenu();
    document.addEventListener('keydown', handleKeydown);
    observer.observe(document.body, { childList: true, subtree: true });
  } catch {
    const t = get(i18n);
    console.warn(t('message.not_support'));
    document.removeEventListener('keydown', handleKeydown);
    observer.disconnect();
  }
};