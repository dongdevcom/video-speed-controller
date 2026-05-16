import { BaseHandler } from '$lib/handlers';
import { MountPosition } from '$lib/types';
import type { MountConfig } from '$lib/types';

export class YouTubeHandler extends BaseHandler {
  public matches(url: URL = new URL(window.location.href)): boolean {
    return /(^|\.)youtube\.com$/.test(url.hostname) || url.hostname === 'youtu.be';
  }

  public shouldIgnore(video: HTMLVideoElement): boolean {
    // Ignore thumbnail videos
    return video.closest('#video-preview') !== null;
  }

  public getPosition(video: HTMLVideoElement): MountConfig {
    let element: HTMLElement | null = null;
    if (video.closest('#shorts-player')) {
      element = video.parentElement?.parentElement?.parentElement as HTMLElement;
    } else {
      element = video.parentElement?.parentElement as HTMLElement;
    }
    return {
      element: element ?? document.body,
      position: MountPosition.FirstChild
    };
  }

  public async getStyles(video: HTMLVideoElement): Promise<Record<string, any>> {
    let top: number = 20,
      left: number = 10;
    
    if (video.closest('#shorts-player')) {
      top = 75;
    } else if (document.fullscreenElement !== null) {
      top = 70;
      left = 15;
    }

    return {
      left: `${left}px`,
      top: `${top}px`
    }
  }
}