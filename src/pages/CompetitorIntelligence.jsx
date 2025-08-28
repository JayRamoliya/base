import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, Users, BarChart, Newspaper, MessageSquare, Twitter, Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import Loader from '../components/ui/Loader';
import { useToast } from "../components/ui/toast";

const socialIcons = {
  twitter: <Twitter className="w-5 h-5 text-[#1DA1F2]" />,
  facebook: <Facebook className="w-5 h-5 text-[#1877F2]" />,
  linkedin: <Linkedin className="w-5 h-5 text-[#0A66C2]" />,
  instagram: <Instagram className="w-5 h-5 text-[#E4405F]" />,
  youtube: <Youtube className="w-5 h-5 text-[#FF0000]" />,
};

export default function CompetitorIntelligence() {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [competitorData, setCompetitorData] = useState(null);
  const { error: toastError } = useToast();

  const handleSearch = async () => {
    if (!competitorUrl) return;
    setIsLoading(true);
    setCompetitorData(null);
    
    try {
      const response = await InvokeLLM({
        prompt: `Analyze the company at website URL "${competitorUrl}". Provide a detailed competitor analysis including:
        - Company overview: Name, one-sentence description, industry, and estimated number of employees.
        - Social media profiles: A list of their social media URLs (twitter, facebook, linkedin, instagram, youtube).
        - Website traffic analysis: An estimated monthly visitor count.
        - Recent news: 2-3 recent, noteworthy news headlines about the company.
        - SEO strategy: Top 5 keywords they seem to be targeting.
        - Marketing angle: A brief summary of their primary marketing message or angle.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            overview: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                industry: { type: "string" },
                employees: { type: "string" },
              },
            },
            social_media: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  url: { type: "string" },
                },
              },
            },
            website_traffic: { type: "string" },
            recent_news: { type: "array", items: { type: "string" } },
            seo_keywords: { type: "array", items: { type: "string" } },
            marketing_angle: { type: "string" },
          },
        },
      });
      setCompetitorData(response);
    } catch (error) {
      console.error("Failed to fetch competitor data:", error);
      toastError("Analysis Failed", "Could not retrieve data for the specified URL.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitor Intelligence</h1>
          <p className="text-gray-600">Analyze your competitors to uncover their strategies and stay ahead of the curve.</p>
        </header>

        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Enter competitor's website (e.g., apple.com)"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleSearch} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && <Loader message="Analyzing competitor data..." />}

        {competitorData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-purple-600" />
                    {competitorData.overview.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{competitorData.overview.description}</p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <Badge variant="outline">Industry: {competitorData.overview.industry}</Badge>
                    <Badge variant="outline">Employees: {competitorData.overview.employees}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                    Marketing Angle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{competitorData.marketing_angle}</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Newspaper className="w-6 h-6 text-purple-600" />
                    Recent News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {competitorData.recent_news.map((news, index) => (
                      <li key={index}>{news}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3"><Users className="w-5 h-5 text-purple-600"/>Social Presence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {competitorData.social_media.map((profile) => (
                    <a href={profile.url} target="_blank" rel="noopener noreferrer" key={profile.platform} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      {socialIcons[profile.platform.toLowerCase()] || <Globe className="w-5 h-5 text-gray-400" />}
                      <span className="text-sm text-gray-800 truncate">{profile.url}</span>
                    </a>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3"><BarChart className="w-5 h-5 text-purple-600"/>Web Traffic</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-gray-900">{competitorData.website_traffic}</p>
                    <p className="text-sm text-gray-500">Estimated monthly visitors</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3"><Search className="w-5 h-5 text-purple-600"/>Top SEO Keywords</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {competitorData.seo_keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">{keyword}</Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}