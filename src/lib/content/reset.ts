import { get } from 'svelte/store';
import { config, t as i18n } from '$lib/stores';
import { DEFAULT_CONFIG } from '$lib/constants';

/** Resets all configuration to factory defaults. */
export const reset = (): void => {
  config.update(() => DEFAULT_CONFIG);
};

/** Prompts the user for confirmation, resets config, and reloads the page. */
export const resetDialog = (): void => {
  const t = get(i18n);
  if (confirm(t('message.reset_confirm'))) {
    reset();
    alert(t('message.reset_done'));
    window.location.reload();
  }
};