import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";

export default function Leads() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads Management</h1>
          <p className="text-gray-600">Track and manage your marketing leads and prospects</p>
        </div>

        <Card className="shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              Lead Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16 text-gray-500">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Lead management system</h3>
              <p>Manage your marketing leads and track conversion funnel</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}