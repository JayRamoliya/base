
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Download,
  Target,
  Building2,
  Sparkles,
  Mail
} from "lucide-react";
import { Event } from "@/api/entities";
import { Campaign } from "@/api/entities";
import { User } from "@/api/entities";
import { Company } from "@/api/entities"; // Keep import, might be used elsewhere or in future, not directly in this change
import { Deal } from "@/api/entities";
import { Contact } from "@/api/entities";
import { Lead } from "@/api/entities";
import { format, subDays, isWithinInterval } from "date-fns";
import Loader from "../components/ui/Loader";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    events: [],
    campaigns: [],
    deals: [],
    leads: [],
    contacts: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]); // Added timeRange to dependency array to re-fetch when it changes

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me(); // Fetch current user
      if (user && user.company_id) { // Check if user and company_id exist
        const [eventsData, campaignsData, dealsData, leadsData, contactsData] = await Promise.all([
          Event.filter({ company_id: user.company_id }), // Filter by user's company_id
          Campaign.filter({ company_id: user.company_id }),
          Deal.filter({ company_id: user.company_id }),
          Lead.filter({ company_id: user.company_id }),
          Contact.filter({ company_id: user.company_id })
        ]);

        setAnalyticsData({
          events: eventsData,
          campaigns: campaignsData,
          deals: dealsData,
          leads: leadsData,
          contacts: contactsData
        });
      } else {
        // Clear data if no company_id is found for the user
        setAnalyticsData({ events: [], campaigns: [], deals: [], leads: [], contacts: [] });
      }
    } catch (error) {
      console.error("Failed to load analytics data:", error);
      // Optionally, clear data on error or show an error message
      setAnalyticsData({ events: [], campaigns: [], deals: [], leads: [], contacts: [] });
    }
    setIsLoading(false);
  };

  const getFilteredData = (data) => {
    const now = new Date();
    let startDate;

    switch(timeRange) {
      case "7d": startDate = subDays(now, 7); break;
      case "30d": startDate = subDays(now, 30); break;
      case "90d": startDate = subDays(now, 90); break;
      default: startDate = subDays(now, 30);
    }

    // Ensure created_date is parsed correctly and interval check is inclusive
    return data.filter(item => {
      const itemDate = new Date(item.created_date);
      // Ensure date comparison is robust, potentially converting to UTC or ensuring consistency if created_date might be in local time
      // For simplicity, assuming item.created_date is ISO string or compatible
      return isWithinInterval(itemDate, { start: startDate, end: now });
    });
  };

  const filteredEvents = getFilteredData(analyticsData.events);
  const filteredCampaigns = getFilteredData(analyticsData.campaigns);
  const filteredDeals = getFilteredData(analyticsData.deals);
  const filteredLeads = getFilteredData(analyticsData.leads);

  const socialMetrics = {
    totalImpressions: filteredEvents.length * 1500 + 5000, // mock calculation
    totalReach: filteredEvents.length * 800 + 3000,
    totalEngagement: filteredEvents.length * 50 + 200,
    engagementRate: filteredEvents.length > 0 ? ((filteredEvents.length * 50 + 200) / (filteredEvents.length * 800 + 3000) * 100).toFixed(2) : 0,
  };

  const crmMetrics = {
    activeDeals: filteredDeals.filter(d => ['qualified', 'proposal'].includes(d.stage)).length,
    pipelineValue: filteredDeals.filter(d => ['qualified', 'proposal'].includes(d.stage)).reduce((sum, d) => sum + (d.amount || 0), 0),
    conversionRate: filteredDeals.length > 0 ? (filteredDeals.filter(d => d.stage === 'won').length / filteredDeals.length * 100).toFixed(1) : 0,
    newLeads: filteredLeads.length
  };

  const contentMetrics = {
    postsPublished: filteredEvents.filter(e => e.type === 'post').length,
    avgEngagement: filteredEvents.filter(e => e.type === 'post').length > 0 ? (socialMetrics.totalEngagement / filteredEvents.filter(e => e.type === 'post').length).toFixed(1) : 0,
  };

  const campaignMetrics = {
    activeCampaigns: filteredCampaigns.filter(c => c.status === 'active').length,
    totalBudget: filteredCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
    roas: 3.5 // mock
  };

  const exportData = () => {
    // Placeholder for export logic
    console.log("Exporting data...");
    alert("Export functionality not yet implemented!");
  };

  if (isLoading) {
      return <Loader message="Crunching the numbers..." />
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="w-full space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into your marketing performance</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Removed loadAnalyticsData() from onValueChange as useEffect will now handle it */}
            <Select value={timeRange} onValueChange={v => setTimeRange(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Social Media Analytics */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Social Media Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="p-4 rounded-lg bg-gray-50 border">
              <div className="text-xs md:text-sm text-gray-500 mb-2">Total Impressions</div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{socialMetrics.totalImpressions.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border">
              <div className="text-xs md:text-sm text-gray-500 mb-2">Total Reach</div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{socialMetrics.totalReach.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border">
              <div className="text-xs md:text-sm text-gray-500 mb-2">Total Engagement</div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{socialMetrics.totalEngagement.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border">
              <div className="text-xs md:text-sm text-gray-500 mb-2">Engagement Rate</div>
              <div className="text-2xl md:text-3xl font-bold text-purple-600">{socialMetrics.engagementRate}%</div>
            </div>
          </CardContent>
        </Card>

        {/* Other Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Building2 className="w-6 h-6 text-green-600" />
                CRM Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <div className="text-xs text-gray-500 mb-1">New Leads</div>
                  <div className="text-2xl font-bold text-gray-900">{crmMetrics.newLeads}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <div className="text-xs text-gray-500 mb-1">Active Deals</div>
                  <div className="text-2xl font-bold text-gray-900">{crmMetrics.activeDeals}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">Conversion Rate</span>
                  <span className="font-bold text-green-600">{crmMetrics.conversionRate}%</span>
                </div>
                <Progress value={parseFloat(crmMetrics.conversionRate)} className="h-2 [&>div]:bg-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">Pipeline Value</span>
                  <span className="font-bold text-gray-900">${crmMetrics.pipelineValue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Sparkles className="w-6 h-6 text-orange-500" />
                Content Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <div className="text-xs text-gray-500 mb-1">Posts Published</div>
                  <div className="text-2xl font-bold text-gray-900">{contentMetrics.postsPublished}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <div className="text-xs text-gray-500 mb-1">Avg. Engagement</div>
                  <div className="text-2xl font-bold text-orange-500">{contentMetrics.avgEngagement}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Target className="w-6 h-6 text-red-600" />
                Campaign Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <div className="text-xs text-gray-500 mb-1">Active Campaigns</div>
                  <div className="text-2xl font-bold text-gray-900">{campaignMetrics.activeCampaigns}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <div className="text-xs text-gray-500 mb-1">Total Budget</div>
                  <div className="text-2xl font-bold text-gray-900">${campaignMetrics.totalBudget.toLocaleString()}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">Return on Ad Spend (ROAS)</span>
                  <span className="font-bold text-red-600">{campaignMetrics.roas}x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
