import { useContext } from 'react'
import { LanguageContext, type LanguageContextType } from '@/contexts/LanguageContext'

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}


