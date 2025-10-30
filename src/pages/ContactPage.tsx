import * as React from "react"
import { motion } from "framer-motion"
import { 
  Mail, 
  Phone, 
  Globe,
  Send,
  ArrowLeft
} from "lucide-react"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Input
} from "@/components/ui"
import { useToast } from "@/hooks/useToast"
import { useLanguage } from "@/hooks/useLanguage"
import { logger } from "@/utils"
import { Link } from "react-router-dom"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
}

export function ContactPage() {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    document.title = t('contact.title') + " - Lusion AR"
  }, [t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Create mailto link to send email to haruntkepenek@gmail.com
      const mailtoLink = `mailto:haruntkepenek@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`
      
      // Open email client
      window.location.href = mailtoLink
      
      // Log form submission for debugging
      logger.info('Contact form submitted', { 
        name: formData.name, 
        email: formData.email, 
        subject: formData.subject,
        messageLength: formData.message.length 
      })
      
      // Show success toast
      toast({
        title: t('contact.messageSent'),
        description: t('contact.messageSuccess'),
        variant: "success"
      })
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      logger.error('Contact form error', { error })
      toast({
        title: t('contact.messageFailed'),
        description: t('contact.messageError'),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <Button asChild variant="ghost" className="mb-6 gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            {t('contact.backToHome')}
          </Link>
        </Button>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('contact.getInTouch')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t('contact.email')}</p>
                  <a 
                    href="mailto:muhammeda.kul@gmail.com" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    muhammeda.kul@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t('contact.phone')}</p>
                  <a 
                    href="tel:+905437711842" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +90 543 771 18 42
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t('contact.website')}</p>
                  <a 
                    href="https://lusion.app" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    lusion.app
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>{t('contact.sendMessage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t('contact.name')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('contact.namePlaceholder')}
                  required
                />
                
                <Input
                  label={t('contact.emailLabel')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('contact.emailPlaceholder')}
                  required
                />
                
                <Input
                  label={t('contact.subject')}
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t('contact.subjectPlaceholder')}
                  required
                />
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    {t('contact.message')} <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contact.messagePlaceholder')}
                    rows={4}
                    required
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                  />
                </div>
                
                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                  <Send className="h-4 w-4" />
                  {t('contact.sendMessage')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
