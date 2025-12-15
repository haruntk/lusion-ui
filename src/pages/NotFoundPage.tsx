import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, Search, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui"
import { useLanguage } from '@/hooks/useLanguage'

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export function NotFoundPage() {
  const location = useLocation()
  const attemptedPath = location.pathname
  const { t } = useLanguage()

  React.useEffect(() => {
    // Set document title for accessibility
    document.title = t('notFound.title') + ' - Lusion AR Dining'
  }, [])

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4"
    >
      <div className="max-w-lg mx-auto text-center">
        {/* 404 Animation */}
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="relative">
            <motion.div 
              className="text-8xl md:text-9xl font-bold text-primary/20 select-none"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              404
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <AlertTriangle className="h-16 w-16 text-muted-foreground" />
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('notFound.title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {t('notFound.desc1')}
          </p>
          {attemptedPath && (
            <p className="text-sm text-muted-foreground mb-8 font-mono bg-muted/50 px-3 py-1 rounded">
              {t('notFound.attemptedPath')} <span className="text-destructive">{attemptedPath}</span>
            </p>
          )}
          <p className="text-muted-foreground mb-8">
            {t('notFound.desc2')}
          </p>
        </motion.div>
        
        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg" className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" aria-hidden="true" />
                {t('common.goHome')}
              </Link>
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/models">
                <Search className="h-4 w-4" aria-hidden="true" />
                {t('common.browseModels')}
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">
            {t('notFound.needHelp')} 
            <Link 
              to="/contact" 
              className="text-primary hover:underline focus:underline focus:outline-none"
            >
              {t('notFound.contactUs')}
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
