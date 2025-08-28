
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Target, TrendingUp, Users, Calendar, Copy, AlertCircle, FileText } from "lucide-react"; // Import FileText for export functionality
import { InvokeLLM } from "@/api/integrations";
import Loader from "../components/ui/Loader";

export default function AICoach() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [error, setError] = useState("");

  const [businessDetails, setBusinessDetails] = useState({
    business_name: "",
    industry: "",
    business_type: "",
    target_audience: "",
    current_challenges: "",
    goals: "",
    budget_range: "",
    timeline: "",
    current_marketing: "",
    team_size: ""
  });

  const [planType, setPlanType] = useState("");

  const industries = [
    "Technology & Software",
    "E-commerce & Retail",
    "Healthcare",
    "Finance & Banking",
    "Real Estate",
    "Education",
    "Food & Beverage",
    "Consulting",
    "Manufacturing",
    "Non-profit",
    "Other"
  ];

  const businessTypes = [
    "Startup",
    "Small Business",
    "Medium Enterprise",
    "Large Corporation",
    "Freelancer/Consultant",
    "Agency"
  ];

  const budgetRanges = [
    "Under $1,000/month",
    "$1,000 - $5,000/month",
    "$5,000 - $15,000/month",
    "$15,000 - $50,000/month",
    "Over $50,000/month"
  ];

  const timelines = [
    "30 days (Quick wins)",
    "90 days (Quarter plan)",
    "6 months (Mid-term strategy)",
    "12 months (Annual plan)"
  ];

  const planTypes = [
    {
      id: "marketing_strategy",
      title: "Complete Marketing Strategy",
      description: "Comprehensive marketing roadmap with channels, tactics, and timeline"
    },
    {
      id: "content_calendar",
      title: "Content Marketing Plan",
      description: "30-90 day content strategy with topics, formats, and scheduling"
    },
    {
      id: "social_media_strategy",
      title: "Social Media Strategy",
      description: "Platform-specific social media plan with content and engagement tactics"
    },
    {
      id: "lead_generation",
      title: "Lead Generation Plan",
      description: "Systematic approach to generate and nurture leads for your business"
    },
    {
      id: "brand_awareness",
      title: "Brand Awareness Campaign",
      description: "Strategy to increase brand visibility and recognition in your market"
    },
    {
      id: "growth_hacking",
      title: "Growth Hacking Plan",
      description: "Data-driven growth strategies for rapid business expansion"
    }
  ];

  const handleBusinessDetailsChange = (field, value) => {
    setBusinessDetails(prev => ({ ...prev, [field]: value }));
  };

  const canProceedToStep2 = () => {
    return businessDetails.business_name && 
           businessDetails.industry && 
           businessDetails.business_type && 
           businessDetails.target_audience && 
           businessDetails.goals;
  };

  const canGeneratePlan = () => {
    return canProceedToStep2() && 
           businessDetails.budget_range && 
           businessDetails.timeline && 
           planType;
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    setError("");
    setGeneratedPlan("");

    try {
      const selectedPlan = planTypes.find(p => p.id === planType);
      
      const prompt = `You are a senior marketing strategist with 15+ years of experience. Create a comprehensive ${selectedPlan.title.toLowerCase()} for the following business:

**Business Details:**
- Business Name: ${businessDetails.business_name}
- Industry: ${businessDetails.industry}
- Business Type: ${businessDetails.business_type}
- Target Audience: ${businessDetails.target_audience}
- Current Challenges: ${businessDetails.current_challenges || 'Not specified'}
- Primary Goals: ${businessDetails.goals}
- Budget Range: ${businessDetails.budget_range}
- Timeline: ${businessDetails.timeline}
- Current Marketing Efforts: ${businessDetails.current_marketing || 'Not specified'}
- Team Size: ${businessDetails.team_size || 'Not specified'}

**IMPORTANT: Do NOT include any links, URLs, website addresses, or references to external resources anywhere in the plan. Focus purely on strategies, tactics, and actionable advice without promotional links.**

Create a detailed, actionable plan with clear formatting using markdown-like structure:

# ${selectedPlan.title} for ${businessDetails.business_name}

## Executive Summary
Brief overview of the strategy and expected outcomes.

## Situation Analysis
Current state analysis and key insights about the market and competition.

## Target Audience Deep Dive
- Primary Demographics: Age, income, location
- Behavioral Patterns: How they consume content, make decisions
- Pain Points: What problems they need solved
- Preferred Channels: Where they spend their time online

## Strategic Objectives
1. Primary Goal: [Specific measurable outcome]
2. Secondary Goals: [2-3 supporting objectives]
3. Success Metrics: [KPIs to track]

## Recommended Marketing Channels
### Channel 1: [e.g., Social Media Marketing]
- Platform Focus: [Specific platforms]
- Content Strategy: [Types of content to create]
- Budget Allocation: [% of budget]
- Expected ROI: [Projected returns]

### Channel 2: [e.g., Email Marketing]
- Strategy: [Approach and tactics]
- Budget Allocation: [% of budget]
- Expected Results: [Projected outcomes]

## Implementation Timeline
### Month 1: Foundation
- Week 1-2: [Specific tasks]
- Week 3-4: [Specific tasks]

### Month 2: Launch
- Week 1-2: [Specific tasks] 
- Week 3-4: [Specific tasks]

### Month 3: Optimization
- Week 1-2: [Specific tasks]
- Week 3-4: [Specific tasks]

## Budget Breakdown
- Channel 1: $X (X% of budget)
- Channel 2: $X (X% of budget)
- Tools & Software: $X (X% of budget)
- Content Creation: $X (X% of budget)

## Key Performance Indicators (KPIs)
- Primary KPI: [Main success metric]
- Secondary KPIs: [Supporting metrics]
- Tracking Method: [How to measure]
- Review Frequency: [When to assess]

## Risk Assessment
- Risk 1: [Potential issue] → Mitigation: [How to address]
- Risk 2: [Potential issue] → Mitigation: [How to address]

## Immediate Next Steps (First 30 Days)
1. [Specific actionable task]
2. [Specific actionable task]
3. [Specific actionable task]
4. [Specific actionable task]

Make this plan highly specific to their industry, budget, and goals. Include actual numbers and percentages where possible. Focus on actionable advice they can implement immediately. NO LINKS OR URLS ANYWHERE IN THE CONTENT.`;

      const response = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true
      });

      setGeneratedPlan(response);
    } catch (error) {
      console.error("Failed to generate plan:", error);
      setError("Failed to generate your marketing plan. Please try again.");
    }
    
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPlan);
  };

  const handleExportPDF = () => {
    // Convert markdown-like content to HTML for PDF export
    const htmlContent = generatedPlan
      .replace(/# (.*?)(?=\n|$)/g, '<h1 style="color: #7c3aed; font-size: 24px; margin: 20px 0 15px 0; font-weight: bold;">$1</h1>')
      .replace(/## (.*?)(?=\n|$)/g, '<h2 style="color: #7c3aed; font-size: 20px; margin: 25px 0 15px 0; font-weight: bold;">$1</h2>')
      .replace(/### (.*?)(?=\n|$)/g, '<h3 style="color: #666; font-size: 16px; margin: 20px 0 10px 0; font-weight: bold;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #374151;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>'); // Convert newlines to breaks for flat HTML output

    const printContent = `
      <html>
        <head>
          <title>Marketing Strategy - ${businessDetails.business_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
            h1 { color: #7c3aed; font-size: 24px; margin: 20px 0 15px 0; font-weight: bold; }
            h2 { color: #7c3aed; font-size: 20px; margin: 25px 0 15px 0; font-weight: bold; }
            h3 { color: #666; font-size: 16px; margin: 20px 0 10px 0; font-weight: bold; }
            strong { color: #374151; }
            /* Basic styling for potential lists if LLM formats them with hyphens/numbers */
            ul, ol { margin-left: 20px; margin-bottom: 10px; }
            li { margin-bottom: 5px; }
            p { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1 style="color: #7c3aed; margin-bottom: 20px;">Marketing Strategy Report</h1>
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            ${htmlContent}
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666; font-size: 12px;">
            Generated by Marketing OS AI Coach on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    } else {
      setError("Pop-up blocked. Please allow pop-ups for this site to export the PDF.");
    }
  };

  if (isGenerating) {
    return <Loader message="AI is crafting your personalized marketing strategy..." />;
  }

  return (
    <div className="p-4 lg:p-6 xl:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Marketing Coach</h1>
              <p className="text-gray-600">Get personalized marketing strategy and actionable plans</p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-1 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>

        {/* Step 1: Business Information */}
        {currentStep === 1 && (
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Tell Us About Your Business
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={businessDetails.business_name}
                    onChange={(e) => handleBusinessDetailsChange("business_name", e.target.value)}
                    placeholder="Enter your business name"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Industry *</Label>
                  <Select value={businessDetails.industry} onValueChange={(value) => handleBusinessDetailsChange("industry", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Business Type *</Label>
                  <Select value={businessDetails.business_type} onValueChange={(value) => handleBusinessDetailsChange("business_type", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="team_size">Team Size</Label>
                  <Input
                    id="team_size"
                    value={businessDetails.team_size}
                    onChange={(e) => handleBusinessDetailsChange("team_size", e.target.value)}
                    placeholder="e.g., 5-10 employees"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="target_audience">Target Audience *</Label>
                <Textarea
                  id="target_audience"
                  value={businessDetails.target_audience}
                  onChange={(e) => handleBusinessDetailsChange("target_audience", e.target.value)}
                  placeholder="Describe your ideal customers (age, interests, problems they face, etc.)"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="goals">Primary Business Goals *</Label>
                <Textarea
                  id="goals"
                  value={businessDetails.goals}
                  onChange={(e) => handleBusinessDetailsChange("goals", e.target.value)}
                  placeholder="What do you want to achieve? (e.g., increase sales, brand awareness, lead generation)"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="current_challenges">Current Marketing Challenges</Label>
                <Textarea
                  id="current_challenges"
                  value={businessDetails.current_challenges}
                  onChange={(e) => handleBusinessDetailsChange("current_challenges", e.target.value)}
                  placeholder="What marketing challenges are you facing? (optional)"
                  className="mt-2"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="current_marketing">Current Marketing Efforts</Label>
                <Textarea
                  id="current_marketing"
                  value={businessDetails.current_marketing}
                  onChange={(e) => handleBusinessDetailsChange("current_marketing", e.target.value)}
                  placeholder="What marketing activities are you currently doing? (optional)"
                  className="mt-2"
                  rows={2}
                />
              </div>

              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Continue to Strategy Selection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Strategy Selection */}
        {currentStep === 2 && (
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Choose Your Strategy & Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Marketing Budget Range *</Label>
                  <Select value={businessDetails.budget_range} onValueChange={(value) => handleBusinessDetailsChange("budget_range", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((budget) => (
                        <SelectItem key={budget} value={budget}>{budget}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Timeline *</Label>
                  <Select value={businessDetails.timeline} onValueChange={(value) => handleBusinessDetailsChange("timeline", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {timelines.map((timeline) => (
                        <SelectItem key={timeline} value={timeline}>{timeline}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Select Strategy Type *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {planTypes.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setPlanType(plan.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        planType === plan.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">{plan.title}</h4>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!canGeneratePlan()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Generate Strategy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Generated Plan */}
        {currentStep === 3 && (
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Your Personalized Marketing Strategy
                </span>
                {generatedPlan && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Plan
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {!generatedPlan && !error && (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Your Strategy</h3>
                  <p className="text-gray-600 mb-6">Click the button below to create your personalized marketing plan</p>
                  <Button onClick={generatePlan} className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate My Marketing Strategy
                  </Button>
                </div>
              )}

              {generatedPlan && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-8 max-h-96 overflow-y-auto">
                    <div 
                      className="prose prose-gray max-w-none text-sm leading-relaxed"
                      style={{ whiteSpace: 'pre-wrap' }} // Maintain pre-wrap for newlines and basic formatting
                      dangerouslySetInnerHTML={{
                        __html: generatedPlan
                          // The outline provides specific regexes for markdown to HTML conversion
                          // which are applied here. Note: `prose` class would also parse markdown,
                          // but this explicit conversion with inline styles overrides/supplements it.
                          .replace(/\n/g, '<br>') // Convert all newlines to <br> as per outline
                          .replace(/# (.*?)(?=\n|$)/g, '<h1 style="color: #7c3aed; font-size: 24px; margin: 20px 0 15px 0; font-weight: bold;">$1</h1>')
                          .replace(/## (.*?)(?=\n|$)/g, '<h2 style="color: #7c3aed; font-size: 20px; margin: 25px 0 15px 0; font-weight: bold;">$1</h2>')
                          .replace(/### (.*?)(?=\n|$)/g, '<h3 style="color: #666; font-size: 16px; margin: 20px 0 10px 0; font-weight: bold;">$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #374151;">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => {
                      setCurrentStep(1);
                      setGeneratedPlan("");
                    }} className="flex-1">
                      Create New Strategy
                    </Button>
                    <Button onClick={generatePlan} className="flex-1 bg-purple-600 hover:bg-purple-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Regenerate Plan
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
