
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Campaign } from "@/api/entities";
import { Task } from "@/api/entities";
import { Event } from "@/api/entities";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import { Activity } from "@/api/entities";
import { Deal } from "@/api/entities";
import { Lead } from "@/api/entities";
import { Contact } from "@/api/entities";
import { format, isAfter, startOfDay, isSameDay, isBefore } from "date-fns";
import Loader from "../components/ui/Loader";
import { Target, DollarSign, Users, Clock, Calendar, ArrowRight, TrendingUp, Instagram, Facebook, Linkedin, Youtube, RefreshCw, Rss } from "lucide-react";
import { useToast } from "../components/ui/toast";
import { apiThrottler } from "@/components/utils/apiThrottle";

import QuickActions from "../components/dashboard/QuickActions";
import SchedulerCard from "../components/dashboard/SchedulerCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import HighPriorityTasks from "../components/dashboard/HighPriorityTasks";
import TaskQuickModal from "../components/tasks/TaskQuickModal";

// Social media icons with brand colors
const InstagramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#E4405F">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266-.058-1.644-.07-4.85-.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF0000">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [dataErrors, setDataErrors] = useState({});

  const { success, error: toastError } = useToast();

  // FIXED: Clear all data when company changes to ensure data isolation
  const clearAllData = useCallback(() => {
    setCampaigns([]);
    setTasks([]);
    setEvents([]);
    setActivities([]);
    setDeals([]);
    setLeads([]);
    setContacts([]);
    setDataErrors({});
  }, []);

  const loadDataSafely = useCallback(async (entityFn, entityName, setter) => {
    try {
      const data = await apiThrottler.throttledRequest(entityFn);
      setter(data);
      setDataErrors(prev => ({ ...prev, [entityName]: null }));
    } catch (error) {
      console.warn(`Failed to load ${entityName}:`, error.message);
      toastError(`Failed to load ${entityName}`, "Some data may be unavailable.");
      setDataErrors(prev => ({ ...prev, [entityName]: error.message }));
      setter([]); // Set empty array as fallback
    }
  }, [toastError]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    clearAllData(); // Always clear data before loading
    try {
      const userData = await apiThrottler.throttledRequest(() => User.me());
      setUser(userData);

      if (userData && userData.company_id) {
        let company;
        try {
          company = await apiThrottler.throttledRequest(() => Company.get(userData.company_id));
          setCurrentCompany(company);
        } catch (error) {
          console.error("Failed to load company:", error);
          toastError("Company Load Failed", "Could not load your company's data. Please try refreshing.");
          setCurrentCompany(null);
          setIsLoading(false); // Stop loading and return early if company data fails
          return;
        }

        // FIXED: Clear all data first, then load data filtered by company_id
        clearAllData();
        
        // Load data sequentially with throttling - FILTERED BY COMPANY_ID
        await loadDataSafely(() => Campaign.filter({ company_id: userData.company_id }), 'campaigns', setCampaigns);
        
        await loadDataSafely(() => Task.filter({ company_id: userData.company_id }), 'tasks', setTasks);
        
        await loadDataSafely(() => Event.filter({ company_id: userData.company_id }), 'events', setEvents);
        
        await loadDataSafely(() => Activity.filter({ company_id: userData.company_id }, "-created_date", 20), 'activities', setActivities);
        
        await loadDataSafely(() => Deal.filter({ company_id: userData.company_id }), 'deals', setDeals);
        
        await loadDataSafely(() => Lead.filter({ company_id: userData.company_id }), 'leads', setLeads);
        
        await loadDataSafely(() => Contact.filter({ company_id: userData.company_id }), 'contacts', setContacts);

      } else {
        // Reset all data if no user or company
        clearAllData();
        setCurrentCompany(null);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      if (error.message.toLowerCase().includes('network')) {
        toastError("Network Error", "Please check your internet connection and try again.");
      } else {
        toastError("Dashboard Load Failed", "Some data may be unavailable due to an error.");
      }
    }
    setIsLoading(false);
  }, [toastError, clearAllData, loadDataSafely]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleOpenTaskModal = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdated = async () => {
    if (currentCompany) {
      try {
        const tasksData = await apiThrottler.throttledRequest(() => Task.filter({ company_id: currentCompany.id }));
        setTasks(tasksData);
      } catch (error) {
        console.error("Failed to reload tasks:", error);
      }
    }
  };

  if (isLoading) {
    return <Loader message="Loading your marketing dashboard..." />;
  }

  const completedTasks = tasks.filter((t) => t.status === 'done');
  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const highPriorityTasks = tasks.filter((t) => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'done');
  const overdueTasks = tasks.filter(t => t.due_date && isBefore(new Date(t.due_date), startOfDay(new Date())) && t.status !== 'done');

  // These are still used in CRM Quick Stats and other calculations, so keep them for reusability and clarity.
  const wonDeals = deals.filter((d) => d.stage === 'won');
  const totalRevenue = wonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const averageDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
  const pipelineValue = deals.filter((d) => ['qualified', 'proposal'].includes(d.stage)).reduce((sum, deal) => sum + (deal.amount || 0), 0);


  // Get upcoming events (today and future) - only general events, not posts
  const upcomingEvents = events.
    filter((e) => e.type === 'general' && (isAfter(new Date(e.scheduled_at), startOfDay(new Date())) || isSameDay(new Date(e.scheduled_at), new Date()))).
    sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  // Mock social media data for enhanced display
  const socialMediaData = {
    platforms: [
      { name: 'Instagram', followers: Math.floor(Math.random() * 5000 + 2000), engagement: Math.floor(Math.random() * 200 + 50), icon: InstagramIcon, color: 'text-pink-600', bgColor: 'bg-pink-100' },
      { name: 'Facebook', followers: Math.floor(Math.random() * 3000 + 1500), engagement: Math.floor(Math.random() * 150 + 30), icon: FacebookIcon, color: 'text-blue-600', bgColor: 'bg-blue-100' },
      { name: 'LinkedIn', followers: Math.floor(Math.random() * 2000 + 800), engagement: Math.floor(Math.random() * 100 + 20), icon: LinkedInIcon, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
      { name: 'X', followers: Math.floor(Math.random() * 4000 + 1200), engagement: Math.floor(Math.random() * 180 + 40), icon: XIcon, color: 'text-black', bgColor: 'bg-gray-100' },
      { name: 'YouTube', followers: Math.floor(Math.random() * 6000 + 3000), engagement: Math.floor(Math.random() * 300 + 100), icon: YouTubeIcon, color: 'text-red-600', bgColor: 'bg-red-100' }],

    totalReach: Math.floor(Math.random() * 50000 + 15000),
    totalEngagement: Math.floor(Math.random() * 5000 + 1500),
    impressions: Math.floor(Math.random() * 80000 + 25000),
    growthRate: (Math.random() * 20 + 5).toFixed(1)
  };

  return (
    <>
      <div className="px-0 py-4 lg:py-6 xl:py-8">
        <div className="px-4 lg:px-6 xl:px-8 space-y-6 lg:space-y-8">
          {/* Welcome Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                Good morning, {user?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-sm lg:text-base text-gray-600">Here's what's happening with your marketing and sales today.</p>
            </div>
            <QuickActions />
          </div>

          {/* FIXED: Clean White KPI Cards - removed colorful backgrounds */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Active Campaigns */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium">+12% this month</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">Active Campaigns</h3>
                  <div className="text-3xl font-bold text-gray-900">{campaigns.filter(c => c.status === 'active').length}</div>
                  <div className="text-xs text-gray-500">campaigns running</div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                       style={{ width: `${Math.min((campaigns.filter(c => c.status === 'active').length / 10) * 100, 100)}%` }} />
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Deals */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium">+8% this week</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">Pipeline Deals</h3>
                  <div className="text-3xl font-bold text-gray-900">{deals.filter(d => ['qualified', 'proposal'].includes(d.stage)).length}</div>
                  <div className="text-xs text-gray-500">active opportunities</div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                       style={{ width: `${Math.min((deals.filter(d => ['qualified', 'proposal'].includes(d.stage)).length / 20) * 100, 100)}%` }} />
                </div>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium">+24% this quarter</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
                  <div className="text-3xl font-bold text-gray-900">${(deals.filter(d => d.stage === 'won').reduce((sum, deal) => sum + (deal.amount || 0), 0) / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-500">total closed</div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                       style={{ width: `${Math.min((deals.filter(d => d.stage === 'won').reduce((sum, deal) => sum + (deal.amount || 0), 0) / 50000) * 100, 100)}%` }} />
                </div>
              </CardContent>
            </Card>

            {/* New Leads */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium">+16% this week</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">New Leads</h3>
                  <div className="text-3xl font-bold text-gray-900">{leads.filter(l => l.status === 'new').length}</div>
                  <div className="text-xs text-gray-500">need follow-up</div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                       style={{ width: `${Math.min((leads.filter(l => l.status === 'new').length / 15) * 100, 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error indicators for failed data loads */}
          {Object.keys(dataErrors).some(key => dataErrors[key] !== null) && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="text-sm text-yellow-800">
                  <strong>Notice:</strong> Some data couldn't be loaded due to network issues. Showing available data only.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Width Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content Area - Responsive */}
            <div className="xl:col-span-2 space-y-6 lg:space-y-8">
              {/* Upcoming Events Section */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    Upcoming Events
                  </CardTitle>
                  <Link to={createPageUrl("Calendar")}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      View Calendar
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingEvents.slice(0, 5).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                              <Badge className="bg-gray-200 text-gray-700 border-0 text-xs">
                                Event
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(event.scheduled_at), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                        </div>
                      ))}
                      {upcomingEvents.length > 5 && (
                        <div className="text-center py-2">
                          <Link to={createPageUrl("Calendar")}>
                            <Button variant="outline" size="sm">
                              View All {upcomingEvents.length} Events
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">No upcoming events</h3>
                      <p className="text-xs text-gray-600 mb-4">Schedule your first event to get started</p>
                      <Link to={createPageUrl("Calendar")}>
                        <Button variant="outline" size="sm">
                          Schedule Event
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* High Priority Tasks */}
              <HighPriorityTasks tasks={highPriorityTasks} onTaskSelect={handleOpenTaskModal} />

              {/* Enhanced Social Media Overview */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                    </div>
                    Social Media Performance
                  </CardTitle>
                  <Link to={createPageUrl("SocialAnalytics")}>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-800">{socialMediaData.totalReach.toLocaleString()}</div>
                      <p className="text-sm text-gray-600">Total Reach</p>
                      <p className="text-xs text-green-600 font-medium mt-1">+{socialMediaData.growthRate}%</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-800">{socialMediaData.totalEngagement.toLocaleString()}</div>
                      <p className="text-sm text-gray-600">Engagement</p>
                      <p className="text-xs text-green-600 font-medium mt-1">+12.3%</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-800">{events.filter((e) => e.status === 'scheduled' && e.type === 'post').length}</div>
                      <p className="text-sm text-gray-600">Scheduled Posts</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-800">{socialMediaData.impressions.toLocaleString()}</div>
                      <p className="text-sm text-gray-600">Impressions</p>
                      <p className="text-xs text-green-600 font-medium mt-1">+8.7%</p>
                    </div>
                  </div>

                  {/* Platform Breakdown with Brand Colors */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Platform Performance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {socialMediaData.platforms.map((platform) => {
                        const IconComponent = platform.icon;
                        return (
                          <div key={platform.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 bg-white rounded-lg border`}>
                                <IconComponent />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{platform.name}</div>
                                <div className="text-sm text-gray-500">{platform.followers.toLocaleString()} followers</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{platform.engagement}</div>
                              <div className="text-sm text-gray-500">engagements</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <RecentActivity activities={activities} />
            </div>

            {/* Sidebar - Responsive */}
            <div className="space-y-4 lg:space-y-6">
              {/* Scheduler Card */}
              <SchedulerCard events={events} />

              {/* CRM Quick Stats */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">CRM Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pipeline Value</span>
                    <span className="font-medium text-purple-600">
                      ${pipelineValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Won Deals</span>
                    <span className="font-medium text-green-600">{wonDeals.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Deal Size</span>
                    <span className="font-medium text-blue-600">${averageDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Contacts</span>
                    <span className="font-medium text-gray-600">{contacts.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Task Progress */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Task Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tasks Completed</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {completedTasks.length}/{tasks.length}
                    </Badge>
                  </div>
                  <Progress
                    value={tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}
                    className="h-2 [&>div]:bg-purple-600" />

                  <div className="border-t pt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>Pending Tasks</span>
                      <span className="font-medium text-gray-800">{pendingTasks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>Overdue Tasks</span>
                      <span className="font-medium text-red-600">{overdueTasks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div>High Priority</span>
                      <span className="font-medium text-gray-800">{highPriorityTasks.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {isTaskModalOpen && selectedTask && (
        <TaskQuickModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          onUpdate={handleTaskUpdated}
          taskId={selectedTask.id}
          user={user}
          companyId={currentCompany?.id}
        />
      )}
    </>
  );
}
