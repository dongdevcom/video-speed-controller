import { config } from '$lib/stores';
import { Action } from '$lib/types';
import type { SiteHandlerManager } from '$lib/handlers';

export class PlaybackController {
  constructor(private readonly manager: SiteHandlerManager) { }

  private applyPlaybackRate(rate: number): HTMLVideoElement[] {
    return this.manager.getVideos().map(el => {
      if (el.playbackRate !== rate) {
        el.playbackRate = rate;
      }
      return el;
    });
  }

  private getCurrentRate(): number {
    const firstVideo = this.manager.getVideos()[0];
    return firstVideo?.playbackRate ?? config.getRate();
  }

  public playbackRateHandler(action: Action): void {
    const { delta } = config.get();
    const currentRate = this.getCurrentRate();
    let rate: number;

    switch (action) {
      case Action.Increase:
        rate = Math.min(currentRate + delta, 16);
        break;
      case Action.Decrease:
        rate = Math.max(currentRate - delta, 0.1);
        break;
      case Action.Reset:
      default:
        rate = 1.0;
    }

    config.setRate(rate);
    this.applyPlaybackRate(rate);
  }

  public handlePlaying(): HTMLVideoElement[] {
    return this.applyPlaybackRate(config.getRate());
  }

  public handleKeydown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const tag = target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return;

    const { key: keyConfig } = config.get();
    const key = e.key.toLowerCase();

    switch (key) {
      case keyConfig.decrease:
        this.playbackRateHandler(Action.Decrease);
        break;
      case keyConfig.increase:
        this.playbackRateHandler(Action.Increase);
        break;
      case keyConfig.reset:
        this.playbackRateHandler(Action.Reset);
        break;
    }
  };
}
