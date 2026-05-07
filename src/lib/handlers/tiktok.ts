import { BaseHandler } from '$lib/handlers';

export class TikTokHandler extends BaseHandler {
  public matches(url: URL = new URL(window.location.href)): boolean {
    return /(^|\.)tiktok\.com$/.test(url.hostname);
  }

  public getStyles(): Record<string, any> {
    return {
      left: '10px',
      top: '60px'
    };
  }
}