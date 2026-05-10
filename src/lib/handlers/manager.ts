import {
  YouTubeHandler,
  FacebookHandler,
  BaseHandler,
  TikTokHandler
} from '$lib/handlers';

export class SiteHandlerManager {
  private readonly handlers: BaseHandler[] = [
    new FacebookHandler(),
    new YouTubeHandler(),
    new TikTokHandler(),
    new BaseHandler(),
  ];

  private handlerCache = new Map<string, BaseHandler>();

  public getHandler(url: URL = new URL(window.location.href)): BaseHandler {
    const key = url.hostname;
    if (this.handlerCache.has(key)) {
      return this.handlerCache.get(key)!;
    }
    const handler = this.handlers.find(h => h.matches(url)) ?? this.handlers[this.handlers.length - 1];
    this.handlerCache.set(key, handler);
    return handler;
  }

  public getVideos(root: Document = document): HTMLVideoElement[] {
    return this.getHandler().getVideos(root);
  }

  public getPosition(_video: HTMLVideoElement): HTMLElement {
    return this.getHandler().getPosition(_video);
  }

  public async getStyles(_video: HTMLVideoElement): Promise<Record<string, any>> {
    return this.getHandler().getStyles(_video);
  }
}