import { GM_registerMenuCommand, GM_unregisterMenuCommand } from '$';
import { mount, unmount } from 'svelte';
import { get } from 'svelte/store';
import { t as i18n } from '$lib/stores';
import { resetDialog } from '$lib/content';
import { Config } from '$lib/components';

let menuId: string | number | undefined;
let resetId: string | number | undefined;
let configInstance: Record<string, unknown> | undefined;

/** Unmounts the currently open Config dialog, if any. */
export const closeConfig = (): void => {
  if (configInstance) {
    unmount(configInstance);
    configInstance = undefined;
  }
};

export const unregisterMenu = (): void => {
  if (menuId !== undefined) GM_unregisterMenuCommand(menuId);
  if (resetId !== undefined) GM_unregisterMenuCommand(resetId);
};

export const registerMenu = (): void => {
  const t = get(i18n);

  menuId = GM_registerMenuCommand(`🛠️ ${t('menu.open_config')}`, () => {
    if (configInstance) return; // prevent stacking duplicate dialogs
    configInstance = mount(Config, {
      target: document.body,
      props: { onclose: closeConfig },
    });
  });

  resetId = GM_registerMenuCommand(`🔄 ${t('menu.reset_config')}`, () => resetDialog());
};