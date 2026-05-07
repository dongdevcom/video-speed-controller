import { config } from '$lib/stores';
import { Action } from '$lib/types';
import { getVideos } from '$lib/content';

/**
 * Sets playback rate on all current video elements.
 * Returns the affected elements so callers can pass them to overlay logic.
 */
const applyPlaybackRate = (rate: number): HTMLVideoElement[] => {
  return Array.from(getVideos()).map(el => {
    if (el.playbackRate !== rate) {
      el.playbackRate = rate;
    }
    return el;
  });
};

/**
 * Reads the current rate from the first video element found in the DOM,
 * falling back to the persisted rate if no video is present.
 */
const getCurrentRate = (): number => {
  const firstVideo = Array.from(getVideos())[0];
  return firstVideo?.playbackRate ?? config.getRate();
};

/**
 * Applies a speed action (increase / decrease / reset) to all video elements
 * and persists the new rate.
 */
export const playbackRateHandle = (action: Action): void => {
  const { delta } = config.get();
  const currentRate = getCurrentRate();
  let rate: number;

  switch (action) {
    case Action.Increase:
      rate = Math.min(currentRate + delta, 16);
      break;
    case Action.Decrease:
      rate = Math.max(currentRate - delta, 0.1);
      break;
    case Action.Reset:
    default:
      rate = 1.0;
  }

  config.setRate(rate);
  applyPlaybackRate(rate);
};

/**
 * Re-applies the persisted rate to all current video elements.
 * Called by the MutationObserver when the DOM changes.
 */
export const handlePlaying = (): HTMLVideoElement[] => {
  return applyPlaybackRate(config.getRate());
};

/**
 * Keyboard handler that maps configured hotkeys to playback actions.
 * Ignores events originating from input fields.
 */
export const handleKeydown = (e: KeyboardEvent): void => {
  const target = e.target as HTMLElement;
  if (!target) return;

  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return;

  const { key: keyConfig } = config.get();
  const key = e.key.toLowerCase();

  switch (key) {
    case keyConfig.decrease:
      playbackRateHandle(Action.Decrease);
      break;
    case keyConfig.increase:
      playbackRateHandle(Action.Increase);
      break;
    case keyConfig.reset:
      playbackRateHandle(Action.Reset);
      break;
  }
};
