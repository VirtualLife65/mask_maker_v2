import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Layers, 
  Palette, 
  Download,
  Zap,
  Eye,
  Move,
  ArrowRight,
  CheckCircle,
  Upload,
  Wand2
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Wand2,
      title: 'AI-Powered Segmentation',
      description: 'Automatically detect and segment objects in your images with cutting-edge AI technology.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Layers,
      title: 'Advanced Layer Management',
      description: 'Professional layer system with visibility controls, locking, and easy organization.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Palette,
      title: 'Smart Color Editing',
      description: 'Change colors of any segmented object with precision using our intuitive color picker.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Move,
      title: 'Transform & Resize',
      description: 'Move, scale, and transform individual objects while maintaining perfect quality.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Eye,
      title: 'Non-Destructive Editing',
      description: 'All edits are non-destructive. Toggle visibility and make changes without losing data.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Download,
      title: 'Professional Export',
      description: 'Export your masterpiece in multiple formats including SVG and PSD for further editing.',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Your Image',
      description: 'Drag and drop or select any PNG or JPEG image to get started.',
      icon: Upload
    },
    {
      step: '02', 
      title: 'AI Segmentation',
      description: 'Our AI automatically detects and segments objects in your image.',
      icon: Sparkles
    },
    {
      step: '03',
      title: 'Edit & Transform',
      description: 'Edit colors, move objects, and create your perfect composition.',
      icon: Palette
    },
    {
      step: '04',
      title: 'Export & Share',
      description: 'Download your edited image in professional formats.',
      icon: Download
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">AI Editor</span>
          </div>
          
          <Button
            onClick={() => navigate('/editor')}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
          >
            Start Editing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              Image Editing
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your photos with intelligent segmentation and professional editing tools. 
              Edit like a pro with the power of artificial intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/editor')}
                className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow text-lg px-8 py-6"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Editing Now
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/5"
              >
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Professional-grade tools powered by AI to help you create stunning visuals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="p-6 h-full bg-surface border-border hover:border-primary/30 transition-all">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-surface/30">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get professional results in just four simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-surface border-2 border-primary rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            className="text-center bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-2xl p-12 border border-primary/20"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Images?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of creators using AI-powered editing to bring their vision to life
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Professional results</span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => navigate('/editor')}
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow text-lg px-12 py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">AI Editor</span>
          </div>
          <p className="text-muted-foreground">
            Professional AI-powered image editing for everyone
          </p>
        </div>
      </footer>
    </div>
  );
};