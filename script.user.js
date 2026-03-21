// ==UserScript==
// @name         Video Speed Controller
// @namespace    https://github.com/dongdevcom/video-speed-controller/
// @version      1.0.3
// @description  Adjust and remember video speed using keyboard shortcuts
// @author       github@dongdevcom
// @match        *://*/*
// @exclude      *://*.twitch.tv/*
// @run-at       document-start
// @icon         https://raw.githubusercontent.com/dongdevcom/video-speed-controller/main/docs/icon.png
// @license      MIT
// @supportURL   https://github.com/dongdevcom/video-speed-controller/issues
// @updateURL    https://raw.githubusercontent.com/dongdevcom/video-speed-controller/main/script.meta.js
// @downloadURL  https://raw.githubusercontent.com/dongdevcom/video-speed-controller/main/script.user.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  'use strict';

  GM_addStyle(`
      .dd_video_speed_overlay {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 9999;
        background: rgba(0,0,0,0.6);
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 13px;
        font-family: monospace;
        opacity: 0;
        transition: 1s;
      }

      .dd_video_speed_overlay:hover {
        opacity: 1;
      }

      .dd_video_speed_overlay_active {
        opacity: 1;
      }
  `);

  const config = {
    delta: 0.5,
    key: {
      decrease: 's',
      increase: 'd',
      reset: 'r'
    }
  };
  let videoEl = null;

  const getSiteId = () => {
    const hostname = window.location.hostname;
    return hostname.replaceAll('.', '_') + '_speed_rate';
  };

  const isQueryAll = () => {
    return /(^|\.)tiktok\.com$/.test(location.hostname);
  };

  const getVideos = () => {
    if (isQueryAll()) {
      return document.querySelectorAll('video');
    }
    return [videoEl];
  };

  const applyPlaybackRate = (rate) => {
    getVideos().forEach(el => {
      if (el && typeof el.playbackRate === 'number' && el.playbackRate !== rate) {
        el.playbackRate = rate;
        updateOverlay(el, el.playbackRate);
      }
    });
  };

  const getCurrentRate = (el) => {
    if (Array.isArray(el)) {
      el = el[0];
    }
    return el && typeof el.playbackRate === 'number' ? el.playbackRate : GM_getValue(getSiteId(), 1.0);
  };

  const handlePlaying = () => {
    const rate = GM_getValue(getSiteId(), 1.0);
    applyPlaybackRate(rate);
  };

  const handlePlay = (e) => {
    videoEl = e.target;
  };

  const handleKeydown = (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

    const key = e.key.toLowerCase();
    const currentRate = getCurrentRate(getVideos());
    let rate = currentRate;

    switch (key) {
      case config.key.decrease:
        rate = Math.max(0.1, Math.min(currentRate - config.delta, 16));
        break;
      case config.key.increase:
        rate = Math.max(0.1, Math.min(currentRate + config.delta, 16));
        break;
      case config.key.reset:
        rate = 1.0;
        break;
      default:
        return;
    }
    GM_setValue(getSiteId(), rate);
    applyPlaybackRate(rate);
  };

  const observer = new MutationObserver(() => {
    if (getVideos().length > 0) {
      const rate = GM_getValue(getSiteId(), 1.0);
      applyPlaybackRate(rate);
    }
  });

  const updateOverlay = (el, rate) => {
    const overlay = createOverlay(el);
    overlay.textContent = `🚀 ${rate.toFixed(1)}x`;
    overlay.classList.add('dd_video_speed_overlay_active');

    clearTimeout(overlay._timeout);
    overlay._timeout = setTimeout(() => {
      overlay.classList.remove('dd_video_speed_overlay_active');
    }, 2000);
  }

  const createOverlay = (el) => {
    if (el._overlay) return el._overlay;

    const overlay = document.createElement('div');
    overlay.classList.add('dd_video_speed_overlay');

    const wrapper = document.createElement('div');

    const parent = el.parentElement;
    if (!parent) return overlay;
    parent.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    wrapper.appendChild(overlay);

    el._overlay = overlay;
    return overlay;
  }

  document.addEventListener('playing', handlePlaying, { capture: true });
  document.addEventListener('play', handlePlay, true);
  document.addEventListener('keydown', handleKeydown);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('beforeunload', () => {
      observer.disconnect();
  });
})();