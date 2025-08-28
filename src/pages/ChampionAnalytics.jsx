import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Trophy, Target, DollarSign, Users, TrendingUp, Download } from 'lucide-react';
import { Campaign } from '@/api/entities';
import { Company } from '@/api/entities';
import { User } from '@/api/entities';
import Loader from '../components/ui/Loader';
import { subDays, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const platformColors = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  x: '#000000',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  youtube: '#FF0000',
};

export default function ChampionAnalytics() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        if (user.company_id) {
          const campaignsData = await Campaign.filter({ company_id: user.company_id });
          setCampaigns(campaignsData);
          if (campaignsData.length > 0) {
            setSelectedCampaign(campaignsData[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  const generateMockData = (campaign) => {
    if (!campaign) return { performanceData: [], kpis: {} };
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'MMM d'),
        impressions: Math.floor(Math.random() * 5000 + 1000),
        clicks: Math.floor(Math.random() * 500 + 100),
      });
    }
    return {
      performanceData: data,
      kpis: {
        totalBudget: campaign.budget || Math.floor(Math.random() * 5000 + 1000),
        cpc: (Math.random() * 3 + 0.5).toFixed(2),
        ctr: (Math.random() * 5 + 1).toFixed(2),
        conversions: Math.floor(Math.random() * 100 + 10),
      }
    };
  };

  const { performanceData, kpis } = generateMockData(selectedCampaign);
  
  const handleCampaignChange = (campaignId) => {
      const campaign = campaigns.find(c => c.id === campaignId);
      setSelectedCampaign(campaign);
  }

  if (isLoading) {
    return <Loader message="Loading campaign analytics..." />;
  }
  
  if (campaigns.length === 0) {
      return (
        <div className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold">No Campaigns Found</h2>
            <p className="text-gray-500">Create a campaign to start tracking its performance.</p>
        </div>
      )
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="w-full space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-purple-600" />
              Campaign Analytics
            </h1>
            <p className="text-gray-600">Deep dive into the performance of your marketing campaigns.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select onValueChange={handleCampaignChange} defaultValue={selectedCampaign?.id}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-white">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        {selectedCampaign && (
          <>
            <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>{selectedCampaign.title}</CardTitle>
                    <p className="text-gray-500 text-sm">{selectedCampaign.description}</p>
                    <div className="flex items-center gap-4 pt-2">
                        <Badge className="capitalize bg-green-100 text-green-700">{selectedCampaign.status}</Badge>
                        <div className="flex items-center gap-2">
                            {selectedCampaign.platforms?.map(p => (
                                <div key={p} style={{color: platformColors[p]}} className="w-5 h-5">{p.charAt(0).toUpperCase()}</div>
                            ))}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  <DollarSign className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${kpis.totalBudget?.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Cost Per Click (CPC)</CardTitle>
                  <Target className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${kpis.cpc}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Click-Through Rate (CTR)</CardTitle>
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.ctr}%</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <Users className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.conversions}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Performance Trend (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255, 255, 255, 0.9)",
                        border: "1px solid #ccc",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="impressions" fill="#8884d8" name="Impressions" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}