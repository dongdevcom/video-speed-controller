import { mount, unmount } from 'svelte';
import { Overlay } from '$lib/components';
import type { SiteHandlerManager } from '$lib/handlers';
import type { Action } from '$lib/types';

export class OverlayController {
  /**
   * Tracks video elements that already have an overlay mounted.
   * WeakSet gives O(1) lookup and allows GC to collect detached video elements.
   */
  private mountedVideos = new WeakSet<HTMLVideoElement>();
  private overlayMap = new WeakMap<HTMLVideoElement, { destroy: () => void }>();

  constructor(
    private readonly manager: SiteHandlerManager
  ) { }

  /** Mounts a speed overlay for each video that does not yet have one. */
  public mountOverlay(
    videos: HTMLVideoElement[],
    handler: (action: Action) => void
  ): void {
    for (const video of videos) {
      if (this.mountedVideos.has(video)) continue;
      this.mountedVideos.add(video);

      const element = this.manager.getPosition(video);

      const destroy = mount(Overlay, {
        target: element,
        anchor: element.firstChild ?? undefined,
        props: {
          video,
          handler,
          style: () => this.manager.getStyles(video)
        }
      });
      this.overlayMap.set(video, {
        destroy: () => {
          unmount(destroy);
        }
      });
    }
  }
}