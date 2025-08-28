import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity as ActivityIcon } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export default function RecentActivity({ activities = [] }) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Update every 10 seconds for real-time timestamps
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Show only latest 10 activities
  const recentActivities = activities.slice(0, 10);

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-purple-600" />
          Recent Activity
        </CardTitle>
        <Link to={createPageUrl("Activities")}>
          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
            See All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <ActivityIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activity yet.</p>
            <p className="text-sm mt-1">Create tasks, events, or campaigns to see activity here.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full flex-shrink-0 mt-0.5">
                  <ActivityIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: activity.description }} />
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.created_date ? formatDistanceToNow(new Date(activity.created_date), { addSuffix: true }) : 'Unknown time'}
                  </p>
                </div>
              </div>
            ))}
            {activities.length > 10 && (
              <div className="text-center pt-4 border-t border-gray-100">
                <Link to={createPageUrl("Activities")}>
                  <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                    View {activities.length - 10} more activities
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}