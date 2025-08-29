import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  QrCode
} from "lucide-react"
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui"

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
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

export function SimpleWelcomePage() {
  React.useEffect(() => {
    // Set document title for accessibility and SEO  
    document.title = "Welcome to Lusion AR Dining - Experience Food in 3D"
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.section 
        variants={itemVariants}
        className="text-center py-16"
        aria-labelledby="hero-title"
      >
        <div className="max-w-3xl mx-auto">
          <motion.h1 
            id="hero-title"
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            Experience <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold" 
                        style={{ 
                          WebkitBackgroundClip: 'text', 
                          WebkitTextFillColor: 'transparent',
                          backgroundImage: 'linear-gradient(to right, rgb(37 99 235), rgb(147 51 234))'
                        }}>Dining in AR</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Transform your restaurant experience with immersive augmented reality. 
            View our menu items in 3D before you order.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="gap-2">
                <Link to="/menu" aria-label="Explore our AR menu items">
                  Explore Menu
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild variant="outline" size="lg">
                <Link to="/ar-view" aria-label="Try AR dining experience">
                  Try AR Experience
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        variants={itemVariants}
        className="py-16"
        aria-labelledby="features-title"
      >
        <div className="text-center mb-12">
          <motion.h2 
            id="features-title"
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Why Choose AR Dining?
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            Our innovative AR technology brings your dining experience to the next level
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Sparkles,
              title: "Immersive Experience",
              description: "See your food in 3D before ordering. Get a realistic preview of every dish.",
              delay: 1.2
            },
            {
              icon: Smartphone,
              title: "Mobile Ready", 
              description: "Works seamlessly on iOS and Android devices. No app installation required.",
              delay: 1.4
            },
            {
              icon: QrCode,
              title: "Easy Access",
              description: "Simply scan a QR code to instantly view any menu item in augmented reality.",
              delay: 1.6
            }
          ].map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay, duration: 0.5 }}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <feature.icon 
                      className="h-12 w-12 text-primary mx-auto mb-4" 
                      aria-hidden="true"
                    />
                  </motion.div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        variants={itemVariants}
        className="py-16 text-center"
        aria-labelledby="cta-title"
      >
                  <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
          <Card className="max-w-2xl mx-auto hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle id="cta-title" className="text-2xl md:text-3xl">
                Ready to Get Started?
              </CardTitle>
              <CardDescription className="text-lg">
                Explore our full menu and experience the future of dining today.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/menu" aria-label="Browse our AR-enabled menu items">
                      Browse Menu Items
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link to="/about" aria-label="Learn more about us">
                      Learn More
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>
    </div>
  )
}
