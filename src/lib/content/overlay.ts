import { mount } from 'svelte';
import { Overlay } from '$lib/components';

/**
 * Tracks video elements that already have an overlay mounted.
 * WeakSet gives O(1) lookup and allows GC to collect detached video elements.
 */
const mountedVideos = new WeakSet<HTMLVideoElement>();

/**
 * Returns the best container element for the overlay.
 * For most sites, the video's direct parent provides proper stacking context.
 */
const getOverlayTarget = (video: HTMLVideoElement): HTMLElement =>
  video.parentElement ?? document.body;

/** Mounts a speed overlay for each video that does not yet have one. */
export const mountOverlay = (videos: HTMLVideoElement[]): void => {
  for (const video of videos) {
    if (mountedVideos.has(video)) continue;
    mountedVideos.add(video);

    mount(Overlay, {
      target: getOverlayTarget(video),
      props: { video },
    });
  }
};