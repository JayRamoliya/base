import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, DollarSign, Users, TrendingUp, Activity } from "lucide-react";

const ProfessionalKPICards = ({
  activeCampaigns,
  activeDeals,
  totalRevenue,
  newLeads,
  totalContacts
}) => {
  const kpis = [
    {
      id: 'campaigns',
      title: 'Active Campaigns',
      value: activeCampaigns.length,
      subtitle: 'campaigns running',
      icon: Target,
      trend: '+12%',
      trendUp: true,
      color: 'purple',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
    },
    {
      id: 'deals',
      title: 'Pipeline Deals',
      value: activeDeals.length,
      subtitle: 'active opportunities',
      icon: TrendingUp,
      trend: '+8%',
      trendUp: true,
      color: 'blue',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: `$${(totalRevenue / 1000).toFixed(0)}K`,
      subtitle: 'total closed',
      icon: DollarSign,
      trend: '+24%',
      trendUp: true,
      color: 'green',
      bgGradient: 'from-green-50 to-green-100',
      iconBg: 'bg-green-500',
    },
    {
      id: 'leads',
      title: 'New Leads',
      value: newLeads.length,
      subtitle: 'need follow-up',
      icon: Activity,
      trend: '+16%',
      trendUp: true,
      color: 'orange',
      bgGradient: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
    },
    {
      id: 'contacts',
      title: 'Total Contacts',
      value: totalContacts,
      subtitle: 'in database',
      icon: Users,
      trend: '+5%',
      trendUp: true,
      color: 'indigo',
      bgGradient: 'from-indigo-50 to-indigo-100',
      iconBg: 'bg-indigo-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <Card key={kpi.id} className="relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                    {kpi.title}
                  </CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                      {kpi.value}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      kpi.trendUp ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                    }`}>
                      {kpi.trend}
                    </span>
                  </div>
                </div>
                
                <div className={`${kpi.iconBg} w-12 h-12 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative pt-0">
              <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                {kpi.subtitle}
              </p>
              
              {/* Progress bar */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full ${kpi.iconBg} transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min((kpi.value / 20) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
            
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent transform rotate-12 scale-150" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ProfessionalKPICards;