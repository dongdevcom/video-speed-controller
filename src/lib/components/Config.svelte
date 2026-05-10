<script lang="ts">
  import { t, config, locales, locale } from '$lib/stores';
  import { LANGUAGES } from '$lib/constants';
  import { round } from '$lib/utils';

  /** Callback provided by the mount site (menu.ts) to properly unmount this component. */
  let { onclose }: { onclose: () => void } = $props();

  const initialLang = $state($config.lang);
  let delta = $state($config.delta);
  let decreaseKey = $state($config.key.decrease);
  let increaseKey = $state($config.key.increase);
  let resetKey = $state($config.key.reset);
  let lang = $state($config.lang);

  const isValidLocale = (value: unknown): value is string =>
    typeof value === 'string' && locales.includes(value);

  const handleLangChange = (e: Event) => {
    locale.set(lang);
  };

  const handleClose = () => {
    locale.set(initialLang);
    onclose();
  };

  const handleSave = () => {
    if (isNaN(delta) || delta < 0.1 || delta > 16) {
      alert($t('message.delta_error'));
      return;
    }

    const keyRegex = /^[a-zA-Z0-9]$/;
    if (
      !keyRegex.test(decreaseKey) ||
      !keyRegex.test(increaseKey) ||
      !keyRegex.test(resetKey)
    ) {
      alert($t('message.key_error'));
      return;
    }

    if (!isValidLocale(lang)) {
      alert($t('message.lang_error'));
      return;
    }

    config.update((cfg) => ({
      ...cfg,
      delta: round(delta),
      key: {
        decrease: decreaseKey.toLowerCase(),
        increase: increaseKey.toLowerCase(),
        reset: resetKey.toLowerCase(),
      },
      lang,
    }));

    locale.set(lang);
    alert($t('message.saved'));
    window.location.reload();
  };
</script>

<div>
  <div class="menu-container">
    <fieldset>
      <div class="menu-field">
        <label for="delta">{$t('popup.delta')}</label>
        <input
          id="delta"
          type="number"
          placeholder={$t('popup.input_delta')}
          min="0.1"
          max="16"
          step="0.1"
          bind:value={delta}
        />
      </div>

      <div class="menu-field">
        <label for="decrease-key">{$t('popup.decrease_key')}</label>
        <input
          id="decrease-key"
          type="text"
          placeholder={$t('popup.input_key')}
          maxlength="1"
          bind:value={decreaseKey}
        />
      </div>

      <div class="menu-field">
        <label for="increase-key">{$t('popup.increase_key')}</label>
        <input
          id="increase-key"
          type="text"
          placeholder={$t('popup.input_key')}
          maxlength="1"
          bind:value={increaseKey}
        />
      </div>

      <div class="menu-field">
        <label for="reset-key">{$t('popup.reset_key')}</label>
        <input
          id="reset-key"
          type="text"
          placeholder={$t('popup.input_key')}
          maxlength="1"
          bind:value={resetKey}
        />
      </div>

      <div class="menu-field">
        <label for="lang">{$t('popup.lang')}</label>
        <select id="lang" bind:value={lang} onchange={handleLangChange}>
          {#each locales as l}
            <option value={l}>{LANGUAGES[l as keyof typeof LANGUAGES]}</option>
          {/each}
        </select>
      </div>

      <div class="buttons">
        <button id="close" onclick={handleClose}>{$t('popup.close')}</button>
        <button id="save" onclick={handleSave}>{$t('popup.save')}</button>
      </div>
    </fieldset>
  </div>
</div>

<style>
  .menu-container {
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    background: #111;
    color: #fff;
    padding: 20px;
    z-index: 99999;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    font-family: 'Arial', sans-serif;
    font-size: 14px;
  }

  .menu-container fieldset {
    border: 1px solid #444;
    padding: 15px;
    border-radius: 8px;
    margin: 0;
  }

  .menu-container .menu-field {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .menu-container .menu-field label {
    flex: 0 0 200px;
    margin-bottom: 0;
    margin-right: 10px;
    color: #ddd;
    font-weight: bold;
  }

  .menu-container .menu-field input,
  .menu-container .menu-field select {
    flex: 1;
    padding: 8px;
    border: 1px solid #555;
    border-radius: 4px;
    background: #222;
    color: #fff;
    font-family: 'Arial', sans-serif;
    font-size: 14px;
  }

  .menu-container .menu-field input:focus,
  .menu-container .menu-field select:focus {
    outline: none;
    border-color: #007bff;
  }

  .menu-container .buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  .menu-container button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Arial', sans-serif;
    font-size: 14px;
  }

  .menu-container button#close {
    background: #dc3545;
    color: white;
  }

  .menu-container button#close:hover {
    background: #c82333;
  }

  .menu-container button#save {
    background: #007bff;
    color: white;
  }

  .menu-container button#save:hover {
    background: #0056b3;
  }
</style>
