import { en } from './en';
import { id } from './id';
import { RuneStore } from '@tauri-store/svelte';

export const dictionaries = { en, id };
export type LanguageCode = keyof typeof dictionaries;

export const languageSettings = new RuneStore<{ lang: LanguageCode }>(
  'languageSettings',
  { lang: 'en' },
  {
    saveOnChange: true,
    saveStrategy: 'debounce',
    saveInterval: 1000,
    autoStart: true,
  }
);

/**
 * Reactive translation lookup function.
 * Since this is a .ts file, we use a regular function.
 * Whenever `t()` is called directly inside a Svelte template or $derived block,
 * Svelte 5 will automatically track the dependency on `languageSettings.state.lang`.
 */
export function t(
  path: string,
  params: Record<string, string | number> = {}
): string {
  if (!languageSettings || !languageSettings.state) {
    return path;
  }

  const lang = languageSettings.state.lang;
  const dict = dictionaries[lang] || dictionaries.en;

  const keys = path.split('.');
  let value: any = dict;

  for (const key of keys) {
    value = value?.[key];
  }

  if (typeof value !== 'string') {
    return path; // Fallback to key path if not found
  }

  // Replace parameters {key} with values
  return value.replace(
    /{(\w+)}/g,
    (_, key) => params[key]?.toString() || `{${key}}`
  );
}
