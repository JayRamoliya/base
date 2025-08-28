import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Wand2, Image as ImageIcon, Download, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { GenerateImage } from "@/api/integrations";
import Loader from "../components/ui/Loader";

export default function AIGraphicDesignerV2() {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState(null);

  const imageStyles = [
    { value: 'photorealistic', label: 'Photorealistic' },
    { value: 'digital-art', label: 'Digital Art' },
    { value: '3d-model', label: '3D Model' },
    { value: 'flat-design', label: 'Flat Design' },
    { value: 'anime', label: 'Anime' },
    { value: 'comic-book', label: 'Comic Book' },
    { value: 'fantasy-art', label: 'Fantasy Art' },
    { value: 'isometric', label: 'Isometric' },
    { value: 'pixel-art', label: 'Pixel Art' },
    { value: 'watercolor', label: 'Watercolor' },
  ];

  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:3', label: 'Standard (4:3)' },
    { value: '3:2', label: 'Photo (3:2)' },
  ];

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const fullPrompt = `${prompt}, style: ${style}, aspect ratio: ${aspectRatio}`;
      // Generate multiple images for variety
      const imagePromises = Array(2).fill(null).map(() => GenerateImage({ prompt: fullPrompt }));
      const results = await Promise.all(imagePromises);
      
      const newImages = results.map(res => ({
        url: res.url,
        prompt: fullPrompt
      }));
      setGeneratedImages(newImages);

    } catch (err) {
      console.error("Image generation failed:", err);
      setError("Failed to generate images. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `marketing-os-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCopyPrompt = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Graphic Designer</h1>
          <p className="text-gray-600">Create stunning visuals for your marketing campaigns in seconds.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-0 shadow-sm sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  Image Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="prompt" className="font-medium">Describe your image *</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A futuristic cityscape at sunset with flying cars"
                    className="mt-2 min-h-32"
                  />
                </div>

                <div>
                  <Label htmlFor="style" className="font-medium">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageStyles.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="aspectRatio" className="font-medium">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger id="aspectRatio" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map(ar => <SelectItem key={ar.value} value={ar.value}>{ar.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerateImage}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 font-medium py-3"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isLoading ? 'Generating...' : 'Generate Images'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-sm min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  Generated Graphics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                      <h3 className="font-semibold text-red-700 mb-2">Generation Failed</h3>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}
                
                {isLoading && (
                  <div className="h-96 flex flex-col items-center justify-center">
                    <Loader message="Your AI assistant is creating graphics..." />
                  </div>
                )}

                {!isLoading && !error && generatedImages.length === 0 && (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Your graphics will appear here</h3>
                      <p>Describe what you want to see and click "Generate".</p>
                    </div>
                  </div>
                )}

                {generatedImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="group relative border border-gray-200 rounded-lg overflow-hidden">
                        <img src={image.url} alt={image.prompt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                           <div className="flex gap-2">
                             <Button size="sm" variant="secondary" onClick={() => handleDownload(image.url)}>
                               <Download className="w-4 h-4 mr-2" />
                               Download
                             </Button>
                             <Button size="sm" variant="secondary" onClick={() => handleCopyPrompt(image.prompt)}>
                               <Copy className="w-4 h-4 mr-2" />
                               Copy Prompt
                             </Button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}