// ==UserScript==
// @name         Video Speed Controller
// @namespace    https://github.com/dongdevcom/video-speed-controller/
// @version      1.0.6
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
  const type = Object.freeze({
    increase: 1,
    decrease: 2,
    reset: 3
  });
  const prefix = 'dd-vid-speed';
  const style = `
      .${prefix}-overlay {
        display: flex;
        gap: 4px;
        position: absolute;
        top: 60px;
        left: 10px;
        z-index: 9999;
        background: rgba(0,0,0,0.6);
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
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

      .${prefix}-overlay-text {
        display: flex;
        gap: 2px;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }

      .${prefix}-overlay-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.65);
        border-radius: 5px;
        width: 18px;
        height: 18px;
        cursor: pointer;
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

  const svgs = {
    [type.increase]: [
      { stroke: 'white', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M4 12H20M12 4V20' }
    ],
    [type.decrease]: [
      { stroke: 'white', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M6 12L18 12' }
    ],
    [type.reset]: [
      { stroke: 'white', d: 'M22.719 12A10.719 10.719 0 0 1 1.28 12h.838a9.916 9.916 0 1 0 1.373-5H8v1H2V2h1v4.2A10.71 10.71 0 0 1 22.719 12z' }
    ],
    speed: [
      { stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round', d: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2' },
      { stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-dasharray': '4 3', opacity: '0.5', d: 'M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.97715 2 12.5 2' },
      { stroke: 'white', 'stroke-width': '1.5', d: 'M15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868L9 9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941Z' }
    ]
  };

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

  const h = ({ tag, attrs = {}, children = [] }) => {
    const el = ['svg', 'path'].indexOf(tag) > -1
      ? document.createElementNS('http://www.w3.org/2000/svg', tag)
      : document.createElement(tag);

    Object.entries(attrs ?? {}).forEach(([k, v]) => el.setAttribute(k, v));
    if (!Array.isArray(children)) {
      children = [children]
    }
    children?.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      } else if (Array.isArray(child)) {
        child.forEach(c => c && el.appendChild(c));
      } else {
        el.appendChild(h(child));
      }
    });
    return el;
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
        alert(t('messages.resetDone'));
        window.location.reload();
      }
    },
    popup: () => {
      const fieldset = [
        {
          tag: 'div', attrs: { class: css('field') },
          children: [
            { tag: 'label', attrs: { for: html('delta') }, children: t('popup.delta') },
            { tag: 'input', attrs: { id: html('delta'), type: 'number', placeholder: t('popup.inputDelta'), min: '0.1', max: '16', step: '0.1', value: config.delta } }
          ]
        },
        {
          tag: 'div', attrs: { class: css('field') },
          children: [
            { tag: 'label', attrs: { for: html('decrease-key') }, children: t('popup.decreaseKey') },
            { tag: 'input', attrs: { id: html('decrease-key'), type: 'text', placeholder: t('popup.inputKey'), value: config.key.decrease, maxLength: 1 } }
          ]
        },
        {
          tag: 'div', attrs: { class: css('field') },
          children: [
            { tag: 'label', attrs: { for: html('increase-key') }, children: t('popup.increaseKey') },
            { tag: 'input', attrs: { id: html('increase-key'), type: 'text', placeholder: t('popup.inputKey'), value: config.key.increase, maxLength: 1 } }
          ]
        },
        {
          tag: 'div', attrs: { class: css('field') },
          children: [
            { tag: 'label', attrs: { for: html('reset-key') }, children: t('popup.resetKey') },
            { tag: 'input', attrs: { id: html('reset-key'), type: 'text', placeholder: t('popup.inputKey'), value: config.key.reset, maxLength: 1 } }
          ]
        },
        {
          tag: 'div', attrs: { class: css('field') },
          children: [
            { tag: 'label', attrs: { for: html('lang') }, children: t('popup.lang') },
            {
              tag: 'select', attrs: { id: html('lang'), name: html('lang') }, children: [
                { tag: 'option', attrs: { value: 'en', selected: config.lang === 'en' }, children: 'English' },
                { tag: 'option', attrs: { value: 'vi', selected: config.lang === 'vi' }, children: 'Tiếng Việt' }
              ]
            }
          ]
        },
        {
          tag: 'div', attrs: { class: css('buttons') },
          children: [
            { tag: 'button', attrs: { id: html('close') }, children: t('popup.close') },
            { tag: 'button', attrs: { id: html('save') }, children: t('popup.save') }
          ]
        }
      ];
      const fieldsetEl = h({ tag: 'fieldset', children: fieldset.map(f => h(f)) });
      const container = h({ tag: 'div', attrs: { class: css('menu-container') }, children: [fieldsetEl] });
      document.body.appendChild(container);

      const getElement = (id) => document.getElementById(html(id));
      const getInputValue = (id) => getElement(id)?.value?.trim();

      getElement('close').onclick = () => {
        container.remove();
      };

      getElement('save').onclick = () => {
        const deltaVal = parseFloat(getInputValue('delta'));
        if (isNaN(deltaVal) || deltaVal < 0.1 || deltaVal > 16) {
          alert(t('messages.deltaError'));
          return;
        }
        const decreaseKey = getInputValue('decrease-key');
        const increaseKey = getInputValue('increase-key');
        const resetKey = getInputValue('reset-key');
        const keyRegex = /^[a-zA-Z0-9]$/;
        if (!keyRegex.test(decreaseKey) || !keyRegex.test(increaseKey) || !keyRegex.test(resetKey)) {
          alert(t('messages.keyError'));
          return;
        }
        const langVal = getInputValue('lang');
        if (!['en', 'vi'].includes(langVal)) {
          alert(t('messages.langError'));
          return;
        }

        saveConfig('delta', deltaVal);
        saveConfig('key.decrease', decreaseKey.toLowerCase());
        saveConfig('key.increase', increaseKey.toLowerCase());
        saveConfig('key.reset', resetKey.toLowerCase());
        saveConfig('lang', langVal);

        container.remove();
        alert(t('messages.saved'));
        window.location.reload();
      };
    }
  };

  const getVideos = () => document.querySelectorAll('video');

  const applyPlaybackRate = (rate) => {
    getVideos().forEach(el => {
      if (el && typeof el.playbackRate === 'number' && (el.playbackRate !== rate || !el._initOverlay)) {
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

    switch (key) {
      case config.key.decrease:
        playbackRateHandle(type.decrease);
        break;
      case config.key.increase:
        playbackRateHandle(type.increase);
        break;
      case config.key.reset:
        playbackRateHandle(type.reset);
        break;
      default:
        return;
    }
  };

  const playbackRateHandle = (t) => {
    const currentRate = getCurrentRate(getVideos());
    let rate = 1.0;
    if (t === type.increase) {
      rate = Math.max(0.1, Math.min(currentRate + config.delta, 16));
    }
    if (t === type.decrease) {
      rate = Math.max(0.1, Math.min(currentRate - config.delta, 16));
    }
    saveConfig(`rates.${getSiteId()}`, rate);
    applyPlaybackRate(rate);
  };

  const observer = new MutationObserver(() => {
    applyPlaybackRate(config.rate);
  });

  const updateOverlay = (el, rate) => {
    const { overlay, text } = createOverlay(el);
    text.textContent = rate.toFixed(1);
    overlay.classList.add(css('overlay-active'));

    clearTimeout(overlay._timeout);
    overlay._timeout = setTimeout(() => {
      overlay.classList.remove(css('overlay-active'));
    }, 2000);
  };

  const createIcon = (name, size) => {
    return h({ tag: 'svg', attrs: { viewBox: '0 0 24 24', width: size, height: size }, children: svgs[name].map(attrs => h({ tag: 'path', attrs })) });
  };

  const createOverlay = (el) => {
    if (el._initOverlay) {
      return { overlay: el._overlay, text: el._text };
    }

    const createButton = (t) => {
      const button = h({ tag: 'div', attrs: { class: css('overlay-button') }, children: [createIcon(t, '14px')] });
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        playbackRateHandle(t);
      });
      return button;
    };

    const text = h({ tag: 'span' });
    const overlay = h({
      tag: 'div', attrs: { class: css('overlay') }, children: [
        { tag: 'div', attrs: { class: css('overlay-text') }, children: [createIcon('speed', '16px'), text] },
        createButton(type.decrease),
        createButton(type.reset),
        createButton(type.increase)
      ]
    });
    const wrapper = h({ tag: 'div', attrs: { class: css('wrapper') }, children: overlay });

    const parent = el.parentElement;
    if (parent) {
      parent.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    }

    el._overlay = overlay;
    el._text = text;
    el._initOverlay = true;
    return { overlay: el._overlay, text: el._text };
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