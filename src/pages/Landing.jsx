import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Building2,
  Calendar,
  BarChart3,
  Target,
  Users,
  ArrowRight,
  CheckCircle,
  Brain,
  Workflow,
  Star,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Sparkles,
  Clock,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Award,
  BookOpen,
  Headphones
} from "lucide-react";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import { Activity } from "@/api/entities";
import { Notification } from "@/api/entities";

const features = [
  {
    icon: Brain,
    title: "AI Content Creation",
    description: "Generate engaging content for all platforms with advanced AI. Save 10+ hours weekly on content creation."
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Plan and schedule posts across multiple platforms. Never miss the perfect posting time again."
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track performance with real-time analytics. Make data-driven decisions that drive results."
  },
  {
    icon: Target,
    title: "CRM & Leads",
    description: "Manage leads, deals, and customers in one place. Increase conversion rates by 40%."
  },
  {
    icon: Workflow,
    title: "Task Management",
    description: "Organize campaigns with Kanban boards and automated workflows for maximum efficiency."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Collaborate seamlessly with team members, assign tasks, and track progress in real-time."
  }
];

const platformFeatures = [
  {
    category: "Content & Creation",
    features: [
      { name: "AI Content Generator", description: "Generate posts, captions, and copy instantly" },
      { name: "Brand Asset Library", description: "Centralized storage for all brand assets" },
      { name: "Content Templates", description: "Pre-designed templates for quick creation" },
      { name: "Multi-format Export", description: "Export content in various formats and sizes" }
    ]
  },
  {
    category: "Social Media Management", 
    features: [
      { name: "Multi-Platform Posting", description: "Schedule across all major platforms" },
      { name: "Hashtag Optimization", description: "AI-powered hashtag suggestions" },
      { name: "Engagement Monitoring", description: "Track comments, likes, and shares" },
      { name: "Competitor Analysis", description: "Monitor competitor performance" }
    ]
  },
  {
    category: "CRM & Sales",
    features: [
      { name: "Lead Management", description: "Capture and nurture leads effectively" },
      { name: "Deal Pipeline", description: "Visual sales pipeline management" },
      { name: "Contact Database", description: "Centralized customer information" },
      { name: "Sales Automation", description: "Automate follow-ups and sequences" }
    ]
  },
  {
    category: "Analytics & Reporting",
    features: [
      { name: "Performance Dashboard", description: "Real-time marketing metrics" },
      { name: "ROI Tracking", description: "Measure return on marketing investment" },
      { name: "Custom Reports", description: "Generate detailed performance reports" },
      { name: "Predictive Analytics", description: "AI-powered performance forecasting" }
    ]
  }
];

const integrations = [
  { name: "Google Analytics", logo: "📊" },
  { name: "Facebook Ads", logo: "📘" },
  { name: "Instagram", logo: "📷" },
  { name: "LinkedIn", logo: "💼" },
  { name: "Twitter", logo: "🐦" },
  { name: "YouTube", logo: "📺" },
  { name: "Slack", logo: "💬" },
  { name: "Zapier", logo: "⚡" }
];

const stats = [
  { number: "15hrs", label: "Saved Weekly" },
  { number: "3.5x", label: "Faster Creation" },
  { number: "67%", label: "More Leads" },
  { number: "99.9%", label: "Uptime" }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director at TechFlow",
    content: "Marketing OS transformed our workflow completely. We cut content creation time from 25 hours to just 3 hours per week.",
    rating: 5
  },
  {
    name: "Michael Rodriguez", 
    role: "CMO at GrowthLabs",
    content: "The unified dashboard increased our team's productivity by 300%. Having everything in one place is a game-changer.",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Social Media Manager at BrandStudio",
    content: "The AI content generator understands our brand perfectly and creates posts that get 2x more engagement.",
    rating: 5
  },
  {
    name: "David Park",
    role: "Marketing Manager at StartupCo",
    content: "Best marketing tool we've used. The ROI tracking and analytics alone justify the investment.",
    rating: 5
  },
  {
    name: "Lisa Thompson",
    role: "Content Creator at MediaHouse",
    content: "Scheduling across multiple platforms has never been easier. The AI timing optimization works perfectly.",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Founder at InnovateLab",
    content: "Marketing OS replaced 8 different tools for us. The cost savings and efficiency gains are incredible.",
    rating: 5
  }
];

const faqs = [
  {
    question: "How does the AI content creation work?",
    answer: "Our AI analyzes your brand voice, previous content, and current trends to generate engaging posts, captions, and marketing copy. It learns from your feedback to improve over time."
  },
  {
    question: "Can I connect all my social media accounts?",
    answer: "Yes! Marketing OS supports Instagram, Facebook, Twitter, LinkedIn, YouTube, Pinterest, and more. Connect all your accounts and manage them from one dashboard."
  },
  {
    question: "Is there a free trial?",
    answer: "Absolutely! We offer a 14-day free trial with full access to all features. No credit card required to get started."
  },
  {
    question: "How does team collaboration work?",
    answer: "Create a company workspace and invite team members using a unique company code. Assign tasks, collaborate on content, and track everyone's progress in real-time."
  },
  {
    question: "What kind of analytics do you provide?",
    answer: "Get comprehensive analytics including engagement rates, reach, click-through rates, conversion tracking, and AI-powered insights to optimize your marketing strategy."
  },
  {
    question: "Can I import my existing data?",
    answer: "Yes! You can import contacts, leads, and customer data from CSV files or connect with popular CRM tools to migrate your existing data seamlessly."
  },
  {
    question: "How secure is my data?",
    answer: "We use enterprise-grade security with 256-bit SSL encryption, regular backups, and SOC 2 compliance. Your data is completely secure and private."
  },
  {
    question: "Do you offer customer support?",
    answer: "Yes! We provide 24/7 customer support via chat, email, and phone. Our team of experts is always ready to help you succeed."
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [companyCode, setCompanyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  // Rate limiting state
  const [lastApiCall, setLastApiCall] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Rate limiting helper
  const withRateLimit = async (apiCall, minDelay = 1000) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    
    if (timeSinceLastCall < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastCall));
    }
    
    setLastApiCall(Date.now());
    
    try {
      const result = await apiCall();
      setRetryCount(0);
      return result;
    } catch (error) {
      if (error.response?.status === 429 || error.message?.includes('429') || error.message?.includes('Rate limit')) {
        const delay = Math.min(2000 * Math.pow(2, retryCount), 15000);
        setRetryCount(prev => prev + 1);
        console.warn(`Rate limit hit, retrying in ${delay}ms, retryCount: ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        if (retryCount < 3) {
          return withRateLimit(apiCall, minDelay);
        } else {
          throw new Error("Max retries exceeded due to rate limiting");
        }
      }
      throw error;
    }
  };

  const handleCreateCompany = () => {
    navigate(createPageUrl("CompanyOnboarding"));
  };

  const handleJoinCompany = async () => {
    if (!companyCode.trim()) {
      setError("Please enter a company code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Looking for company with code:", companyCode.trim().toUpperCase());
      
      // Get current user info with rate limiting
      const currentUser = await withRateLimit(() => User.me(), 1000);
      console.log("Current user:", currentUser.email);
      
      // Get all companies and find the one with matching unique_code with rate limiting
      const allCompanies = await withRateLimit(() => Company.list(), 2000);
      console.log("Total companies found:", allCompanies.length);
      
      const matchingCompany = allCompanies.find(company => 
        company.unique_code && company.unique_code.toUpperCase() === companyCode.trim().toUpperCase()
      );
      
      if (!matchingCompany) {
        console.log("No matching company found for code:", companyCode.trim().toUpperCase());
        setError("Invalid company code. Please check and try again.");
        setIsLoading(false);
        return;
      }

      console.log("Found company:", matchingCompany.name, "- Updating user...");
      
      // Update user to join the company with rate limiting
      await withRateLimit(() => User.updateMyUserData({ 
        company_id: matchingCompany.id
      }), 2000);
      
      console.log("User updated successfully. Creating activity log...");
      
      // Create activity log entry with rate limiting
      try {
        await withRateLimit(() => Activity.create({
          description: `<strong>${currentUser.full_name || currentUser.email}</strong> joined the company using invite code.`,
          type: "create",
          entity_type: "User",
          entity_title: currentUser.full_name || currentUser.email,
          user_name: currentUser.full_name || currentUser.email,
          company_id: matchingCompany.id
        }), 1000);

        // Save join history - update company members list to include this user
        const updatedMembers = matchingCompany.members || [];
        if (!updatedMembers.includes(currentUser.email)) {
          updatedMembers.push(currentUser.email);
          await withRateLimit(() => Company.update(matchingCompany.id, { 
            members: updatedMembers 
          }), 1000);
        }
        
        // Notify existing team members with rate limiting
        const teamMembers = await withRateLimit(() => User.filter({ company_id: matchingCompany.id }), 2000);
        
        // Batch notifications to avoid rate limiting
        const notifications = [];
        for (const member of teamMembers) {
          if (member.email !== currentUser.email) {
            notifications.push({
              user_email: member.email,
              title: "New Team Member!",
              body: `${currentUser.full_name || currentUser.email} has joined your workspace using invite code ${companyCode.trim().toUpperCase()}.`,
              url: createPageUrl("Team"),
              company_id: matchingCompany.id
            });
          }
        }
        
        // Create notifications in batches with delays
        for (let i = 0; i < notifications.length; i++) {
          await withRateLimit(() => Notification.create(notifications[i]), 500);
          // Small delay between notifications
          if (i < notifications.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
      } catch (activityError) {
        console.warn("Failed to create activity log:", activityError);
        // Continue even if activity creation fails
      }
      
      console.log("Redirecting to dashboard...");
      
      // Force a page reload to ensure fresh data
      window.location.href = createPageUrl("Dashboard");
      
    } catch (error) {
      console.error("Failed to join company:", error);
      if (error.message.includes("Max retries exceeded")) {
        setError("System is busy. Please wait a moment and try again.");
      } else {
        setError("Failed to join company. Please try again.");
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Standalone Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Marketing OS</h1>
                <p className="text-xs text-gray-500">All-in-One Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={handleCreateCompany} className="bg-purple-600 hover:bg-purple-700 text-white">
                Create Company
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsJoinModalOpen(true)}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Company
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 mb-6">
            AI-Powered Marketing Suite
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your
            <br />
            <span className="relative inline-block mx-2">
              <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent relative">
                Marketing
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse opacity-0 hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              </span>
            </span>
            Workflow
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            One platform to create content, schedule posts, manage leads, track analytics, and collaborate with your team. Replace 12+ tools with Marketing OS.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button onClick={handleCreateCompany} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setIsJoinModalOpen(true)}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-3"
            >
              <Users className="w-5 h-5 mr-2" />
              Join Your Team
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-gray-100 hover:border-gray-200 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to streamline your marketing workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-100 hover:border-gray-200 transition-all duration-200 group">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                    <feature.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Feature Breakdown */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Marketing Solution
            </h2>
            <p className="text-xl text-gray-600">
              Explore all the powerful features that make Marketing OS your all-in-one platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {platformFeatures.map((category, index) => (
              <Card key={index} className="border-gray-100 bg-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">{category.category}</h3>
                  <div className="space-y-4">
                    {category.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900">{feature.name}</h4>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Journey - Redesigned */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Path to Marketing Success
            </h2>
            <p className="text-xl text-gray-600">
              See how leading companies achieve remarkable results with Marketing OS
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200 -translate-y-1/2" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative z-10">
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <Badge className="bg-purple-50 text-purple-700 mb-4">Setup</Badge>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Quick Onboarding</h3>
                    <p className="text-gray-600 mb-6">
                      Set up your workspace in under 5 minutes. Import existing data, connect your accounts, and invite your team.
                    </p>
                    <div className="text-sm text-purple-600 font-medium">Average setup time: 5 minutes</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative z-10">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <Badge className="bg-blue-50 text-blue-700 mb-4">Optimize</Badge>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI-Powered Growth</h3>
                    <p className="text-gray-600 mb-6">
                      Let AI analyze your performance and suggest optimizations. Create content 10x faster with smart automation.
                    </p>
                    <div className="text-sm text-blue-600 font-medium">10x faster content creation</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative z-10">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-center">
                    <Badge className="bg-green-50 text-green-700 mb-4">Scale</Badge>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Measure Results</h3>
                    <p className="text-gray-600 mb-6">
                      Track ROI with advanced analytics. See 67% average increase in qualified leads within first month.
                    </p>
                    <div className="text-sm text-green-600 font-medium">67% more qualified leads</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Connects With Your Favorite Tools
            </h2>
            <p className="text-xl text-gray-600">
              Seamlessly integrate with the platforms and tools you already use
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{integration.logo}</div>
                <div className="text-sm font-medium text-gray-700">{integration.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Testimonials */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 mb-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Marketing Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of professionals who've transformed their workflow
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex animate-scroll space-x-6" style={{
            animation: 'scroll 30s linear infinite',
            width: 'calc(400px * 12)'
          }}>
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card key={index} className="flex-shrink-0 w-80 border-gray-100 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Marketing OS
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-gray-100 bg-white">
                <Collapsible open={openFaq === index} onOpenChange={() => setOpenFaq(openFaq === index ? null : index)}>
                  <CollapsibleTrigger asChild>
                    <CardContent className="p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.question}</h3>
                        {openFaq === index ? (
                          <Minus className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Plus className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Support */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-gray-100 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Enterprise Security</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">SOC 2 Type II compliant</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Regular security audits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">GDPR compliant</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">24/7 Support</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Live chat support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Video onboarding calls</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Comprehensive documentation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Marketing strategy consultations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of marketing teams using Marketing OS to save time and drive results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={handleCreateCompany}
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3"
            >
              Start Your Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setIsJoinModalOpen(true)}
              className="border-white text-white hover:bg-white/10 px-8 py-3"
            >
              <Users className="w-5 h-5 mr-2" />
              Join Your Team
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-purple-100 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">Marketing OS</span>
            </div>
          </div>
          
          <div className="text-center text-sm">
            © 2024 Marketing OS. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Join Company Modal */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Join Your Team
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Enter your team's unique company code to join their workspace.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Enter company code (e.g., ABC123)"
                  value={companyCode}
                  onChange={(e) => {
                    setCompanyCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={10}
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                )}
              </div>

              <Button 
                onClick={handleJoinCompany}
                disabled={isLoading || !companyCode.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? "Joining..." : "Join Company"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">
                Don't have a company code?
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsJoinModalOpen(false);
                  handleCreateCompany();
                }}
                className="w-full"
                disabled={isLoading}
              >
                Create New Company
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}