
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Clock,
  ArrowRight,
  Plus,
  Calendar,
  Sparkles } from
"lucide-react";
import { format } from "date-fns";

export default function SchedulerCard({ events = [] }) {
  // Filter scheduled posts (future events)
  const scheduledPosts = events.
  filter((e) => e.status === 'scheduled').
  sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)).
  slice(0, 4);

  // Get platform distribution
  const platformStats = events.reduce((acc, event) => {
    acc[event.platform] = (acc[event.platform] || 0) + 1;
    return acc;
  }, {});

  const topPlatforms = Object.entries(platformStats).
  sort(([, a], [, b]) => b - a).
  slice(0, 3);

  const totalScheduled = events.filter((e) => e.status === 'scheduled').length;
  const totalPublished = events.filter((e) => e.status === 'published').length;

  const platformColors = {
    instagram: "bg-pink-100 text-pink-700",
    facebook: "bg-blue-100 text-blue-700",
    twitter: "bg-sky-100 text-sky-700",
    linkedin: "bg-indigo-100 text-indigo-700",
    youtube: "bg-red-100 text-red-700",
    pinterest: "bg-red-100 text-red-700"
  };

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">Scheduler</CardTitle>
        <Link to={createPageUrl("Scheduler")}>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalScheduled}</div>
            <div className="text-sm text-blue-700">Scheduled</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalPublished}</div>
            <div className="text-sm text-green-700">Published</div>
          </div>
        </div>

        {/* Platform Distribution */}
        {topPlatforms.length > 0 &&
        <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Top Platforms</h4>
            <div className="space-y-2">
              {topPlatforms.map(([platform, count]) =>
            <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${platformColors[platform]} border-0 text-xs capitalize`}>
                      {platform}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{count} posts</span>
                </div>
            )}
            </div>
          </div>
        }

        {/* Upcoming Scheduled Posts */}
        {scheduledPosts.length > 0 ?
        <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Next Scheduled Posts
            </h4>
            <div className="space-y-2">
              {scheduledPosts.map((post) =>
            <div key={post.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-sm text-gray-900 truncate">{post.title}</h5>
                    <Badge className={`${platformColors[post.platform]} border-0 text-xs capitalize`}>
                      {post.platform}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(post.scheduled_at), 'MMM d, h:mm a')}
                  </div>
                </div>
            )}
            </div>
          </div> :

        <div className="text-center py-8 text-gray-500">
            <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No scheduled posts</h3>
            <p className="text-xs text-gray-600 mb-4">Start scheduling your content to reach your audience at the perfect time</p>
            <Link to={createPageUrl("Scheduler")}>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Schedule First Post
              </Button>
            </Link>
          </div>
        }

        {/* Quick Action - Fixed Responsive Layout */}
        <div className="flex flex-col gap-2 mt-6 pt-4 border-t">
          <Link to={createPageUrl("CreativeStudio")} className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Content
            </Button>
          </Link>
          <Link to={createPageUrl("Scheduler")} className="w-full">
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>);

}
