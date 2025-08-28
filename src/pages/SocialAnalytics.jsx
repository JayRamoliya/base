
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Users,
  Calendar,
  Target,
  Award,
  BarChart3,
  Clock,
  Zap,
  Instagram,
  Facebook,
  Linkedin,
  X, // Changed from Twitter to X
  Youtube,
  Download,
  Link as LinkIcon,
  Unlink,
  Plus,
  Send
} from "lucide-react";
import { Event } from "@/api/entities";
import { SocialConnection } from "@/api/entities";
import { User } from "@/api/entities";
import { Company } from "@/api/entities";
import { format } from "date-fns";

export default function SocialAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [platform, setPlatform] = useState("all");
  const [currentCompany, setCurrentCompany] = useState(null);
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  useEffect(() => {
    if (currentCompany) {
      loadScheduledPosts();
    }
  }, [platform, currentCompany]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [user, companies] = await Promise.all([
        User.me(),
        Company.list()
      ]);
      
      if (companies.length > 0) {
        const company = companies[0];
        setCurrentCompany(company);
        
        // Load connected social accounts
        const socialConnections = await SocialConnection.filter({ 
          company_id: company.id,
          status: 'connected'
        });
        setConnections(socialConnections);
        
        // Load published posts
        const publishedPosts = await Event.filter({ 
          company_id: company.id,
          type: 'post'
        }, '-created_date');
        setPosts(publishedPosts);
      }
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    }
    setIsLoading(false);
  };

  const loadScheduledPosts = async () => {
    if (!currentCompany) return;
    
    try {
      let filterConditions = {
        company_id: currentCompany.id,
        type: 'post',
        status: 'scheduled'
      };

      // Filter by platform if specific platform is selected
      if (platform !== 'all') {
        filterConditions.platform = platform;
      }

      const scheduled = await Event.filter(filterConditions, '-scheduled_at');
      setScheduledPosts(scheduled);
    } catch (error) {
      console.error("Failed to load scheduled posts:", error);
    }
  };

  const handleConnectPlatform = async (platformName) => {
    if (!currentCompany) return;
    
    try {
      // Check if already connected
      const existingConnection = connections.find(c => c.platform === platformName);
      
      if (existingConnection) {
        // Update status to connected (simulate connection)
        await SocialConnection.update(existingConnection.id, { 
          status: 'connected',
          account_name: `@your${platformName}account`
        });
      } else {
        // Create new connection
        await SocialConnection.create({
          platform: platformName,
          status: 'connected',
          account_name: `@your${platformName}account`,
          company_id: currentCompany.id
        });
      }
      
      // Reload connections
      await loadAnalyticsData();
    } catch (error) {
      console.error("Failed to connect platform:", error);
    }
  };

  const handleDisconnectPlatform = async (connectionId) => {
    try {
      await SocialConnection.update(connectionId, { status: 'disconnected' });
      await loadAnalyticsData();
    } catch (error) {
      console.error("Failed to disconnect platform:", error);
    }
  };

  const getPlatformIcon = (platform) => {
    switch(platform) {
      case "instagram": return Instagram;
      case "facebook": return Facebook;
      case "linkedin": return Linkedin;
      case "x": return X; // Changed from twitter to x
      case "youtube": return Youtube;
      default: return Share2;
    }
  };

  const getPlatformColor = (platform) => {
    switch(platform) {
      case "instagram": return "text-pink-600";
      case "facebook": return "text-blue-600";
      case "linkedin": return "text-blue-700";
      case "x": return "text-black"; // Changed from twitter to x, and color
      case "youtube": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const availablePlatforms = ['instagram', 'facebook', 'linkedin', 'x', 'youtube']; // Changed 'twitter' to 'x'
  const connectedPlatforms = connections.map(c => c.platform);
  const disconnectedPlatforms = availablePlatforms.filter(p => !connectedPlatforms.includes(p));

  // Generate mock analytics data for demonstration
  const generateMockData = () => {
    const totalPosts = posts.length;
    const totalReach = Math.floor(Math.random() * 50000 + 10000);
    const totalEngagement = Math.floor(Math.random() * 5000 + 1000);
    const avgEngagementRate = totalPosts > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) : 0;
    const followers = Math.floor(Math.random() * 10000 + 2000);
    
    return {
      totalPosts,
      totalReach,
      totalEngagement,
      avgEngagementRate,
      followers,
      impressions: Math.floor(totalReach * 1.5),
      clicks: Math.floor(totalEngagement * 0.3),
      saves: Math.floor(totalEngagement * 0.15)
    };
  };

  const mockData = generateMockData();

  const exportReport = () => {
    const reportData = {
      timeRange,
      platform,
      ...mockData,
      connectedPlatforms: connections.length,
      scheduledPosts: scheduledPosts.length,
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-analytics-${timeRange}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Analytics...</h3>
          <p>Fetching your social media performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into your social media performance across all platforms</p>
          </div>
          
          <div className="flex gap-3">
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="x">X</SelectItem> {/* Changed from Twitter to X */}
                <SelectItem value="youtube">YouTube</SelectItem>
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
            
            <Button 
              onClick={exportReport}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-100">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{mockData.totalReach.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Reach</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +8%
                </Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{mockData.totalEngagement.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Engagement</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-100">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +3%
                </Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{mockData.avgEngagementRate}%</div>
              <div className="text-sm text-gray-500">Engagement Rate</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15%
                </Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{mockData.followers.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Impressions</span>
                      <span className="text-sm text-gray-600">{mockData.impressions.toLocaleString()}</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Reach</span>
                      <span className="text-sm text-gray-600">{mockData.totalReach.toLocaleString()}</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Engagement</span>
                      <span className="text-sm text-gray-600">{mockData.totalEngagement.toLocaleString()}</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Clicks</span>
                      <span className="text-sm text-gray-600">{mockData.clicks.toLocaleString()}</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Posts Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  Scheduled Posts
                  {platform !== 'all' && (
                    <Badge className="capitalize bg-blue-100 text-blue-700">
                      {platform}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledPosts.length > 0 ? (
                  <div className="space-y-4">
                    {scheduledPosts.slice(0, 5).map((post) => {
                      const PlatformIcon = getPlatformIcon(post.platform);
                      return (
                        <div key={post.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <PlatformIcon className={`w-5 h-5 ${getPlatformColor(post.platform)}`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{post.title}</h4>
                                <p className="text-sm text-gray-500 capitalize">{post.platform}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-blue-600">
                                {format(new Date(post.scheduled_at), 'MMM d')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(post.scheduled_at), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
                        </div>
                      );
                    })}
                    
                    {scheduledPosts.length > 5 && (
                      <div className="text-center py-4">
                        <Button variant="outline" size="sm">
                          View All {scheduledPosts.length} Scheduled Posts
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No scheduled posts</h3>
                    <p className="text-xs">
                      {platform !== 'all' 
                        ? `No posts scheduled for ${platform}` 
                        : "Schedule your first post to see it here"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Best Performing Content */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold-600" />
                  Top Performing Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.slice(0, 5).map((post, index) => {
                      const PlatformIcon = getPlatformIcon(post.platform);
                      const engagement = Math.floor(Math.random() * 1000 + 100);
                      const reach = Math.floor(Math.random() * 5000 + 500);
                      
                      return (
                        <div key={post.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <PlatformIcon className={`w-5 h-5 ${getPlatformColor(post.platform)}`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{post.title}</h4>
                                <p className="text-sm text-gray-500 capitalize">{post.platform}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">{engagement} engagements</div>
                              <div className="text-xs text-gray-500">{reach} reach</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {Math.floor(engagement * 0.6)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {Math.floor(engagement * 0.2)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="w-4 h-4" />
                              {Math.floor(engagement * 0.15)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {Math.floor(engagement * 0.05)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No content performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Management */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-600" />
                  Platform Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Connected Platforms */}
                {connections.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Connected ({connections.length})</h4>
                    <div className="space-y-3">
                      {connections.map((connection) => {
                        const PlatformIcon = getPlatformIcon(connection.platform);
                        const followerCount = Math.floor(Math.random() * 10000 + 500);
                        return (
                          <div key={connection.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <PlatformIcon className={`w-6 h-6 ${getPlatformColor(connection.platform)}`} />
                              <div>
                                <h4 className="font-medium text-gray-900 capitalize">{connection.platform}</h4>
                                <p className="text-sm text-gray-500">{connection.account_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right mr-2">
                                <div className="text-sm font-semibold text-gray-900">{followerCount.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">followers</div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDisconnectPlatform(connection.id)}
                                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                              >
                                <Unlink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Platforms */}
                {disconnectedPlatforms.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Available to Connect</h4>
                    <div className="space-y-2">
                      {disconnectedPlatforms.map((platformName) => {
                        const PlatformIcon = getPlatformIcon(platformName);
                        return (
                          <div key={platformName} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <PlatformIcon className={`w-6 h-6 ${getPlatformColor(platformName)}`} />
                              <span className="font-medium text-gray-900 capitalize">{platformName}</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleConnectPlatform(platformName)}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <LinkIcon className="w-4 h-4 mr-1" />
                              Connect
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {connections.length === 0 && disconnectedPlatforms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Share2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No platforms available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scheduled Posts</span>
                  <span className="font-medium text-blue-600">{scheduledPosts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Posts per Week</span>
                  <span className="font-medium text-gray-900">{Math.floor(posts.length / 4)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Best Posting Time</span>
                  <span className="font-medium text-gray-900">2:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Top Platform</span>
                  <span className="font-medium text-gray-900">Instagram</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Growth Rate</span>
                  <Badge className="bg-green-100 text-green-700">+12.5%</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Posting Schedule */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{day}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${Math.floor(Math.random() * 80 + 20)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{Math.floor(Math.random() * 5 + 1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
