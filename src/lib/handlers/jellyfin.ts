import { BaseHandler } from '$lib/handlers';
import { MountPosition } from '$lib/types';
import type { MountConfig } from '$lib/types';

export class JellyfinHandler extends BaseHandler {
  public matches(): boolean {
    return document.querySelector('meta[name="application-name"][content="Jellyfin"]') !== null;
  }

  public getPosition(video: HTMLVideoElement): MountConfig {
    const mask = document.querySelector('body > div.tmla-mask.hide');
    return {
      element: mask?.parentElement ?? document.body,
      position: MountPosition.LastChild
    }
  }

  public async getStyles(video: HTMLVideoElement): Promise<Record<string, any>> {
    return {
      left: '10px',
      top: '60px'
    }
  }
}