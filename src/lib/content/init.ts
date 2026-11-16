import { get } from 'svelte/store';
import { t as i18n, locale, config } from '$lib/stores';
import { MenuController, PlaybackController, OverlayController } from '$lib/content';
import { SiteHandlerManager } from '$lib/handlers';
import { createFrameScheduler, isVideoMutation } from './video-observer';

/**
 * Entry point for the userscript.
 * Sets the locale, registers Tampermonkey menu items, attaches the keyboard
 * listener, and starts observing the DOM for new video elements.
 */
export const init = (): void => {
  const c = config.get();
  locale.set(c.lang);

  const manager = new SiteHandlerManager();
  const playback = new PlaybackController(manager);
  const overlay = new OverlayController(manager);
  const menu = new MenuController();

  const update = () => {
    const videos = playback.handlePlaying();
    overlay.mountOverlay(videos, action => playback.playbackRateHandler(action));
  };
  const scheduler = createFrameScheduler(update);
  const observer = new MutationObserver(mutations => {
    if (mutations.some(isVideoMutation)) scheduler.schedule();
  });
  const flushConfig = () => config.flush();

  try {
    menu.registerMenu();
    if (config.disabled()) return;

    document.addEventListener('keydown', playback.handleKeydown);
    window.addEventListener('pagehide', flushConfig);
    observer.observe(document.body, { childList: true, subtree: true });
    update();
  } catch {
    const t = get(i18n);
    console.warn(t('message.not_support'));
    document.removeEventListener('keydown', playback.handleKeydown);
    observer.disconnect();
    scheduler.cancel();
    overlay.destroy();
    window.removeEventListener('pagehide', flushConfig);
  }
};
