"use client";

import { useTranslationsDictionary } from "./translations-context";
import type { Dictionary } from "./dictionary-types";

export type { Dictionary };

/**
 * Active-language dictionary for client components.
 *
 * The dictionary is provided by `TranslationsProvider`, which receives it as a
 * prop from the server layout (selected from the `sanoori-lang` cookie). Because
 * the value is data — not an import — the inactive language never enters the
 * client bundle.
 */
export function useTranslations(): Dictionary {
  return useTranslationsDictionary();
}
