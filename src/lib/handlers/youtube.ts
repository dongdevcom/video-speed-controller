import { BaseHandler } from '$lib/handlers';

export class YouTubeHandler extends BaseHandler {
  public matches(url: URL = new URL(window.location.href)): boolean {
    return /(^|\.)youtube\.com$/.test(url.hostname) || url.hostname === 'youtu.be';
  }

  public shouldIgnore(video: HTMLVideoElement): boolean {
    // Ignore thumbnail videos and ads
    return (
      video.classList.contains('video-thumbnail') ||
      video.parentElement?.classList.contains('ytp-ad-player-overlay')
    ) ?? false;
  }

  public getPosition(_video: HTMLVideoElement): HTMLElement {
    return _video.parentElement?.parentElement ?? document.body;
  }

  public getStyles(_video: HTMLVideoElement): Record<string, any> {
    return {
      left: '10px',
      top: document.fullscreenElement !== null ? '65px' : '20px'
    }
  }
}