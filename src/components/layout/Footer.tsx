import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Github, Twitter, Mail, Heart, Sparkles, Package, QrCode } from "lucide-react"
import { APP_CONFIG } from "@/utils/constants"

const footerLinks = {
  navigation: [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "AR Experience", href: "/ar-view" },
    { label: "About", href: "/about" },
  ],
  features: [
    { label: "3D Models", href: "/model-viewer", icon: <Package className="h-3 w-3" /> },
    { label: "QR Codes", href: "/qr", icon: <QrCode className="h-3 w-3" /> },
    { label: "AR Viewer", href: "/ar-view", icon: <Sparkles className="h-3 w-3" /> },
    { label: "Marker AR", href: "/marker", icon: <Sparkles className="h-3 w-3" /> },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
  social: [
    { label: "GitHub", href: "#", icon: <Github className="h-5 w-5" /> },
    { label: "Twitter", href: "#", icon: <Twitter className="h-5 w-5" /> },
    { label: "Email", href: "#", icon: <Mail className="h-5 w-5" /> },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Lusion
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {APP_CONFIG.DESCRIPTION}
            </p>
            <p className="text-xs text-muted-foreground">
              Transforming dining experiences with cutting-edge AR technology.
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
            <h3 className="text-sm font-semibold text-foreground">Navigation</h3>
            <div className="space-y-3">
              {footerLinks.navigation.map((link, index) => (
                <motion.div
                  key={`nav-${index}-${link.href}`}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Link
                    to={link.href}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">Features</h3>
            <div className="space-y-3">
              {footerLinks.features.map((link, index) => (
                <motion.div
                  key={`feature-${index}-${link.href}`}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Link
                    to={link.href}
                    className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Support & Social */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Support</h3>
              <div className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <motion.div
                    key={`support-${index}-${link.href}`}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <a
                      href={link.href}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Connect</h3>
              <div className="flex space-x-3">
                {footerLinks.social.map((social, index) => (
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
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_CONFIG.NAME}. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            >
              <Heart className="h-4 w-4 text-red-500 fill-current" />
            </motion.div>
            <span>using React & AR</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
