import { GM_registerMenuCommand, GM_unregisterMenuCommand } from '$';
import { mount, unmount } from 'svelte';
import { get } from 'svelte/store';
import { t as i18n, config } from '$lib/stores';
import { Config } from '$lib/components';

export class MenuController {
  private ids: (string | number)[] = [];
  private configInstance: Record<string, unknown> | undefined;

  /** Unmounts the currently open Config dialog, if any. */
  private closeConfig = (): void => {
    if (this.configInstance) {
      unmount(this.configInstance);
      this.configInstance = undefined;
    }
  };

  public unregisterMenu = (): void => {
    this.ids.forEach(id => GM_unregisterMenuCommand(id));
  };

  public registerMenu = (): void => {
    const t = get(i18n);

    const exclusionText = config.disabled()
      ? `✅ ${t('menu.exclusion_remove')}`
      : `🚫 ${t('menu.exclusion_add')}`;
    this.ids.push(
      GM_registerMenuCommand(exclusionText, () => {
        if (config.disabled()) {
          config.enable();
          alert(t('message.exclusion_removed'));
        } else {
          config.disable();
          alert(t('message.exclusion_added'));
        }
        window.location.reload();
      })
    );

    this.ids.push(
      GM_registerMenuCommand(`🛠️ ${t('menu.open_config')}`, () => {
        if (this.configInstance) return; // prevent stacking duplicate dialogs
        this.configInstance = mount(Config, {
          target: document.body,
          props: { onclose: this.closeConfig },
        });
      })
    );

    /** Prompts the user for confirmation, resets config, and reloads the page. */
    this.ids.push(
      GM_registerMenuCommand(`🔄 ${t('menu.reset_config')}`, () => {
        if (confirm(t('message.reset_confirm'))) {
          config.reset();
          alert(t('message.reset_done'));
          window.location.reload();
        }
      })
    );
  };
}