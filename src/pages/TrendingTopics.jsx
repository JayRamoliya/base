import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Rss, 
  ExternalLink, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Newspaper,
  Globe,
  Building2,
  Laptop,
  Microscope,
  Code,
  Gamepad2,
  Film,
  Tv,
  Music,
  Palette,
  Camera,
  UtensilsCrossed,
  Plane,
  Dumbbell,
  Heart,
  Shirt,
  BookOpen,
  DollarSign,
  Bitcoin,
  Rocket,
  GraduationCap,
  HelpCircle,
  Smile,
  Lightbulb,
  Wrench,
  Zap
} from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import Loader from "../components/ui/Loader";

const redditCategories = [
  { id: "all", name: "All", subreddit: "all", icon: Globe },
  { id: "news", name: "News", subreddit: "news", icon: Newspaper },
  { id: "worldnews", name: "World News", subreddit: "worldnews", icon: Globe },
  { id: "politics", name: "Politics", subreddit: "politics", icon: Building2 },
  { id: "technology", name: "Technology", subreddit: "technology", icon: Laptop },
  { id: "science", name: "Science", subreddit: "science", icon: Microscope },
  { id: "programming", name: "Programming", subreddit: "programming", icon: Code },
  { id: "webdev", name: "Web Development", subreddit: "webdev", icon: Code },
  { id: "reactjs", name: "ReactJS", subreddit: "reactjs", icon: Code },
  { id: "javascript", name: "JavaScript", subreddit: "javascript", icon: Code },
  { id: "sports", name: "Sports", subreddit: "sports", icon: Gamepad2 },
  { id: "gaming", name: "Gaming", subreddit: "gaming", icon: Gamepad2 },
  { id: "movies", name: "Movies", subreddit: "movies", icon: Film },
  { id: "television", name: "Television", subreddit: "television", icon: Tv },
  { id: "music", name: "Music", subreddit: "music", icon: Music },
  { id: "art", name: "Art", subreddit: "art", icon: Palette },
  { id: "photography", name: "Photography", subreddit: "photography", icon: Camera },
  { id: "food", name: "Food", subreddit: "food", icon: UtensilsCrossed },
  { id: "travel", name: "Travel", subreddit: "travel", icon: Plane },
  { id: "fitness", name: "Fitness", subreddit: "fitness", icon: Dumbbell },
  { id: "health", name: "Health", subreddit: "health", icon: Heart },
  { id: "fashion", name: "Fashion", subreddit: "fashion", icon: Shirt },
  { id: "books", name: "Books", subreddit: "books", icon: BookOpen },
  { id: "personalfinance", name: "Personal Finance", subreddit: "personalfinance", icon: DollarSign },
  { id: "cryptocurrency", name: "Cryptocurrency", subreddit: "cryptocurrency", icon: Bitcoin },
  { id: "business", name: "Business", subreddit: "business", icon: Building2 },
  { id: "startups", name: "Startups", subreddit: "startups", icon: Rocket },
  { id: "education", name: "Education", subreddit: "education", icon: GraduationCap },
  { id: "askreddit", name: "AskReddit", subreddit: "AskReddit", icon: HelpCircle },
  { id: "funny", name: "Funny", subreddit: "funny", icon: Smile },
  { id: "todayilearned", name: "Today I Learned", subreddit: "todayilearned", icon: Lightbulb },
  { id: "lifehacks", name: "Life Hacks", subreddit: "lifehacks", icon: Wrench },
  { id: "productivity", name: "Productivity", subreddit: "productivity", icon: Zap },
];

export default function TrendingTopics() {
  const [selectedCategory, setSelectedCategory] = useState(redditCategories[0]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      fetchTopicsForCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchTopicsForCategory = async (category) => {
    setIsLoading(true);
    setTopics([]);
    try {
      const response = await InvokeLLM({
        prompt: `Get the current TOP 10 HOTTEST and MOST TRENDING posts from Reddit's r/${category.subreddit} that are trending RIGHT NOW. These should be the most recent viral posts with high engagement happening today.

For each trending post, extract:
- title (exact post title)
- score (current upvotes)  
- num_comments (current comment count)
- author (Reddit username)
- permalink (Reddit post link)

IMPORTANT: Only return posts that are currently trending with HIGH engagement (500+ upvotes preferred). Focus on posts from the last 24-48 hours that are gaining momentum.

Format as JSON with this structure:`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            posts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  score: { type: "number" },
                  num_comments: { type: "number" },
                  author: { type: "string" },
                  permalink: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      if (response.posts && Array.isArray(response.posts)) {
        const sortedPosts = response.posts
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 10);
        setTopics(sortedPosts);
      }
    } catch (error) {
      console.error("Failed to fetch Reddit topics:", error);
      setTopics([]);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="w-full max-w-screen-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trending Topics</h1>
          <p className="text-gray-600">Discover viral content ideas from Reddit to fuel your marketing strategy</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Sidebar: Categories */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Rss className="w-5 h-5 text-purple-600" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="pr-2">
                <div className="space-y-1 max-h-[65vh] overflow-y-auto">
                  {redditCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors duration-200 ${
                          selectedCategory.id === category.id 
                            ? 'bg-purple-100 text-purple-700 font-semibold' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 flex-shrink-0 ${selectedCategory.id === category.id ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content: Topics */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                Trending in <span className="text-purple-600">{selectedCategory.name}</span>
              </h2>
              <Button 
                onClick={() => fetchTopicsForCategory(selectedCategory)} 
                disabled={isLoading} 
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Topics
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="bg-white border-0 shadow-sm animate-pulse">
                    <CardContent className="p-6 h-48">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : topics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topics.map((topic, index) => (
                  <Card key={`${topic.permalink}-${index}`} className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col">
                    <CardContent className="p-6 flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-2xl font-bold text-purple-600">#{index + 1}</span>
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                          🔥 {(topic.score || 0).toLocaleString()} upvotes
                        </Badge>
                      </div>
                      
                      <h3 className="text-base font-semibold text-gray-900 mb-3 leading-tight group-hover:text-purple-700 transition-colors">
                        {topic.title}
                      </h3>
                    </CardContent>
                    <div className="p-6 border-t mt-auto">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{topic.num_comments || 0} comments</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <Users className="w-4 h-4" />
                          <span className="truncate">u/{topic.author || 'unknown'}</span>
                        </div>
                      </div>
                      <Link
                        to={createPageUrl(`TopicDetail?topic=${encodeURIComponent(topic.title)}&category=${selectedCategory.subreddit}`)}
                        className="w-full"
                      >
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Create Content From Topic
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="text-center py-24">
                  <Rss className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No trending topics found</h3>
                  <p className="text-gray-600">Try refreshing or selecting a different category.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}