const ownedSelector = '[data-vsc-overlay]';
const videoContextSelector = 'video, div[role="dialog"], .tmla-mask';

/** Ignore our UI and mutations outside video containers. */
export const isVideoMutation = (mutation: MutationRecord): boolean => {
  if (mutation.target instanceof Element && mutation.target.closest(ownedSelector)) return false;
  const changed = [...mutation.addedNodes, ...mutation.removedNodes];
  return changed.some(node => {
    if (!(node instanceof Element) || node.matches(ownedSelector)) return false;
    return node.matches(videoContextSelector) || !!node.querySelector(videoContextSelector) ||
      (mutation.target instanceof Element && !!mutation.target.querySelector('video'));
  });
};

export const createFrameScheduler = (callback: () => void) => {
  let frame: number | undefined;
  return {
    schedule(): void {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        callback();
      });
    },
    cancel(): void {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
    }
  };
};
