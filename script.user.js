// ==UserScript==
// @name         Video Speed Controller
// @namespace    https://github.com/dongdevcom/video-speed-controller/
// @version      1.0.5
// @description  Adjust and remember video speed using keyboard shortcuts
// @author       github@dongdevcom
// @match        *://*/*
// @exclude      *://*.twitch.tv/*
// @run-at       document-idle
// @icon         https://raw.githubusercontent.com/dongdevcom/video-speed-controller/main/docs/icon.png
// @license      MIT
// @supportURL   https://github.com/dongdevcom/video-speed-controller/issues
// @updateURL    https://raw.githubusercontent.com/dongdevcom/video-speed-controller/main/script.meta.js
// @downloadURL  https://raw.githubusercontent.com/dongdevcom/video-speed-controller/main/script.user.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

  const config = {
    delta: 0.5,
    key: {
      decrease: 's',
      increase: 'd',
      reset: 'r'
    },
    rate: 1.0,
    lang: null
  };
  const prefix = 'dd-vid-speed';
  const style = `
      .${prefix}-overlay {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 9999;
        background: rgba(0,0,0,0.6);
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-family: 'Arial', sans-serif;
        font-size: 13px;
        font-family: monospace;
        opacity: 0;
        transition: 1s;
      }

      .${prefix}-overlay:hover {
        opacity: 1;
      }

      .${prefix}-overlay-active {
        opacity: 1;
      }

      .${prefix}-wrapper {
        height: 100%;
        width: auto;
      }

      .${prefix}-menu-container {
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: #111;
        color: #fff;
        padding: 20px;
        z-index: 99999;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        font-family: 'Arial', sans-serif;
        font-size: 14px;
      }

      .${prefix}-menu-container fieldset {
        border: 1px solid #444;
        padding: 15px;
        border-radius: 8px;
        margin: 0;
      }

      .${prefix}-menu-container .${prefix}-field {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }

      .${prefix}-menu-container .${prefix}-field label {
        flex: 0 0 200px;
        margin-bottom: 0;
        margin-right: 10px;
        color: #ddd;
        font-weight: bold;
      }

      .${prefix}-menu-container .${prefix}-field input,
      .${prefix}-menu-container .${prefix}-field select {
        flex: 1;
        padding: 8px;
        border: 1px solid #555;
        border-radius: 4px;
        background: #222;
        color: #fff;
        font-family: 'Arial', sans-serif;
        font-size: 14px;
      }

      .${prefix}-menu-container .${prefix}-field input:focus,
      .${prefix}-menu-container .${prefix}-field select:focus {
        outline: none;
        border-color: #007bff;
      }

      .${prefix}-menu-container .${prefix}-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
      }

      .${prefix}-menu-container button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Arial', sans-serif;
        font-size: 14px;
      }

      .${prefix}-menu-container button#${prefix}-close {
        background: #dc3545;
        color: white;
      }

      .${prefix}-menu-container button#${prefix}-close:hover {
        background: #c82333;
      }

      .${prefix}-menu-container button#${prefix}-save {
        background: #007bff;
        color: white;
      }

      .${prefix}-menu-container button#${prefix}-save:hover {
        background: #0056b3;
      }
  `;

  const languages = {
    en: {
      menu: {
        openConfig: '🛠️ Open configuration',
        resetConfig: '🔄 Reset all configuration'
      },
      popup: {
        delta: 'Increase/decrease step',
        inputDelta: 'Enter step',
        increaseKey: 'Increase speed key',
        decreaseKey: 'Decrease speed key',
        resetKey: 'Reset speed key',
        inputKey: 'Enter key (e.g. s, d, r)',
        lang: 'Language',
        save: 'Save',
        close: 'Close'
      },
      messages: {
        saved: 'Saved!',
        deltaError: 'Delta must be a number between 0.1 and 16',
        keyError: 'Keys must be single alphanumeric characters',
        langError: 'Invalid language selection',
        resetConfirm: 'Are you sure you want to reset all configuration?',
        resetDone: 'All configuration has been reset!',
        notSupport: 'Video Speed ​​Controller does not support this website'
      }
    },
    vi: {
      menu: {
        openConfig: '🛠️ Mở cấu hình',
        resetConfig: '🔄 Reset toàn bộ cấu hình'
      },
      popup: {
        delta: 'Bước tăng/giảm',
        inputDelta: 'Nhập bước',
        increaseKey: 'Phím tăng tốc độ',
        decreaseKey: 'Phím giảm tốc độ',
        resetKey: 'Phím đặt lại tốc độ',
        inputKey: 'Nhập phím (ví dụ: s, d, r)',
        lang: 'Ngôn ngữ',
        save: 'Lưu',
        close: 'Đóng'
      },
      messages: {
        saved: 'Đã lưu!',
        deltaError: 'Delta phải là số từ 0.1 đến 16',
        keyError: 'Các phím phải là ký tự đơn alphanumeric',
        langError: 'Lựa chọn ngôn ngữ không hợp lệ',
        resetConfirm: 'Bạn có chắc chắn muốn xóa toàn bộ cấu hình?',
        resetDone: 'Đã đặt lại toàn bộ cấu hình!',
        notSupport: 'Video Speed Controller không hỗ trợ website này'
      }
    }
  };

  const css = (name) => `${prefix}-${name}`;
  const html = css;
  const get = (obj, path) => {
    return path.split('.').reduce((o, key) => o?.[key], obj);
  };
  const set = (obj, path, value) => {
    const keys = path.split('.');
    const last = keys.pop();

    const target = keys.reduce((o, key) => {
      if (!o[key]) o[key] = {};
      return o[key];
    }, obj);

    target[last] = value;
  };

  const getBrowserLang = () => {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('vi')) return 'vi';
    return 'en';
  };

  const t = (key, vars = {}) => {
    const lang = config.lang;
    const str = key.split('.').reduce((o, i) => o?.[i], languages[lang]) || key;
    return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
  };

  const getSiteId = () => {
    const hostname = window.location.hostname;
    return hostname.replaceAll('.', '_');
  };

  const loadConfig = (conf) => {
    const savedConfig = conf ?? GM_getValue('config', {});
    config.delta = get(savedConfig, 'delta') ?? config.delta;
    config.key.decrease = get(savedConfig, 'key.decrease') ?? config.key.decrease;
    config.key.increase = get(savedConfig, 'key.increase') ?? config.key.increase;
    config.key.reset = get(savedConfig, 'key.reset') ?? config.key.reset;
    config.rate = get(savedConfig, `rates.${getSiteId()}`) ?? config.rate;
    config.lang = get(savedConfig, 'lang') ?? getBrowserLang();
  };

  const saveConfig = (config, value) => {
    const savedConfig = GM_getValue('config', {});
    set(savedConfig, config, value);
    GM_setValue('config', savedConfig);
    loadConfig(savedConfig);
  };

  const menu = {
    reset: () => {
      if (confirm(t('messages.resetConfirm'))) {
        GM_setValue('config', {});
        loadConfig();
        if (!alert(t('messages.resetDone'))) {
          window.location.reload();
        }
      }
    },
    popup: () => {
      const div = document.createElement('div');

      const container = document.createElement('div');
      container.className = css('menu-container');

      const fieldset = document.createElement('fieldset');

      const createField = (labelText, inputEl) => {
        const field = document.createElement('div');
        field.className = css('field');

        const label = document.createElement('label');
        label.textContent = labelText;

        if (inputEl.id) {
          label.setAttribute('for', inputEl.id);
        }

        field.appendChild(label);
        field.appendChild(inputEl);

        return field;
      }

      // delta
      const deltaInput = document.createElement('input');
      deltaInput.id = html('delta');
      deltaInput.type = 'number';
      deltaInput.placeholder = t('popup.inputDelta');
      deltaInput.min = '0.1';
      deltaInput.max = '16';
      deltaInput.step = '0.1';
      deltaInput.value = config.delta;

      // decrease key
      const decreaseInput = document.createElement('input');
      decreaseInput.id = html('decrease-key');
      decreaseInput.type = 'text';
      decreaseInput.placeholder = t('popup.inputKey');
      decreaseInput.value = config.key.decrease;
      decreaseInput.maxLength = 1;

      // increase key
      const increaseInput = document.createElement('input');
      increaseInput.id = html('increase-key');
      increaseInput.type = 'text';
      increaseInput.placeholder = t('popup.inputKey');
      increaseInput.value = config.key.increase;
      increaseInput.maxLength = 1;

      // reset key
      const resetInput = document.createElement('input');
      resetInput.id = html('reset-key');
      resetInput.type = 'text';
      resetInput.placeholder = t('popup.inputKey');
      resetInput.value = config.key.reset;
      resetInput.maxLength = 1;

      // lang select
      const langSelect = document.createElement('select');
      langSelect.name = html('lang');
      langSelect.id = html('lang');

      const optEn = document.createElement('option');
      optEn.value = 'en';
      optEn.textContent = 'English';
      if (config.lang === 'en') optEn.selected = true;

      const optVi = document.createElement('option');
      optVi.value = 'vi';
      optVi.textContent = 'Tiếng Việt';
      if (config.lang === 'vi') optVi.selected = true;

      langSelect.appendChild(optEn);
      langSelect.appendChild(optVi);

      // buttons
      const buttons = document.createElement('div');
      buttons.className = css('buttons');

      const btnClose = document.createElement('button');
      btnClose.id = html('close');
      btnClose.textContent = t('popup.close');

      const btnSave = document.createElement('button');
      btnSave.id = html('save');
      btnSave.textContent = t('popup.save');

      buttons.appendChild(btnClose);
      buttons.appendChild(btnSave);

      fieldset.appendChild(createField(t('popup.delta'), deltaInput));
      fieldset.appendChild(createField(t('popup.decreaseKey'), decreaseInput));
      fieldset.appendChild(createField(t('popup.increaseKey'), increaseInput));
      fieldset.appendChild(createField(t('popup.resetKey'), resetInput));
      fieldset.appendChild(createField(t('popup.lang'), langSelect));
      fieldset.appendChild(buttons);

      container.appendChild(fieldset);
      div.appendChild(container);

      document.body.appendChild(div);

      document.getElementById(html('close')).onclick = () => {
        div.remove();
      };

      document.getElementById(html('save')).onclick = () => {
        const deltaVal = parseFloat(document.getElementById(html('delta')).value);
        if (isNaN(deltaVal) || deltaVal < 0.1 || deltaVal > 16) {
          alert(t('messages.deltaError'));
          return;
        }
        const decreaseKey = document.getElementById(html('decrease-key')).value.trim();
        const increaseKey = document.getElementById(html('increase-key')).value.trim();
        const resetKey = document.getElementById(html('reset-key')).value.trim();
        const keyRegex = /^[a-zA-Z0-9]$/;
        if (!keyRegex.test(decreaseKey) || !keyRegex.test(increaseKey) || !keyRegex.test(resetKey)) {
          alert(t('messages.keyError'));
          return;
        }
        const langVal = document.getElementById(html('lang')).value;
        if (!['en', 'vi'].includes(langVal)) {
          alert(t('messages.langError'));
          return;
        }
        saveConfig('delta', deltaVal);
        saveConfig('key.decrease', decreaseKey.toLowerCase());
        saveConfig('key.increase', increaseKey.toLowerCase());
        saveConfig('key.reset', resetKey.toLowerCase());
        saveConfig('lang', langVal);
        if (!alert(t('messages.saved'))) {
          window.location.reload();
        }
        div.remove();
      };
    }
  };

  const getVideos = () => document.querySelectorAll('video');

  const applyPlaybackRate = (rate) => {
    getVideos().forEach(el => {
      if (el && typeof el.playbackRate === 'number' && el.playbackRate !== rate) {
        el.playbackRate = rate;
        updateOverlay(el, el.playbackRate);
      }
    });
  };

  const getCurrentRate = (el) => {
    if (Array.isArray(el)) el = el[0];
    return el && typeof el.playbackRate === 'number' ? el.playbackRate : config.rate;
  };

  const handlePlaying = () => {
    applyPlaybackRate(config.rate);
  };

  const handleKeydown = (e) => {
    if (!getVideos()) return;
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
    saveConfig(`rates.${getSiteId()}`, rate);
    applyPlaybackRate(rate);
  };

  const observer = new MutationObserver(() => {
    applyPlaybackRate(config.rate);
  });

  const updateOverlay = (el, rate) => {
    const overlay = createOverlay(el);
    overlay.textContent = `🚀 ${rate.toFixed(1)}x`;
    overlay.classList.add(css('overlay-active'));

    clearTimeout(overlay._timeout);
    overlay._timeout = setTimeout(() => {
      overlay.classList.remove(css('overlay-active'));
    }, 2000);
  };

  const createOverlay = (el) => {
    if (el._overlay) return el._overlay;

    const overlay = document.createElement('div');
    overlay.classList.add(css('overlay'));

    const wrapper = document.createElement('div');
    wrapper.classList.add(css('wrapper'));

    const parent = el.parentElement;
    if (!parent) return overlay;
    parent.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    wrapper.appendChild(overlay);

    el._overlay = overlay;
    return overlay;
  };

  try {
    GM_addStyle(style);
    loadConfig();
    GM_registerMenuCommand(t('menu.openConfig'), menu.popup);
    GM_registerMenuCommand(t('menu.resetConfig'), menu.reset);
    document.addEventListener('playing', handlePlaying, { capture: true });
    document.addEventListener('keydown', handleKeydown);
    observer.observe(document.body, { childList: true, subtree: true });
  } catch {
    console.warn(t('messages.notSupport'));
    document.removeEventListener('playing', handlePlaying);
    document.removeEventListener('keydown', handleKeydown);
    observer.disconnect();
  }
})();