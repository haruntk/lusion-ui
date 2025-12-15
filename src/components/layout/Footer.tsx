import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Github, Twitter, Mail, Heart } from "lucide-react"
import { APP_CONFIG } from "@/utils/constants"
import { useLanguage } from "@/hooks/useLanguage"

const baseFooterLinks = {
  navigation: [
    { key: "common.home", href: "/" },
    { key: "common.models", href: "/models" },
    { key: "common.tryModel", href: "/try-model" },
    { key: "common.about", href: "/about" },
  ],
  support: [
    { key: "footer.helpCenter", href: "#" },
    { key: "footer.privacyPolicy", href: "#" },
    { key: "footer.termsOfService", href: "#" },
    { key: "footer.contactUs", href: "/contact" },
  ],
  social: [
    { label: "GitHub", href: "#", icon: <Github className="h-5 w-5" /> },
    { label: "Twitter", href: "#", icon: <Twitter className="h-5 w-5" /> },
    { label: "Email", href: "#", icon: <Mail className="h-5 w-5" /> },
  ],
}

export function Footer() {
  const { t } = useLanguage()
  
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-20 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-sm">Lusion</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {APP_CONFIG.DESCRIPTION}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('footer.transformingExperiences')}
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">{t('footer.navigation')}</h3>
            <div className="space-y-3">
              {baseFooterLinks.navigation.map((link, index) => (
                <motion.div
                  key={`nav-${index}-${link.href}`}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Link
                    to={link.href}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {t(link.key)}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Support & Social */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t('footer.support')}</h3>
              <div className="space-y-3">
                {baseFooterLinks.support.map((link, index) => (
                  <motion.div
                    key={`support-${index}-${link.href}`}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <a
                      href={link.href}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {t(link.key)}
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t('footer.connect')}</h3>
              <div className="flex space-x-3">
                {baseFooterLinks.social.map((social, index) => (
                  <motion.a
                    key={`social-${index}-${social.label}`}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-primary transition-all duration-200"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0"
        >
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} {APP_CONFIG.NAME}. {t('footer.allRightsReserved')}</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
