
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Sparkles, 
  Image, 
  FileText, 
  Wand2, 
  Download,
  Copy,
  Maximize,
  Layout,
  AlertCircle
} from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import ReactMarkdown from 'react-markdown';
import Loader from "../components/ui/Loader";
import PlatformPreview from "../components/ui/PlatformPreview"; // New import

export default function CreativeStudio() {
  const [activeTab, setActiveTab] = useState("content");
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [contentTone, setContentTone] = useState("professional");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState([]);
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState("");
  const [imageRatio, setImageRatio] = useState("1:1");
  const [generationError, setGenerationError] = useState(null);

  const handleGenerateContent = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedContent("");
    setGeneratedHashtags([]);
    setGenerationError(null);
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
- Generate content based on this topic: **${prompt}**
- ${lengthInstruction}
- ${toneInstruction}
- ${formatInstruction}

**Psychological Hook Strategies (Choose the most appropriate):**
- Curiosity Gap: "The one thing nobody tells you about..."
- Contrarian Take: "Everyone thinks X, but here's the truth..."
- Personal Story: "Three years ago, I made a mistake that changed everything..."
- Shocking Statistic: "95% of people don't know this simple fact..."

**Writing Style Guidelines:**
- Start with an irresistible hook.
- Use power words that trigger psychological responses.
- Include personal stories for relatability.
- Use short, punchy sentences mixed with longer ones.
- End with an actionable takeaway.

**Output Format:**
- You MUST respond with a single JSON object.
- The JSON object must have two keys: "content" and "hashtags".
- The "content" value should be the full, human-like text post with proper paragraph breaks.
- The "hashtags" value should be an array of 5-10 relevant hashtags as strings (without the '#').

**Important:**
- Do NOT include your own profile links or call-to-actions.
- Do NOT mention this is AI-generated.
- Make it sound like genuine human writing with deep psychological insight.`;

      const response = await InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The full text content for the social media post."
            },
            hashtags: {
              type: "array",
              description: "An array of 5-10 relevant hashtags, without the '#' symbol.",
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
      setGenerationError("Unable to generate content at this time. Please try again later.");
    }
    setIsGenerating(false);
  };

  const handleGenerateImagePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedImagePrompt("");
    setGenerationError(null);
    try {
      const response = await InvokeLLM({
        prompt: `Create a detailed AI image generation prompt for: "${prompt}"

Requirements:
- Platform: ${platform} 
- Aspect ratio: ${imageRatio}
- Style: Modern, professional, social media optimized
- Include: composition details, lighting, colors, mood
- Make it specific enough for AI tools like Midjourney or DALL-E

Format as a single, detailed prompt ready to use.`
      });
      
      setGeneratedImagePrompt(response);
    } catch (error) {
      console.error("Failed to generate image prompt:", error);
      setGenerationError("Failed to generate image prompt. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleCopy = (contentToCopy) => {
    navigator.clipboard.writeText(contentToCopy);
  };
  
  const handleCopyHashtags = () => {
    const hashtagText = generatedHashtags.map(tag => `#${tag}`).join(' ');
    navigator.clipboard.writeText(hashtagText);
  }

  const tabs = [
    { id: "content", title: "Content Generator", icon: FileText },
    { id: "image", title: "Image Prompt Generator", icon: Image }
  ];

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
    return <Loader message="Generating your content..." />;
  }

  return (
    <div className="p-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creative Studio</h1>
              <p className="text-gray-600">AI-powered content creation with psychological hooks and human insights</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                {activeTab === "content" ? "Content Generator" : "Image Prompt Generator"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="prompt" className="text-sm font-medium">
                  {activeTab === "image" ? "Image Description" : "Content Topic"}
                </Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    activeTab === "image" 
                      ? "Describe the image you want a prompt for..."
                      : "What would you like to create engaging content about?"
                  }
                  className="mt-2 min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Platform</Label>
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

                {activeTab === "content" && (
                  <div>
                    <Label className="text-sm font-medium">Tone of Content</Label>
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
                )}

                {activeTab === "image" && (
                  <div>
                    <Label className="text-sm font-medium">Image Ratio</Label>
                    <Select value={imageRatio} onValueChange={setImageRatio}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="9:16">9:16 (Story)</SelectItem>
                        <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button
                onClick={activeTab === "image" ? handleGenerateImagePrompt : handleGenerateContent}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-md"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {activeTab === "image" ? "Image Prompt" : "Hook-Driven Content"}
              </Button>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-purple-600" />
                  Generated Output
                </span>
                {(generatedContent || generatedImagePrompt) && (
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
                    <Button variant="outline" size="sm" onClick={() => handleCopy(activeTab === 'image' ? generatedImagePrompt : generatedContent)}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Text
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generationError && (
                <div className="h-[480px] bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-red-700">
                  <div className="text-center p-4">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Generation Failed</h3>
                    <p className="text-sm">{generationError}</p>
                  </div>
                </div>
              )}
              {!generationError && (activeTab === "image" ? (
                generatedImagePrompt ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 border h-[480px] overflow-y-auto">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {generatedImagePrompt}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">
                        {platform}
                      </Badge>
                      <Badge variant="outline">{imageRatio}</Badge>
                      <Badge variant="outline">AI Generated Prompt</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="h-[480px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Your generated image prompt will appear here</p>
                    </div>
                  </div>
                )
              ) : (
                generatedContent ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 border h-[480px] overflow-y-auto">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-normal">
                        {generatedContent}
                      </div>
                    </div>
                    {generatedHashtags.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-800 mb-2">Suggested Hashtags</h4>
                        <div className="bg-gray-100 border rounded-md p-3">
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
                  <div className="h-[480px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Your hook-driven content will appear here</p>
                    </div>
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
