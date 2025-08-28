import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Copy, 
  Sparkles, 
  FileText,
  Maximize
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InvokeLLM } from "@/api/integrations";
import Loader from "../components/ui/Loader";
import PlatformPreview from "../components/ui/PlatformPreview";

export default function TopicDetail() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [contentTone, setContentTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const topicParam = urlParams.get('topic');
    const categoryParam = urlParams.get('category');
    
    if (topicParam) setTopic(decodeURIComponent(topicParam));
    if (categoryParam) setCategory(categoryParam);
  }, []);

  const handleGenerateContent = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setGeneratedContent("");
    setGeneratedHashtags([]);
    
    try {
        let lengthInstruction = "";
        let formatInstruction = "";
        
        if (platform === 'twitter') {
            lengthInstruction = "Keep it concise and punchy (under 280 characters). Make it Twitter-friendly with natural flow.";
            formatInstruction = "Write as a single, engaging tweet with a powerful hook that sparks conversation.";
        } else if (platform === 'instagram') {
            lengthInstruction = "Create medium-length content (2-3 short paragraphs). Perfect for Instagram captions.";
            formatInstruction = "Start with an attention-grabbing hook, follow with 1-2 supporting paragraphs with proper line breaks between them.";
        } else if (platform === 'facebook') {
            lengthInstruction = "Create medium-length, engaging content (2-4 paragraphs) that encourages interaction.";
            formatInstruction = "Begin with a compelling hook that stops the scroll, develop the idea with personal touches, and structure with clear paragraph breaks.";
        } else if (platform === 'linkedin') {
            lengthInstruction = "Create comprehensive, professional content (4-6 well-developed paragraphs). Provide valuable insights and detailed information.";
            formatInstruction = "Open with a thought-provoking hook, follow with 2-3 detailed body paragraphs with insights/examples, and end with a meaningful conclusion. Use proper spacing between paragraphs.";
        } else if (platform === 'tiktok') {
            lengthInstruction = "Very short and catchy content, optimized for video captions. Keep it under 150 characters.";
            formatInstruction = "Write a single, punchy hook that's perfect for a TikTok video caption and grabs attention immediately.";
        }

        const toneInstruction = `Write in a ${contentTone} tone that feels completely natural and human.`;

        const systemPrompt = `You are a master content creator and human psychology expert who creates highly engaging social media content. Your content always starts with powerful psychological hooks that stop people mid-scroll and compel them to read the entire post.

**Critical Requirements:**
- Generate content based on this trending topic: **${topic}**
- Category context: ${category}
- ${lengthInstruction}
- ${toneInstruction}
- ${formatInstruction}

**Psychological Hook Strategies (Choose the most appropriate):**
- Curiosity Gap: "The one thing nobody tells you about..."
- Contrarian Take: "Everyone thinks X, but here's the truth..."
- Personal Story: "Three years ago, I made a mistake that changed everything..."
- Shocking Statistic: "95% of people don't know this simple fact..."
- Question Hook: "What if I told you that everything you know about X is wrong?"
- Pattern Interrupt: "Stop doing X. Here's what you should do instead..."
- Emotional Trigger: "I was devastated when I realized..."
- Social Proof: "After helping 1000+ people, I've learned..."

**Human Psychology Principles to Apply:**
- Loss Aversion: People hate losing more than they love gaining
- Social Proof: Others are doing it, so should you
- Scarcity: Limited time, exclusive information
- Reciprocity: Give value first, build trust
- Authority: Position yourself as knowledgeable
- Consistency: Help people commit to ideas
- Liking: Be relatable and authentic

**Writing Style Guidelines:**
- Start with an irresistible hook that creates immediate curiosity or emotion
- Use power words that trigger psychological responses
- Include personal stories and relatable experiences
- Use short, punchy sentences mixed with longer ones for natural rhythm
- Add emotional elements and human touches that build connection
- Make it feel authentic and from personal experience
- End with valuable insights or actionable takeaways

**Content Structure:**
- Use proper paragraph breaks with empty lines between paragraphs
- Create clear, readable formatting that flows naturally
- Make each paragraph focused on one main idea
- Transition smoothly from hook to supporting content to conclusion

**Target Audience:**
- Professionals and business-minded individuals aged 25-50
- People interested in personal growth, business insights, and valuable content
- Social media users who appreciate authentic, engaging posts

**Output Format:**
- You MUST respond with a single JSON object
- The JSON object must have two keys: "content" and "hashtags"
- The "content" value should be the full, human-like text post with proper paragraph breaks
- The "hashtags" value should be an array of 8-12 relevant hashtags as strings (without the '#')

**Important:**
- Do NOT include profile links, call-to-actions, or promotional content
- Do NOT mention that this is AI-generated content
- Make it sound like genuine human writing with deep insights
- Focus purely on delivering valuable, engaging content
- Write ONLY in English`;

      const response = await InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The full text content for the social media post with powerful psychological hooks."
            },
            hashtags: {
              type: "array",
              description: "An array of 8-12 relevant hashtags, without the '#' symbol.",
              items: { type: "string" }
            }
          },
          required: ["content", "hashtags"]
        }
      });
      
      setGeneratedContent(response.content);
      setGeneratedHashtags(response.hashtags || []);
    } catch (error) {
      console.error("Failed to generate content:", error);
      setGeneratedContent("Unable to generate content at this time. Please try again later.");
    }
    setIsGenerating(false);
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleCopyHashtags = () => {
    const hashtagText = generatedHashtags.map(tag => `#${tag}`).join(' ');
    navigator.clipboard.writeText(hashtagText);
  };

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual & Friendly" },
    { value: "inspirational", label: "Inspirational" },
    { value: "humorous", label: "Humorous" },
    { value: "educational", label: "Educational" },
    { value: "storytelling", label: "Storytelling" },
    { value: "controversial", label: "Thought-Provoking" }
  ];

  if (isGenerating) {
    return <Loader message="Creating your viral content..." />;
  }

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("TrendingTopics"))}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Content</h1>
            <p className="text-gray-600">Transform trending topics into viral content</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Content Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Trending Topic</h3>
                <div className="p-4 bg-purple-50 rounded border border-purple-200">
                  <p className="text-gray-900 font-medium">{topic}</p>
                  {category && (
                    <Badge className="mt-2 bg-purple-100 text-purple-700">
                      From r/{category}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Platform</label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Content Tone</label>
                  <Select value={contentTone} onValueChange={setContentTone}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerateContent}
                disabled={isGenerating || !topic.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Viral Content
              </Button>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Generated Content
                </span>
                {generatedContent && (
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Maximize className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-gray-100 p-8">
                        <PlatformPreview 
                          platform={platform}
                          content={generatedContent}
                          hashtags={generatedHashtags}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(generatedContent)}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded p-4 border h-[420px] overflow-y-auto">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {generatedContent}
                    </div>
                  </div>
                  
                  {generatedHashtags.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Suggested Hashtags</h4>
                      <div className="bg-gray-100 border rounded p-3">
                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                          {generatedHashtags.map(tag => `#${tag}`).join(' ')}
                        </p>
                        <Button variant="outline" size="sm" onClick={handleCopyHashtags}>
                          <Copy className="w-4 h-4 mr-2"/>
                          Copy Hashtags
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[420px] bg-gray-100 rounded flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Your viral content will appear here</p>
                    <p className="text-sm mt-2">Click "Generate Viral Content" to start</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}