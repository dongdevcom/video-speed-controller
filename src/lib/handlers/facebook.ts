import { BaseHandler } from '$lib/handlers';

export class FacebookHandler extends BaseHandler {
  public matches(url: URL = new URL(window.location.href)): boolean {
    return /(^|\.)facebook\.com$/.test(url.hostname);
  }

  public shouldIgnore(video: HTMLVideoElement): boolean {
    // Ignore story videos and other non-main content
    return (
      video.closest('[data-story-id]') !== null ||
      video.closest('.story-bucket-container') !== null ||
      video.closest('[aria-label="Reels"]') !== null ||
      video.getAttribute('data-video-width') === '0'
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

  public getStyles(video: HTMLVideoElement): Record<string, any> {
    const reel = location.pathname.includes('/reel/');
    return {
      left: '10px',
      top: reel ? '60px' : '10px'
    }
  }
}