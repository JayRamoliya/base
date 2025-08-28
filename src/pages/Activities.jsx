import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity as ActivityIcon, Filter, Search, Trash2, RefreshCw } from "lucide-react";
import { Activity } from "@/api/entities";
import { User } from "@/api/entities";
import { Company } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Loader from "../components/ui/Loader";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());
  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [userData, companiesData] = await Promise.all([User.me(), Company.list()]);
        setUser(userData);
        if (companiesData.length > 0) {
          setCurrentCompany(companiesData[0]);
          const [activitiesData, teamData] = await Promise.all([
            loadActivities(companiesData[0].id),
            User.filter({ company_id: companiesData[0].id })
          ]);
          setTeamMembers(teamData);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    // Real-time sync - fetch activities every 30 seconds for all team members
    const interval = setInterval(() => {
      if (currentCompany) {
        loadActivities(currentCompany.id, true); // true for background refresh
      }
    }, 30000); // 30 seconds for real-time feel

    return () => clearInterval(interval);
  }, [currentCompany]);

  // Listen for storage events to sync across tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'activity_update' && currentCompany) {
        loadActivities(currentCompany.id, true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentCompany]);
  
  const loadActivities = async (companyId, isBackgroundRefresh = false) => {
    if (!companyId) return;
    
    if (!isBackgroundRefresh) {
      setIsLoading(true);
    }
    
    try {
      const allActivities = await Activity.filter({ company_id: companyId }, "-created_date", 200);
      setActivities(allActivities);
      setLastFetchTime(Date.now());
      
      // Notify other tabs about the update
      localStorage.setItem('activity_update', Date.now().toString());
      
    } catch (e) {
      console.error("Failed to load activities", e);
    } finally {
      if (!isBackgroundRefresh) {
        setIsLoading(false);
      }
    }
  };
  
  const handleDeleteActivity = async (activityId) => {
    if (confirm("Are you sure you want to delete this activity log?")) {
      try {
        await Activity.delete(activityId);
        await loadActivities(currentCompany.id);
      } catch (e) {
        console.error("Failed to delete activity", e);
      }
    }
  };

  const handleRefresh = () => {
    if (currentCompany) {
      loadActivities(currentCompany.id);
    }
  };

  const getUserAvatar = (userName) => {
    const member = teamMembers.find(m => 
      m.full_name === userName || 
      m.email === userName
    );
    return member;
  };

  const formatActivityDate = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    try {
      // Parse the created_date properly
      const activityDate = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(activityDate.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const timeDiff = now - activityDate;
      
      // If less than 1 minute ago, show "Just now"
      if (timeDiff < 60000) {
        return 'Just now';
      }
      
      // If today, show time only
      if (activityDate.toDateString() === now.toDateString()) {
        return activityDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      
      // If yesterday, show "Yesterday at time"
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (activityDate.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${activityDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`;
      }
      
      // Otherwise show full date and time
      return activityDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid time';
    }
  };
  
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || activity.type === typeFilter;
    return matchesSearch && matchesType;
  });
  
  if (isLoading) {
    return <Loader message="Loading activity feed..." />;
  }

  return (
    <div className="p-8">
      <div className="w-full space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Activities</h1>
            <p className="text-gray-600">Real-time log of all activities across your workspace.</p>
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <Card className="shadow-sm border-0 bg-white">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-purple-600" />
                Team Activity Feed
                <Badge className="bg-green-100 text-green-700 text-xs">
                  Live • {activities.length} activities
                </Badge>
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="status_change">Status Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredActivities.length > 0 ? (
              <div className="space-y-4">
                {filteredActivities.map(activity => {
                  const userMember = getUserAvatar(activity.user_name);
                  
                  return (
                    <div key={activity.id} className="flex items-start gap-4 group">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        <Avatar className="w-10 h-10">
                          {userMember?.avatar_url ? (
                            <img 
                              src={userMember.avatar_url} 
                              alt={activity.user_name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                              {activity.user_name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: activity.description }} />
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-medium text-purple-600">
                            {formatActivityDate(activity.created_date)}
                          </p>
                          {activity.entity_type && (
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              {activity.entity_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => handleDeleteActivity(activity.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <ActivityIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity found</h3>
                <p>
                  {searchTerm || typeFilter !== "all" 
                    ? "Try adjusting your filters or create some content to see activity here." 
                    : "No activity yet. Create tasks, events, or campaigns to see activity here."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}