import { MountPosition } from '$lib/types';
import type { MountConfig } from '$lib/types';

/**
 * Default handler used for all sites when no specialized handler matches.
 */
export class BaseHandler {
  public matches(_url: URL = new URL(window.location.href)): boolean {
    return true;
  }

  public getVideos(root: Document = document): HTMLVideoElement[] {
    return Array.from(root.querySelectorAll('video')).filter(video => !this.shouldIgnore(video));
  }

  public shouldIgnore(_video: HTMLVideoElement): boolean {
    return false;
  }

  public getPosition(_video: HTMLVideoElement): MountConfig {
    return {
      element: _video.parentElement ?? document.body,
      position: MountPosition.LastChild
    };
  }

  public async getStyles(_video: HTMLVideoElement): Promise<Record<string, any>> {
    return {
      left: '10px',
      top: '20px'
    };
  }
}