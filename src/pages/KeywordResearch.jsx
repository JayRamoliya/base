
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Zap, Download, Copy, Target, Globe, BarChart3, Eye, HelpCircle, Bot, ListTree } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import Loader from "../components/ui/Loader";

export default function KeywordResearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState(null); // Changed initial state to null
  const [searchQuery, setSearchQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [contentType, setContentType] = useState("");

  const industries = [
    "Technology", "Healthcare", "Finance", "E-commerce", "Education",
    "Real Estate", "Food & Beverage", "Fashion", "Travel", "Fitness",
    "Marketing", "Consulting", "Manufacturing", "Entertainment"
  ];

  const locations = [
    "Global", "United States", "United Kingdom", "Canada", "Australia",
    "Germany", "France", "Spain", "Italy", "Netherlands", "India", "Japan"
  ];

  const contentTypes = [
    "Blog Posts", "Product Pages", "Landing Pages", "Video Content",
    "Social Media", "Email Marketing", "PPC Ads", "SEO Content"
  ];

  const handleKeywordResearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a keyword or topic to research.");
      return;
    }

    setIsLoading(true);
    setKeywords(null); // Changed to set null

    try {
      const prompt = `You are an expert SEO strategist. Conduct a comprehensive keyword analysis for the topic: "${searchQuery}".
Industry: ${industry || 'General'}
Target Location: ${location || 'Global'}
Content Type: ${contentType || 'General Content'}

Provide a detailed analysis in the following JSON format. Ensure all search volumes are realistic numbers (e.g., 1500, 22000, 90).

{
  "primary_keywords": [
    {"keyword": "string", "search_volume": "number", "difficulty": "low/medium/high", "cpc": "number", "intent": "informational/commercial/transactional/navigational", "opportunity": "string"}
  ],
  "keyword_clusters": [
    {"cluster_name": "string", "keywords": ["string", "string"], "description": "string"}
  ],
  "question_keywords": [
    {"question": "string", "search_volume": "number", "difficulty": "low/medium/high", "type": "how-to/what-is/why/where"}
  ],
  "serp_analysis": [
    {"position": "number", "title": "string", "url": "string", "strength": "High/Medium/Low Authority", "notes": "string"}
  ],
  "content_ideas": [
    {"title": "string", "keywords": ["string"], "type": "blog/video/etc", "potential": "string"}
  ]
}`;

      const response = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            primary_keywords: { type: "array", items: { type: "object", properties: { keyword: { type: "string" }, search_volume: { type: "number" }, difficulty: { type: "string" }, cpc: { type: "number" }, intent: { type: "string" }, opportunity: { type: "string" } } } },
            keyword_clusters: { type: "array", items: { type: "object", properties: { cluster_name: { type: "string" }, keywords: { type: "array", items: { type: "string" } }, description: { type: "string" } } } },
            question_keywords: { type: "array", items: { type: "object", properties: { question: { type: "string" }, search_volume: { type: "number" }, difficulty: { type: "string" }, type: { type: "string" } } } },
            serp_analysis: { type: "array", items: { type: "object", properties: { position: { type: "number" }, title: { type: "string" }, url: { type: "string" }, strength: { type: "string" }, notes: { type: "string" } } } },
            content_ideas: { type: "array", items: { type: "object", properties: { title: { type: "string" }, keywords: { type: "array", items: { type: "string" } }, type: { type: "string" }, potential: { type: "string" } } } }
          }
        }
      });

      setKeywords(response);
    } catch (error) {
      console.error("Failed to research keywords:", error);
      alert("Failed to research keywords. Please try again.");
    }
    
    setIsLoading(false);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700", 
      high: "bg-red-100 text-red-700"
    };
    return colors[difficulty?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getIntentIcon = (intent) => {
    const icons = {
      informational: <Search className="w-4 h-4" />,
      commercial: <Target className="w-4 h-4" />,
      transactional: <Zap className="w-4 h-4" />,
      navigational: <Globe className="w-4 h-4" />
    };
    return icons[intent?.toLowerCase()] || <Search className="w-4 h-4" />;
  };

  const handleExportKeywords = () => {
    if (!keywords) { // Simplified check
      alert("No keywords to export. Please run a search first.");
      return;
    }

    let csvContent = "Keyword Type,Keyword,Search Volume,Difficulty,Intent/Type,CPC,Opportunity/Notes\n"; // Updated header
    
    // Add primary keywords
    keywords.primary_keywords?.forEach(kw => {
      csvContent += `Primary,"${kw.keyword}","${kw.search_volume}","${kw.difficulty}","${kw.intent}","${kw.cpc || 'N/A'}","${kw.opportunity}"\n`;
    });
    
    // Add question keywords
    keywords.question_keywords?.forEach(kw => {
      csvContent += `Question,"${kw.question}","${kw.search_volume}","${kw.difficulty}","${kw.type}","N/A","N/A"\n`; // Added question keywords
    });

    // Removed long_tail_keywords and related_keywords export as they are no longer generated by LLM
    // Also, keyword_clusters and serp_analysis are not directly exported to CSV in this format

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keyword-research-${searchQuery.replace(/\s+/g, '-')}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <Loader message="Researching keywords and analyzing SERP data..." />; // Updated loader message
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Keyword Research Hub</h1>
          <p className="text-gray-600">Research keywords and SEO opportunities for your content with real-time data</p>
        </div>

        {/* Research Form */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              Keyword Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="search">Main Keyword or Topic *</Label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., digital marketing, fitness apps, etc."
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleKeywordResearch}
                className="bg-purple-600 hover:bg-purple-700 flex-1"
                disabled={!searchQuery.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                Research Keywords
              </Button>
              {keywords && ( // Simplified check
                <Button 
                  variant="outline"
                  onClick={handleExportKeywords}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {keywords && ( // Simplified check
          <div className="space-y-6">
            {/* Primary Keywords */}
            {keywords.primary_keywords?.length > 0 && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Primary Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {keywords.primary_keywords.map((kw, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{kw.keyword}</h4>
                              {getIntentIcon(kw.intent)}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{kw.opportunity}</p>
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline">
                                <BarChart3 className="w-3 h-3 mr-1" />
                                {kw.search_volume?.toLocaleString()}/mo {/* Added toLocaleString() */}
                              </Badge>
                              <Badge className={getDifficultyColor(kw.difficulty)}>
                                {kw.difficulty} difficulty
                              </Badge>
                              <Badge variant="outline">{kw.intent}</Badge>
                              {kw.cpc && (
                                <Badge variant="outline">${kw.cpc} CPC</Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(kw.keyword)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Removed Long Tail Keywords and Related Keywords sections */}

            {/* New Sections: Keyword Clusters and Question Keywords */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Keyword Clusters */}
              {keywords.keyword_clusters?.length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListTree className="w-5 h-5 text-blue-600" />
                      Keyword Clusters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {keywords.keyword_clusters.map((cluster, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-1">{cluster.cluster_name}</h4>
                          <p className="text-xs text-gray-500 mb-2">{cluster.description}</p>
                          <div className="flex gap-1 flex-wrap">
                            {cluster.keywords.map((kw, i) => (
                              <Badge key={i} variant="secondary">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Question Keywords */}
              {keywords.question_keywords?.length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-green-600" />
                      Question-Based Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {keywords.question_keywords.map((kw, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                          <p className="font-medium text-gray-800">{kw.question}</p>
                           <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {kw.search_volume?.toLocaleString()}/mo {/* Added toLocaleString() */}
                              </Badge>
                              <Badge className={`text-xs ${getDifficultyColor(kw.difficulty)}`}>
                                {kw.difficulty}
                              </Badge>
                            </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* SERP Analysis */}
            {keywords.serp_analysis?.length > 0 && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-600" />
                    SERP Analysis for "{searchQuery}"
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {keywords.serp_analysis.map((item, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-purple-600">{item.position}</span>
                          <div className="flex-1">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-800 hover:underline line-clamp-1">{item.title}</a>
                            <p className="text-xs text-gray-500 line-clamp-1">{item.url}</p>
                          </div>
                          <Badge variant="outline">{item.strength}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Ideas */}
            {keywords.content_ideas?.length > 0 && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Content Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {keywords.content_ideas.map((idea, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">{idea.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{idea.potential}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{idea.type}</Badge>
                          {idea.keywords?.map((kw, i) => (
                            <Badge key={i} className="bg-purple-100 text-purple-700">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!keywords && ( // Simplified check
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="text-center py-16">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Keyword Research</h3>
              <p className="text-gray-600">Enter a keyword or topic above to discover high-value SEO opportunities and content ideas.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
