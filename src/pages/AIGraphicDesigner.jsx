import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Palette, 
  Download, 
  Sparkles, 
  Image,
  Wand2,
  RefreshCw,
  Save,
  Copy
} from "lucide-react";
import { GenerateImage } from "@/api/integrations";
import { Asset } from "@/api/entities";
import { User } from "@/api/entities";
import { Company } from "@/api/entities";

const designStyles = [
  "Modern Minimalist",
  "Vibrant Corporate",
  "Playful Illustration", 
  "Professional Business",
  "Creative Abstract",
  "Tech Futuristic",
  "Elegant Classic",
  "Bold Typography"
];

const designTypes = [
  { value: "social_post", label: "Social Media Post", size: "1080x1080" },
  { value: "story", label: "Instagram Story", size: "1080x1920" },
  { value: "banner", label: "Website Banner", size: "1920x600" },
  { value: "logo", label: "Logo Design", size: "500x500" },
  { value: "flyer", label: "Digital Flyer", size: "800x1200" },
  { value: "ad", label: "Display Ad", size: "728x90" }
];

export default function AIGraphicDesigner() {
  const [prompt, setPrompt] = useState("");
  const [designType, setDesignType] = useState("social_post");
  const [designStyle, setDesignStyle] = useState("Modern Minimalist");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);

  React.useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const [user, companies] = await Promise.all([
        User.me(),
        Company.list()
      ]);
      if (companies.length > 0) {
        setCurrentCompany(companies[0]);
      }
    } catch (error) {
      console.error("Failed to load company:", error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a design description");
      return;
    }

    setIsGenerating(true);
    try {
      const selectedType = designTypes.find(t => t.value === designType);
      const enhancedPrompt = `Create a ${designStyle.toLowerCase()} ${selectedType.label.toLowerCase()} design with the following description: ${prompt}. Make it professional, visually appealing, and suitable for ${selectedType.label.toLowerCase()}.`;
      
      const response = await GenerateImage({
        prompt: enhancedPrompt
      });
      
      setGeneratedImage(response.url);
    } catch (error) {
      console.error("Failed to generate image:", error);
      alert("Failed to generate design. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleSaveToLibrary = async () => {
    if (!generatedImage || !currentCompany) {
      alert("No image to save or company not found");
      return;
    }

    setIsSaving(true);
    try {
      const selectedType = designTypes.find(t => t.value === designType);
      await Asset.create({
        title: `AI Generated ${selectedType.label} - ${prompt.substring(0, 50)}...`,
        file_url: generatedImage,
        file_type: "image",
        tags: ["ai-generated", designType, designStyle.toLowerCase().replace(" ", "-")],
        company_id: currentCompany.id,
        mime_type: "image/png"
      });
      
      alert("Design saved to Asset Library successfully!");
    } catch (error) {
      console.error("Failed to save to library:", error);
      alert("Failed to save design. Please try again.");
    }
    setIsSaving(false);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-design-${designType}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedType = designTypes.find(t => t.value === designType);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            AI Graphic Designer
          </h1>
          <p className="text-gray-600">Create stunning graphics with AI-powered design generation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Design Controls */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                Design Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design Type
                </label>
                <Select value={designType} onValueChange={setDesignType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {designTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} ({type.size})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design Style
                </label>
                <Select value={designStyle} onValueChange={setDesignStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {designStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design Description
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to create (e.g., 'A promotional post for a coffee shop with warm colors and modern typography')"
                  className="h-32"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating Design...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Design
                  </>
                )}
              </Button>

              {selectedType && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Design Specifications</h4>
                  <div className="space-y-1 text-sm text-purple-700">
                    <p><strong>Type:</strong> {selectedType.label}</p>
                    <p><strong>Dimensions:</strong> {selectedType.size} pixels</p>
                    <p><strong>Style:</strong> {designStyle}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Design Preview */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-600" />
                Generated Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <img 
                      src={generatedImage} 
                      alt="Generated design"
                      className="max-w-full max-h-96 mx-auto rounded-lg shadow-sm"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button
                      onClick={handleSaveToLibrary}
                      disabled={isSaving}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save to Library
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No design generated yet</h3>
                  <p>Enter a description and click "Generate Design" to create your graphic</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 Pro Tips for Better Designs</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Be Specific:</h4>
                <p>Include details about colors, mood, target audience, and key elements you want in your design.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Consider Context:</h4>
                <p>Think about where the design will be used and what message you want to convey.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Try Different Styles:</h4>
                <p>Experiment with various design styles to find what works best for your brand.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Iterate:</h4>
                <p>Don't hesitate to refine your prompt and generate multiple variations.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}