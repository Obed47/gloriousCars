import type { Locale } from "../locales";
import { en, type Dictionary } from "./en";
import { fr } from "./fr";

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { en, fr };
