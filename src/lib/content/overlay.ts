import { mount, unmount } from 'svelte';
import { Overlay } from '$lib/components';
import type { SiteHandlerManager } from '$lib/handlers';
import type { Action } from '$lib/types';

export class OverlayController {
  private overlayMap = new Map<HTMLVideoElement, {
    element: HTMLElement;
    destroy: () => void;
  }>();

  constructor(
    private readonly manager: SiteHandlerManager
  ) { }

  public destroy(): void {
    for (const overlay of this.overlayMap.values()) overlay.destroy();
    this.overlayMap.clear();
  }

  /** Mounts overlays and remounts them when a video's target container changes. */
  public mountOverlay(
    videos: HTMLVideoElement[],
    handler: (action: Action) => void
  ): void {
    const current = new Set(videos);
    for (const [video, overlay] of this.overlayMap) {
      if (!video.isConnected || !current.has(video)) {
        overlay.destroy();
        this.overlayMap.delete(video);
      }
    }
    for (const video of videos) {
      const config = this.manager.getPosition(video);
      const element = config.element;
      const existing = this.overlayMap.get(video);
      if (existing?.element === element) continue;
      existing?.destroy();

      const anchor = element[config.position] ?? undefined;

      const destroy = mount(Overlay, {
        target: element,
        anchor: anchor,
        props: {
          video,
          handler,
          style: () => this.manager.getStyles(video)
        }
      });
      this.overlayMap.set(video, {
        element,
        destroy: () => {
          unmount(destroy);
        }
      });
    }
  }
}
