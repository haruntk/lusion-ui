import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { messages } from '@/i18n'

export type SupportedLanguage = 'en' | 'tr' | 'ar'

export interface TranslationDict {
  [key: string]: string | TranslationDict
}

export interface LanguageContextType {
  lang: SupportedLanguage
  setLang: (lang: SupportedLanguage) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: React.ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    const stored = localStorage.getItem('lusion-lang') as SupportedLanguage | null
    if (stored === 'en' || stored === 'tr' || stored === 'ar') return stored
    return 'en'
  })

  const setLang = useCallback((newLang: SupportedLanguage) => {
    setLangState(newLang)
    localStorage.setItem('lusion-lang', newLang)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('lang', lang)
    const isRtl = lang === 'ar'
    root.setAttribute('dir', isRtl ? 'rtl' : 'ltr')
  }, [lang])

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const parts = key.split('.')
    let current: any = messages[lang]
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        current = undefined
        break
      }
    }
    let result = typeof current === 'string' ? current : key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }
    return result
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}


