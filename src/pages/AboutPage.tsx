import * as React from "react"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  Users, 
  Target, 
  Award,
  ArrowRight,
  Mail
} from "lucide-react"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge
} from "@/components/ui"
import { Link } from "react-router-dom"
import { useLanguage } from '@/hooks/useLanguage'

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

export function AboutPage() {
  const { t } = useLanguage()
  React.useEffect(() => {
    document.title = t('about.title') + ' - Lusion AR Dining'
  }, [])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto px-4 py-8"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="text-center py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold" 
                        style={{ 
                          WebkitBackgroundClip: 'text', 
                          WebkitTextFillColor: 'transparent',
                          backgroundImage: 'linear-gradient(to right, rgb(37 99 235), rgb(147 51 234))',
                          // @ts-ignore - fallbacks is not a valid property
                          fallbacks: [{ color: 'rgb(37 99 235)' }]
                        }}>About</span>
          </h1>
          <div className="flex justify-center mb-6">
            <img 
              src="/logos/clean_text.png" 
              alt="Lusion Logo" 
              className="h-20 md:h-24 w-auto object-contain"
            />
          </div>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {t('about.heroParagraph')}
          </p>
        </div>
      </motion.section>

      {/* Mission & Vision */}
      <motion.section variants={itemVariants} className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="h-full">
            <CardHeader>
              <Target className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">{t('about.missionTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.missionText')}
              </p>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">{t('about.visionTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.visionText')}
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section variants={itemVariants} className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('about.featuresTitle')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('about.featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Award,
              title: t('about.featureIndustry'),
              description: t('about.featureIndustryDesc'),
              badge: "Innovation"
            },
            {
              icon: Users,
              title: t('about.featureCustomer'),
              description: t('about.featureCustomerDesc'),
              badge: "UX Excellence"
            },
            {
              icon: Sparkles,
              title: t('about.featureTech'),
              description: t('about.featureTechDesc'),
              badge: "Technology"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="text-center h-full">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="space-y-2">
                    <CardTitle>{feature.title}</CardTitle>
                    <Badge variant="secondary">{feature.badge}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact CTA */}
      <motion.section variants={itemVariants} className="py-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{t('about.contactTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              {t('about.contactDesc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="gap-2">
                <Link to="/contact">
                  <Mail className="h-4 w-4" />
                  {t('about.contactUs')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/menu">
                  <ArrowRight className="h-4 w-4" />
                  {t('about.tryMenu')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  )
}
