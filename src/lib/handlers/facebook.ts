import { BaseHandler } from '$lib/handlers';

export class FacebookHandler extends BaseHandler {
  public matches(url: URL = new URL(window.location.href)): boolean {
    return /(^|\.)facebook\.com$/.test(url.hostname);
  }

  public shouldIgnore(video: HTMLVideoElement): boolean {
    // Ignore story videos and other non-main content
    return (
      video.closest('a[href^="/stories"]') !== null ||
      video.closest('[aria-label="Reels"]') !== null
    );
  }

  public getPosition(_video: HTMLVideoElement): HTMLElement {
    return _video.parentElement
      ?.parentElement
      ?.parentElement
      ?.parentElement
      ?.parentElement
      ?.parentElement
      ?.parentElement
      ?.parentElement
      ?? document.body;
  }

  public async getStyles(video: HTMLVideoElement): Promise<Record<string, any>> {
    const reel = location.pathname.includes('/reel/');
    return {
      left: '10px',
      top: reel ? '60px' : '10px'
    }
  }
}