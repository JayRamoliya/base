
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Wand2, RefreshCw, Copy, FileText, AlertCircle, Plus, Save, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose } from
"@/components/ui/dialog";
import { InvokeLLM } from "@/api/integrations";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import ReactMarkdown from "react-markdown";
import Loader from "../components/ui/Loader";

const defaultTemplates = [
{
  id: "cold-outreach",
  title: "Cold Outreach",
  description: "A hook-driven email to a potential new client.",
  content: `Subject: A thought on [Their Company]'s [Specific Area]

Hi [Name],

I was just reading about [Their Company]'s recent work on [Specific Project/Achievement] and it struck a chord. The way you're approaching [Their Challenge] is impressive.

My team and I at [Your Company] have been deep in the trenches helping businesses like yours overcome a similar hurdle: [Specific Pain Point]. We recently helped a company in your space achieve [Specific, Quantifiable Result, e.g., a 25% increase in lead conversion] in just a few weeks.

I have a specific idea on how you could apply a similar strategy to [Their Goal]. 

Would you be open to a 15-minute chat next week to explore it? No pressure, just a quick exchange of ideas.

Best,
[Your Name]`
},
{
  id: "webinar-invite",
  title: "Webinar Invitation",
  description: "Invite prospects to an upcoming webinar or online event.",
  content: `Subject: You're Invited: [Webinar Title]

Hi [Name],

I'm reaching out because you've shown interest in [Topic of Interest]. It's a space that's evolving quickly, and staying ahead of the curve is a real challenge.

That's why I'm excited to invite you to our upcoming webinar, "[Webinar Title]," on [Date] at [Time]. We'll be diving deep into [Specific Pain Point 1], [Specific Pain Point 2], and how you can [Key Benefit].

Our main speaker, [Speaker Name], has over [X] years of experience and will be sharing actionable insights you can apply immediately.

Save your spot here: [Registration Link]

Hope to see you there!

Cheers,
[Your Name]`
},
{
  id: "product-launch",
  title: "Product Launch",
  description: "Announce a new product or feature to your email list.",
  content: `Subject: It's here! Introducing [Product Name]

Hi [Name],

For months, we've been working on a secret project to solve a problem that we know you've faced: [The Problem Your Product Solves].

Today, I'm thrilled to announce that [Product Name] is officially live!

We created [Product Name] to help you [Key Benefit 1], [Key Benefit 2], and ultimately [Achieve a Major Goal]. It's more than just a tool; it's a new way to [Verb, e.g., 'manage your workflow'].

Explore [Product Name] now: [Link to Product]

We're so excited to hear what you think.

Best,
[Your Name]`
},
{
  id: "re-engagement",
  title: "Re-engagement Email",
  description: "Win back inactive users or subscribers.",
  content: `Subject: Is this goodbye, [Name]?

Hi [Name],

It's been a while since we last saw you at [Your Company], and we've missed having you around.

A lot has changed since you've been gone! We've launched [New Feature 1], improved [Existing Feature], and helped customers like you achieve [Specific Outcome].

If you're still interested in [Original Goal], we'd love for you to give us another look. As a small thank you, here's [Offer, e.g., 'a 20% discount on your next month'] if you come back today.

[Link to Your App/Site]

No hard feelings if you've moved on, but we hope to see you again!

All the best,
[Your Name]`
},
{
  id: "feedback-request",
  title: "Feedback Request",
  description: "Ask for valuable feedback from your active customers.",
  content: `Subject: A quick question about your experience with [Your Company]

Hi [Name],

I'm [Your Name], one of the founders of [Your Company]. I'm not writing to sell you anything, but to ask for a small favor that would mean the world to us.

You've been a customer for [Time Period], and your perspective is incredibly valuable as we plan what's next.

Would you be willing to share your honest thoughts on your experience so far? Specifically, I'd love to know:
1. What's one thing you love about [Your Product]?
2. What's one thing that could be better?

Your feedback directly shapes our roadmap. Just a few sentences would be a huge help.

Thank you for being part of our journey.

Sincerely,
[Your Name]`
},
{
  id: "partnership-proposal",
  title: "Partnership Proposal",
  description: "Propose a strategic partnership or collaboration.",
  content: `Subject: Partnership opportunity with [Your Company]

Hi [Name],

I've been following [Their Company]'s work in [Their Industry/Niche] and I'm impressed by your approach to [Specific Achievement].

At [Your Company], we've built something that could complement your offerings perfectly. Our [Your Product/Service] helps [Target Audience] achieve [Specific Outcome], and I believe there's a natural synergy with what you're doing.

I have some ideas on how we could work together to provide more value to both our audiences.

Would you be interested in a quick 20-minute call to explore potential collaboration opportunities?

Best regards,
[Your Name]`
},
{
  id: "follow-up-meeting",
  title: "Follow-up After Meeting",
  description: "Follow up after an initial meeting or demo.",
  content: `Subject: Great meeting you, [Name] - Next steps

Hi [Name],

It was fantastic meeting with you yesterday and learning more about [Their Company]'s goals for [Specific Area].

As discussed, I'm attaching the [Document/Proposal] that outlines how [Your Solution] can help you achieve [Specific Goal] while addressing the [Pain Point] you mentioned.

Based on our conversation, I think the next logical step would be [Specific Next Step]. I have availability [Time Options] if you'd like to dive deeper.

Looking forward to continuing our conversation.

Best,
[Your Name]`
},
{
  id: "customer-success-story",
  title: "Customer Success Story",
  description: "Share a customer success story to build credibility.",
  content: `Subject: How [Customer Company] increased [Metric] by [Percentage]

Hi [Name],

I wanted to share a quick success story that reminded me of our recent conversation about [Challenge/Goal].

[Customer Company], a [Industry] company similar to yours, was struggling with [Specific Challenge]. After implementing [Your Solution], they saw:

• [Metric 1]: [Improvement]
• [Metric 2]: [Improvement]  
• [Metric 3]: [Improvement]

The key was [Brief explanation of what made the difference].

Given your focus on [Their Goal], I thought this might be relevant. If you'd like to learn more about their approach, I'd be happy to share additional details.

Best,
[Your Name]`
}];

export default function QuickMail() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState(defaultTemplates);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [user, setUser] = useState(null);

  // Custom template creation
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    description: "",
    content: ""
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [userData, companiesData] = await Promise.all([
      User.me(),
      Company.list()]
      );
      setUser(userData);
      if (companiesData.length > 0) {
        setCurrentCompany(companiesData[0]);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const handleGenerateEmail = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedEmail("");

    try {
      const companyInfo = currentCompany ? {
        name: currentCompany.name,
        industry: currentCompany.industry,
        website: currentCompany.website
      } : {};

      const systemPrompt = `You are a master email copywriter and human psychology expert. Create a concise, compelling email that feels personal and authentic. Your emails always start with powerful psychological hooks to grab attention.

**Context:**
- Topic: ${prompt}
- Tone: ${tone}
- From Company: ${companyInfo.name || '[Your Company]'}
- Industry: ${companyInfo.industry || '[Your Industry]'}

**Critical Requirements:**
- Keep the email CONCISE and MEDIUM-LENGTH (3-5 short paragraphs maximum)
- Start with an irresistible psychological hook
- Make it feel human and authentic, not AI-generated
- Use conversational, natural language
- Include emotional elements and personal touches
- End with a clear, low-friction call-to-action
- NEVER include any links, URLs, website addresses, or clickable elements
- Do NOT include phrases like "click here", "visit our website", or any reference to external links
- Focus purely on valuable, engaging content without promotional links

**Psychological Hook Strategies (Choose the most appropriate):**
- Curiosity Gap: "The one thing nobody tells you about..."
- Contrarian Take: "Everyone thinks X, but here's the truth..."
- Personal Story: "Last week, I discovered something that changed everything..."
- Question Hook: "What if I told you there's a simple way to..."

**Email Structure:**
- Subject line MUST be the first line: "Subject: [Engaging Subject Line]"
- 3-5 concise paragraphs maximum
- Proper paragraph breaks with empty lines
- Professional but warm closing
- NO LINKS OR URLS ANYWHERE IN THE EMAIL

**Important:**
- Do NOT include generic placeholders like [Name] 
- Do NOT mention this is AI-generated
- Focus on being valuable and engaging
- Keep it SHORT and PUNCHY
- Write ONLY in English
- ABSOLUTELY NO LINKS OR URLS

Generate the complete, concise email now:`;

      const response = await InvokeLLM({ prompt: systemPrompt });
      setGeneratedEmail(response);
    } catch (err) {
      setError("Failed to generate email. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const useTemplate = (content) => {
    let personalizedContent = content;
    if (currentCompany) {
      personalizedContent = personalizedContent.
      replace(/\[Your Company\]/g, currentCompany.name).
      replace(/\[Your Industry\]/g, currentCompany.industry || '[Your Industry]').
      replace(/\[Your Website\]/g, currentCompany.website || '[Your Website]');
    }
    if (user) {
      personalizedContent = personalizedContent.
      replace(/\[Your Name\]/g, user.full_name || '[Your Name]').
      replace(/\[Your Title\]/g, '[Your Title]');
    }

    setGeneratedEmail(personalizedContent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail);
  };

  const handleSaveTemplate = () => {
    if (newTemplate.title && newTemplate.content) {
      const template = {
        ...newTemplate,
        id: `custom-${Date.now()}`,
        isCustom: true
      };
      setTemplates([...templates, template]);
      setNewTemplate({ title: "", description: "", content: "" });
      setIsCreatingTemplate(false);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
  };

  if (isGenerating) {
    return <Loader message="Crafting your email..." />;
  }

  return (
    <div className="p-4 lg:p-6 xl:p-8">
      <div className="max-w-full mx-auto space-y-6 lg:space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Mail</h1>
          <p className="text-gray-600">Generate professional emails with AI or customize from our template library</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* AI Generator */}
          <Card className="shadow-sm border-0 bg-white sticky top-8">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">Email Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="font-medium text-base">What is this email about?</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Following up with a potential client after our demo to discuss next steps..."
                  className="mt-2 min-h-24 text-sm" />
              </div>
              
              <div>
                <Label className="font-medium text-base">Choose your tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional & Polished</SelectItem>
                    <SelectItem value="casual">Casual & Friendly</SelectItem>
                    <SelectItem value="persuasive">Persuasive & Compelling</SelectItem>
                    <SelectItem value="warm">Warm & Personal</SelectItem>
                    <SelectItem value="formal">Formal & Traditional</SelectItem>
                    <SelectItem value="creative">Creative & Engaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleGenerateEmail}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-medium">
                {isGenerating ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Mail className="w-5 h-5 mr-2" />}
                {isGenerating ? "Crafting your email..." : "Generate Email"}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Email Output */}
          <Card className="shadow-sm border-0 bg-white min-h-[500px]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Generated Output
                </CardTitle>
                {generatedEmail && !error &&
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copy Email
                  </Button>
                }
              </div>
            </CardHeader>
            <CardContent>
              {error ?
              <div className="text-red-600 flex items-center gap-2 p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div> :
              generatedEmail ?
              <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />
                  }}>
                    {generatedEmail}
                  </ReactMarkdown>
                </div> :
              <div className="text-center py-20 text-gray-400">
                  <Mail className="w-16 h-16 mx-auto mb-4" />
                  <p>Your generated email will appear here.</p>
                </div>
              }
            </CardContent>
          </Card>
        </div>

        {/* Templates Section - One by One Layout */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Email Template Library
              </h2>
              <p className="text-sm text-gray-600">Professionally written templates for every situation</p>
            </div>
            <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingTemplate(true)}
            className="gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="shadow-sm border-0 bg-white hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle className="text-base">{template.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardContent>
                <div className="p-4 border-t mt-auto">
                   <div className="flex items-center justify-between">
                     <Button
                size="sm"
                onClick={() => useTemplate(template.content)}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1">
                        Use Template
                      </Button>
                     {template.isCustom &&
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteTemplate(template.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2">
                          <Trash2 className="w-4 h-4" />
                        </Button>
              }
                   </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Create Template Dialog */}
        <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Email Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="template-title">Template Title</Label>
                <Input
                  id="template-title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  placeholder="e.g., Project Proposal Follow-up" />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Brief description of when to use this template" />
              </div>
              <div>
                <Label htmlFor="template-content">Email Content</Label>
                <Textarea
                  id="template-content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Write your email template here, starting with 'Subject: ...'"
                  className="min-h-48" />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleSaveTemplate}
                disabled={!newTemplate.title || !newTemplate.content}
                className="bg-purple-600 hover:bg-purple-700 gap-2">
                <Save className="w-4 h-4" />
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>);
}
