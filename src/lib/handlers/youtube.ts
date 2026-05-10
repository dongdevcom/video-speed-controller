import { BaseHandler } from '$lib/handlers';

export class YouTubeHandler extends BaseHandler {
  public matches(url: URL = new URL(window.location.href)): boolean {
    return /(^|\.)youtube\.com$/.test(url.hostname) || url.hostname === 'youtu.be';
  }

  public shouldIgnore(video: HTMLVideoElement): boolean {
    // Ignore thumbnail videos and ads
    return (
      video.classList.contains('video-thumbnail') ||
      video.parentElement?.classList.contains('ytp-ad-player-overlay') ||
      video.closest('#video-preview') !== null
    ) ?? false;
  }

  public getPosition(video: HTMLVideoElement): HTMLElement {
    if (video.closest('#shorts-player')) {
      return video.parentElement?.parentElement?.parentElement as HTMLElement ?? video;
    }
    return video.parentElement?.parentElement ?? video;
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