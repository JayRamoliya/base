import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  Users,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight } from
"lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function KPICards({ campaigns, tasks, isLoading }) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) =>
        <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-12" />
            </CardContent>
          </Card>
        )}
      </div>);

  }

  const completionRate = tasks.length > 0 ? Math.round(tasks.filter((t) => t.status === 'done').length / tasks.length * 100) : 0;

  const kpiData = [
  {
    title: "Total Campaigns",
    value: campaigns.length,
    change: "N/A",
    trend: "up",
    icon: Target,
    color: "gray"
  },
  {
    title: "Active Tasks",
    value: tasks.filter((t) => t.status !== 'done').length,
    change: "N/A",
    trend: "up",
    icon: Users,
    color: "gray"
  },
  {
    title: "Completion Rate",
    value: `${completionRate}%`,
    change: "N/A",
    trend: "up",
    icon: BarChart3,
    color: "gray"
  },
  {
    title: "Monthly Growth",
    value: "N/A",
    change: "",
    trend: "down",
    icon: TrendingUp,
    color: "gray"
  }];


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) =>
      <Card key={index} className="hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200">
          <CardHeader className="pt-1 pr-3 pb-3 pl-3 space-y-1.5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              {kpi.title}
            </CardTitle>
            <div className="p-2 rounded-lg bg-gray-100">
              <kpi.icon className="w-4 h-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 pr-4 pb-4 pl-4">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {kpi.value}
            </div>
             <p className="text-xs text-gray-400">No historical data</p>
          </CardContent>
        </Card>
      )}
    </div>);

}