<script lang="ts">
  import { onMount } from 'svelte';
  import { SpeedLoopIcon, MinusIcon, PlusIcon, ResetIcon } from '$lib/icons';
  import { Action } from '$lib/types';
  import { debounce, styleObjectToString } from '$lib/utils';
  import { t } from '$lib/stores';

  export interface OverlayProps {
    video: HTMLVideoElement;
    handler: (action: Action) => void;
    style: () => Record<string, any>;
  }

  let { video, handler, style }: OverlayProps = $props();
  
  let rate = $state(1.0);
  let active = $state(false);
  let styleState = $state({});

  /** Deactivate the overlay 1 s after the last rate change. Created once so debounce works correctly. */
  const scheduleDeactivate = debounce(() => {
    active = false;
  }, 1000);

  onMount(() => {
    const handleRateChange = () => {
      rate = video.playbackRate;
      active = true;
      scheduleDeactivate();
    };

    const resizeObserver = new ResizeObserver(() => {
      styleState = style();
    });
    resizeObserver.observe(video);
    video.addEventListener('ratechange', handleRateChange);

    return () => {
      resizeObserver.disconnect();
      video.removeEventListener('ratechange', handleRateChange);
    };
  });

  const stop = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const increase = (e: MouseEvent) => {
    stop(e);
    handler(Action.Increase);
  };
  const decrease = (e: MouseEvent) => {
    stop(e);
    handler(Action.Decrease);
  };
  const reset = (e: MouseEvent) => {
    stop(e);
    handler(Action.Reset);
  };
</script>

<div class="overlay-wrapper">
  <div
    class:active
    class="overlay"
    style={styleObjectToString(styleState)}
  >
    <div class="overlay-text">
      <SpeedLoopIcon width={16} height={16} color="white" />
      <span>{rate.toFixed(1)}</span>
    </div>
    <div class="overlay-controls">
      <button
        class="overlay-button"
        onclick={decrease}
        ondblclick={stop}
        aria-label={$t('aria.decrease_speed')}
      >
        <MinusIcon width={14} height={14} color="white" />
      </button>
      <button
        class="overlay-button"
        onclick={reset}
        ondblclick={stop}
        aria-label={$t('aria.reset_speed')}
      >
        <ResetIcon width={14} height={14} color="white" />
      </button>
      <button
        class="overlay-button"
        onclick={increase}
        ondblclick={stop}
        aria-label={$t('aria.increase_speed')}
      >
        <PlusIcon width={14} height={14} color="white" />
      </button>
    </div>
  </div>
</div>

<style>
  .overlay-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9999 !important;
  }

  .overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    background: rgba(0, 0, 0, 0.6);
    padding: 4px 8px;
    border-radius: 6px;
    opacity: 0;
    transition: 1s;
    gap: 0;
    pointer-events: auto;
  }

  .overlay:hover {
    opacity: 1;
  }

  .overlay.active {
    opacity: 1;
  }

  .overlay-text {
    display: flex;
    gap: 2px;
    align-items: center;
    justify-content: center;
  }

  .overlay-text span {
    font-size: 14px;
    font-weight: 500;
    color: white;
  }

  .overlay-controls {
    display: none;
    gap: 6px;
    margin-left: 8px;
  }

  .overlay:hover .overlay-controls {
    display: flex;
  }

  .overlay-button {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.65);
    border-radius: 5px;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
</style>
