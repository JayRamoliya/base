import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";

export default function Reports() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Reports</h1>
          <p className="text-gray-600">Generate and manage custom marketing reports</p>
        </div>

        <Card className="shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Report Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Custom report generator</h3>
              <p>Build custom reports with drag-and-drop interface</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}