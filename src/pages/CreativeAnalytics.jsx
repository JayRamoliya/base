import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Image, 
  Video, 
  FileText,
  Download,
  Eye,
  Heart,
  Share2,
  MessageCircle
} from "lucide-react";

export default function CreativeAnalytics() {
  const [contentType, setContentType] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");

  // NOTE: Data is cleared. In a real app, this would be fetched.
  const [contentPerformance, setContentPerformance] = useState([]);
  const [contentTypeStats, setContentTypeStats] = useState([]);

  const getPerformanceBadge = (performance) => {
    const styles = {
      high: "bg-green-100 text-green-700 border-green-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200", 
      low: "bg-red-100 text-red-700 border-red-200"
    };
    return styles[performance] || styles.medium;
  };

  const getContentIcon = (type) => {
    switch(type) {
      case "image": return Image;
      case "video": return Video;
      case "text": return FileText;
      default: return FileText;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Creative Analytics</h1>
            <p className="text-gray-600">Analyze the performance of your creative content across platforms</p>
          </div>
          
          <div className="flex gap-3">
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="text">Text Posts</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Content Type Performance */}
        <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
                <CardTitle>Content Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-16 text-gray-500">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No performance data available</h3>
                    <p>Analytics for your content types will appear here once you have published content.</p>
                </div>
            </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Performing Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contentPerformance.length > 0 ? (
                <div className="space-y-4">
                  {contentPerformance.map((content) => {
                    const ContentIcon = getContentIcon(content.type);
                    return (
                      <div key={content.id} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <ContentIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{content.title}</h4>
                              <p className="text-sm text-gray-500">{content.platform}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${getPerformanceBadge(content.performance)} border`}>
                              {content.engagement} engagement
                            </Badge>
                            <Badge className="bg-gray-100 text-gray-700 capitalize">
                              {content.performance}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Eye className="w-4 h-4" />
                            {content.views.toLocaleString()} views
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Heart className="w-4 h-4" />
                            {content.likes} likes
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Share2 className="w-4 h-4" />
                            {content.shares} shares
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MessageCircle className="w-4 h-4" />
                            {content.comments} comments
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No content to analyze</h3>
                    <p>Your top performing content will be shown here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}