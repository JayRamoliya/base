
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Target, Users, Building2, UserCheck, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Deal } from "@/api/entities";
import { Lead } from "@/api/entities";
import { Contact } from "@/api/entities";
import { CrmCompany } from "@/api/entities";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import Loader from "../components/ui/Loader";
import { useToast } from "../components/ui/toast";

const COLORS = ['#8B5CF6', '#34D399', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1'];

export default function CrmReports() {
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [crmCompanies, setCrmCompanies] = useState([]);
  const [users, setUsers] = useState([]); // New state for users
  const [isLoading, setIsLoading] = useState(true);
  const [currentCompany, setCurrentCompany] = useState(null);
  const { success, error } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const companiesData = await Company.list();
      if (companiesData.length > 0) {
        const company = companiesData[0];
        setCurrentCompany(company);

        const [dealsData, leadsData, contactsData, crmCompaniesData, usersData] = await Promise.all([
        Deal.filter({ company_id: company.id }),
        Lead.filter({ company_id: company.id }),
        Contact.filter({ company_id: company.id }),
        CrmCompany.filter({ company_id: company.id }),
        User.list() // Fetch users
        ]);

        setDeals(dealsData);
        setLeads(leadsData);
        setContacts(contactsData);
        setCrmCompanies(crmCompaniesData);
        setUsers(usersData); // Set users state
        // success("CRM Data Loaded", "Reports updated successfully."); // Optional: success toast
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      error("Data Load Failed", "Could not load CRM reports data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only attempt to load data if a company has been set
      if (currentCompany) {
        loadData();
      }
    }, 30000); // Fetch data every 30 seconds
    return () => clearInterval(interval); // Clear interval on component unmount
  }, [currentCompany]); // Re-run effect if currentCompany changes (though it's set once)

  // Calculate metrics
  const wonDeals = deals.filter((d) => d.stage === 'won');
  const lostDeals = deals.filter((d) => d.stage === 'lost');
  const totalClosedDeals = wonDeals.length + lostDeals.length;
  const winRate = totalClosedDeals > 0 ? wonDeals.length / totalClosedDeals * 100 : 0;
  const totalRevenue = wonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const averageDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0; // Fix: Changed 'wonDeels.length' to 'wonDeals.length'
  const pipelineValue = deals.filter((d) => ['qualified', 'proposal'].includes(d.stage)).reduce((sum, deal) => sum + (deal.amount || 0), 0);

  // Prepare chart data
  const dealsByStage = deals.reduce((acc, deal) => {
    const stage = deal.stage || 'qualified';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const dealsByStageData = Object.entries(dealsByStage).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    amount: deals.filter((d) => d.stage === name).reduce((sum, d) => sum + (d.amount || 0), 0)
  }));

  const leadsByStatus = leads.reduce((acc, lead) => {
    const status = lead.status || 'new';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const leadsByStatusData = Object.entries(leadsByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const salesByOwner = wonDeals.reduce((acc, deal) => {
    const ownerName = users.find((u) => u.id === deal.owner_id)?.full_name || 'Unknown';
    acc[ownerName] = (acc[ownerName] || 0) + deal.amount;
    return acc;
  }, {});

  const salesByOwnerData = Object.entries(salesByOwner).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);

  const leadsBySource = leads.reduce((acc, lead) => {
    const source = lead.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const leadsBySourceData = Object.entries(leadsBySource).map(([name, value]) => ({ name, value }));

  // Monthly revenue trend (mock data for now)
  const monthlyRevenue = [
  { month: 'Jan', revenue: 45000, deals: 12 },
  { month: 'Feb', revenue: 52000, deals: 15 },
  { month: 'Mar', revenue: 48000, deals: 11 },
  { month: 'Apr', revenue: 61000, deals: 18 },
  { month: 'May', revenue: 55000, deals: 14 },
  { month: 'Jun', revenue: 67000, deals: 20 }];


  if (isLoading) {
    return <Loader message="Loading CRM reports..." />;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Analytics</h1>
          <p className="text-gray-600">Complete overview of your sales performance and pipeline health.</p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pt-4 pr-4 pb-4 pl-4 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">from {wonDeals.length} closed deals</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardHeader className="pt-4 pr-4 pb-4 pl-4 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700">Pipeline Value</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${pipelineValue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">active opportunities</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardHeader className="pt-4 pr-4 pb-4 pl-4 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700">Win Rate</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">{wonDeals.length} of {totalClosedDeals} deals won</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardHeader className="pt-4 pr-4 pb-4 pl-4 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700">Avg. Deal Size</CardTitle>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${averageDealSize.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">average per deal</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Deal Pipeline by Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dealsByStageData.length > 0 ?
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dealsByStageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} />

                  <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer> :

            <div className="text-center py-16 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No deals data available</p>
              </div>
            }
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" /> {/* Changed icon */}
              Lead Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leadsByStatusData.length > 0 ?
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                  data={leadsByStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>

                    {leadsByStatusData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer> :

            <div className="text-center py-16 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No leads data available</p>
              </div>
            }
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8"> {/* Changed grid columns */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  strokeWidth={2} />

              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm"> {/* New Sales Leaderboard Card */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Sales Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
             {salesByOwnerData.length > 0 ?
            <div className="space-y-3">
                  {salesByOwnerData.map((entry, index) =>
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-400 w-5 text-center">{index + 1}</span>
                        <span className="font-medium text-gray-700">{entry.name}</span>
                      </div>
                      <span className="font-semibold text-purple-600">${entry.revenue.toLocaleString()}</span>
                    </div>
              )}
                </div> :

            <div className="text-center py-10 text-gray-500">
                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No sales data yet.</p>
                </div>
            }
          </CardContent>
        </Card>
      </div>
      
      {/* Chart Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leadsBySourceData.length > 0 ?
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                  data={leadsBySourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value">

                    {leadsBySourceData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer> :

            <div className="text-center py-16 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No lead source data available</p>
              </div>
            }
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Upcoming Closes
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-center text-gray-500 py-16">Funnel chart coming soon!</p>
          </CardContent>
        </Card>
      </div>

      {/* CRM Summary card moved to the bottom as it's not a chart, but a summary of counts. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Adjusted grid layout for summary */}
        <Card className="shadow-sm col-span-full"> {/* Make it span full width or adjust as needed */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              CRM Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> {/* Inner grid for items */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700">Active Deals</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{deals.filter((d) => ['qualified', 'proposal'].includes(d.stage)).length}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">Total Leads</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{leads.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">Contacts</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{contacts.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-orange-600" />
                </div>
                <span className="font-medium text-gray-700">Companies</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{crmCompanies.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

}