import * as React from "react"
import { motion } from "framer-motion"
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Input,
  Spinner,
  Badge,
  useToast
} from "@/components/ui"
import { 
  Play, 
  Pause, 
  Download, 
  Heart, 
  Star, 
  Search, 
  Mail, 
  Lock,
  User,
  Trash2,
  Edit,
  Save
} from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
}

export function UiDemoPage() {
  const [loading, setLoading] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [inputError, setInputError] = React.useState("")
  const { toast } = useToast()

  const handleLoadingDemo = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 3000)
  }

  const handleInputValidation = (value: string) => {
    if (value.length > 0 && value.length < 3) {
      setInputError("Must be at least 3 characters")
    } else {
      setInputError("")
    }
    setInputValue(value)
  }

  const showToast = (variant: "default" | "success" | "warning" | "destructive") => {
    const messages = {
      default: { title: "Info", description: "This is a default toast message" },
      success: { title: "Success!", description: "Your action was completed successfully" },
      warning: { title: "Warning", description: "Please review your input" },
      destructive: { title: "Error", description: "Something went wrong" },
    }
    
    toast({
      variant,
      ...messages[variant],
      duration: 3000,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            UI Components Demo
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our accessible, responsive UI component library with Framer Motion animations
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Buttons Section */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Buttons</span>
                </CardTitle>
                <CardDescription>
                  Various button styles with loading states and icons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Button Variants */}
                <div className="grid grid-cols-2 gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success</Button>
                </div>

                {/* Button Sizes */}
                <div className="flex items-center space-x-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>

                {/* Button with Icons */}
                <div className="flex flex-wrap gap-2">
                  <Button leftIcon={<Download className="h-4 w-4" />}>
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    rightIcon={<Heart className="h-4 w-4" />}
                  >
                    Like
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    aria-label="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                {/* Loading Button */}
                <Button 
                  loading={loading} 
                  onClick={handleLoadingDemo}
                  className="w-full"
                >
                  {loading ? "Loading..." : "Start Loading Demo"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Inputs Section */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit className="h-5 w-5" />
                  <span>Inputs</span>
                </CardTitle>
                <CardDescription>
                  Form inputs with validation and accessibility features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input 
                  label="Basic Input"
                  placeholder="Enter some text..."
                />
                
                <Input 
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  required
                />
                
                <Input 
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  showPasswordToggle
                  leftIcon={<Lock className="h-4 w-4" />}
                />
                
                <Input 
                  label="With Validation"
                  value={inputValue}
                  onChange={(e) => handleInputValidation(e.target.value)}
                  error={inputError}
                  success={inputValue.length >= 3 && !inputError ? "Looks good!" : undefined}
                  placeholder="Type at least 3 characters"
                  leftIcon={<User className="h-4 w-4" />}
                />
                
                <Input 
                  label="Search"
                  placeholder="Search items..."
                  leftIcon={<Search className="h-4 w-4" />}
                  size="lg"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges Section */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Badges</span>
                </CardTitle>
                <CardDescription>
                  Status indicators and labels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Error</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="default">Default</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Spinners Section */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="animate-spin">
                    <Pause className="h-5 w-5" />
                  </div>
                  <span>Spinners</span>
                </CardTitle>
                <CardDescription>
                  Loading indicators in various sizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center space-x-8 py-8">
                  <div className="text-center space-y-2">
                    <Spinner size="sm" />
                    <p className="text-xs text-muted-foreground">Small</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Spinner size="default" />
                    <p className="text-xs text-muted-foreground">Default</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Spinner size="lg" />
                    <p className="text-xs text-muted-foreground">Large</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Spinner size="xl" />
                    <p className="text-xs text-muted-foreground">Extra Large</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Toast Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Toast Notifications</CardTitle>
                <CardDescription>
                  Portal-based notifications with different variants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => showToast("default")}
                  >
                    Default Toast
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => showToast("success")}
                  >
                    Success Toast
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => showToast("warning")}
                  >
                    Warning Toast
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => showToast("destructive")}
                  >
                    Error Toast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interactive Demo */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Demo</CardTitle>
                <CardDescription>
                  Try combining different components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-48">
                    <Input 
                      label="Your Name"
                      placeholder="Enter your name"
                      leftIcon={<User className="h-4 w-4" />}
                    />
                  </div>
                  <Button 
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save
                  </Button>
                  <Button 
                    variant="destructive"
                    size="icon"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Spinner size="sm" />
                    <span className="text-sm">Processing your request...</span>
                  </div>
                  <Badge variant="info">In Progress</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 p-6 bg-muted/30 rounded-lg"
        >
          <p className="text-muted-foreground">
            All components are built with accessibility in mind, including proper ARIA attributes, 
            keyboard navigation, and screen reader support.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
