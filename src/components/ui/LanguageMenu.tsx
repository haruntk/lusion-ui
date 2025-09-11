import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'
import { cn } from '@/utils'
import { useLanguage } from '@/hooks/useLanguage'

interface LanguageMenuProps {
  className?: string
}

export function LanguageMenu({ className }: LanguageMenuProps) {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('#lang-menu')) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <div id="lang-menu" className={cn('relative', className)}>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{lang}</span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 rounded-md border bg-background shadow-lg z-50"
            role="menu"
          >
            {(['en', 'tr', 'ar'] as const).map((l) => (
              <motion.button
                key={l}
                onClick={() => { setLang(l); setOpen(false) }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors',
                  lang === l ? 'text-foreground' : 'text-muted-foreground'
                )}
                role="menuitem"
                aria-current={lang === l}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="uppercase">{l}</span>
                {lang === l && <span>✓</span>}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


