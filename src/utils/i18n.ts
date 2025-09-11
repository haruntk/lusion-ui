import { type Item } from '@/types/item.schema'
import { type SupportedLanguage } from '@/contexts/LanguageContext'

export function getLocalizedText(
  base: string | undefined,
  translations: Record<string, string | undefined> | undefined,
  lang: SupportedLanguage
): string {
  if (!base && !translations) return ''
  if (lang === 'en') return base ?? ''
  const v = translations?.[lang]
  return (v && v.trim()) ? v : (base ?? '')
}

export function localizeItemFields(item: Item, lang: SupportedLanguage) {
  const tr = item.translations
  const mapping: Record<SupportedLanguage, any> = {
    en: {},
    tr: tr?.tr ?? {},
    ar: tr?.ar ?? {},
  }
  const loc = mapping[lang]
  return {
    name: getLocalizedText(item.name, { tr: loc.name, ar: loc.name }, lang),
    description: getLocalizedText(item.description, { tr: loc.description, ar: loc.description }, lang),
    category: getLocalizedText(item.category, { tr: loc.category, ar: loc.category }, lang),
  }
}


