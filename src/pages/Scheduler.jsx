
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send, Clock, Plus, Calendar } from "lucide-react";
import { Event } from "@/api/entities";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import Loader from "../components/ui/Loader";
import { useToast } from "../components/ui/toast";
import { format } from 'date-fns';

export default function Scheduler() {
  const [allPosts, setAllPosts] = useState([]);
  const [filterStatus, setFilterStatus] = useState("scheduled"); // 'scheduled' or 'published'
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    platform: "instagram",
    scheduled_time: "10:00",
    scheduled_date: format(new Date(), 'yyyy-MM-dd')
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentCompany, setCurrentCompany] = useState(null);
  const { success, error } = useToast();

  const platforms = [
    { id: "instagram", name: "Instagram", color: "bg-pink-100 text-pink-700" },
    { id: "facebook", name: "Facebook", color: "bg-blue-100 text-blue-700" },
    { id: "twitter", name: "Twitter", color: "bg-sky-100 text-sky-700" },
    { id: "linkedin", name: "LinkedIn", color: "bg-indigo-100 text-indigo-700" },
    { id: "youtube", name: "YouTube", color: "bg-red-100 text-red-700" },
    { id: "pinterest", name: "Pinterest", color: "bg-red-100 text-red-700" }
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const companies = await Company.list();
      if (companies.length > 0) {
        const company = companies[0];
        setCurrentCompany(company);
        // Only fetch events of type 'post' for the scheduler
        const events = await Event.filter({ company_id: company.id, type: "post" }, "-scheduled_at");
        setAllPosts(events);
      }
    } catch (e) {
      error("Failed to load scheduler data.");
      console.error(e);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedulePost = async () => {
    if (!newPost.title.trim() || !newPost.scheduled_date || !newPost.scheduled_time || !currentCompany) {
      error("Please fill all fields.");
      return;
    }
    
    const [hours, minutes] = newPost.scheduled_time.split(':');
    const scheduled_at = new Date(newPost.scheduled_date);
    scheduled_at.setHours(parseInt(hours, 10));
    scheduled_at.setMinutes(parseInt(minutes, 10));

    try {
      await Event.create({
        title: newPost.title,
        platform: newPost.platform,
        scheduled_at: scheduled_at.toISOString(),
        status: "scheduled",
        type: "post", // Explicitly set type to 'post'
        company_id: currentCompany.id
      });

      success("Post Scheduled", `Your post "${newPost.title}" has been scheduled.`);
      setShowScheduleDialog(false);
      setNewPost({
        title: "",
        platform: "instagram",
        scheduled_time: "10:00",
        scheduled_date: format(new Date(), 'yyyy-MM-dd')
      });
      await loadData();
    } catch (e) {
      error("Scheduling Failed", "There was an issue scheduling your post.");
      console.error(e);
    }
  };

  if (isLoading) {
    return <Loader message="Loading your schedule..." />
  }

  const filteredPosts = allPosts.filter(post => post.status === filterStatus);

  return (
    <div className="p-8">
      <div className="w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-Platform Scheduler</h1>
            <p className="text-gray-600">Schedule and publish content across all social media platforms</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  <div>
                    <Label htmlFor="title">Post Content</Label>
                    <Textarea
                      id="title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      placeholder="What would you like to share?"
                      className="min-h-32 mt-2"
                    />
                  </div>

                  <div>
                    <Label>Select Platform</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                      {platforms.map((platform) => (
                        <div
                          key={platform.id}
                          onClick={() => setNewPost(prev => ({ ...prev, platform: platform.id }))}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            newPost.platform === platform.id
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{platform.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduled_date">Date</Label>
                      <Input
                        id="scheduled_date"
                        type="date"
                        value={newPost.scheduled_date}
                        onChange={(e) => setNewPost({...newPost, scheduled_date: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduled_time">Time</Label>
                      <Input
                        id="scheduled_time"
                        type="time"
                        value={newPost.scheduled_time}
                        onChange={(e) => setNewPost({...newPost, scheduled_time: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSchedulePost} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Send className="w-4 h-4 mr-2" />
                    Schedule Post
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg self-start">
            <Button
              onClick={() => setFilterStatus("scheduled")}
              variant={filterStatus === "scheduled" ? "default" : "ghost"}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                filterStatus === 'scheduled' ? 'bg-white text-purple-600 shadow' : 'text-gray-600'
              }`}
            >
              Scheduled
            </Button>
            <Button
              onClick={() => setFilterStatus("published")}
              variant={filterStatus === "published" ? "default" : "ghost"}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                filterStatus === 'published' ? 'bg-white text-purple-600 shadow' : 'text-gray-600'
              }`}
            >
              Published
            </Button>
        </div>


        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              <Clock className="w-5 h-5 text-purple-600" />
              {filterStatus} Posts ({filteredPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {filterStatus} posts</h3>
                <p>You currently have no {filterStatus} content.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => {
                  const platform = platforms.find(p => p.id === post.platform);
                  const statusBadgeColor = post.status === 'published' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700';

                  return (
                    <div key={post.id} className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">{post.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                        <Badge className={`${statusBadgeColor} capitalize`}>
                          {post.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                          <Badge className={`${platform?.color} capitalize`} variant="outline">
                            {platform?.name}
                          </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
