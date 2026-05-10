import { BaseHandler } from '$lib/handlers';

export class TikTokHandler extends BaseHandler {
  public matches(url: URL = new URL(window.location.href)): boolean {
    return /(^|\.)tiktok\.com$/.test(url.hostname);
  }

  public shouldIgnore(video: HTMLVideoElement): boolean {
    return (
      video.closest('[mode="1"]') !== null ||
      video.closest('a') !== null
    );
  }

  public async getStyles(video: HTMLVideoElement): Promise<Record<string, any>> {
    let top: number = 60,
      left: number = 10;

    const searchBox = (video.closest('[role="dialog"]')
      ?.firstChild as Element | null)
      ?.querySelector?.('form[data-e2e="search-box"]');

    if (searchBox) {
      const rect = searchBox.getBoundingClientRect();
      const { width, height } = await this.getVideoMetadata(video);
      const isVertical = height > width;
      if (!isVertical) {
        const ratio = width / height;
        const realHeight = video.clientWidth / ratio;
        left = 0;
        top = (video.clientHeight - realHeight) / 2;
      } else {
        const ratio = height / width;
        const realWidth = video.clientHeight / ratio;
        left = (video.clientWidth - realWidth) / 2;
        top = rect.bottom;
      }

      left += 15;
      top += 10;
    }
    return {
      left: `${left}px`,
      top: `${top}px`
    };
  }

  private async getVideoMetadata(video: HTMLVideoElement): Promise<{ width: number; height: number }> {
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      return { width: video.videoWidth, height: video.videoHeight };
    }
    return await new Promise((resolve) => {
      video.addEventListener('loadedmetadata', function () {
        resolve({ width: this.videoWidth, height: this.videoHeight });
      }, {
        once: true
      });
    });
  }
}