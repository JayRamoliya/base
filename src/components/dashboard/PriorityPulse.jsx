import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileWarning, UserCheck, ArrowRight, Flag } from 'lucide-react';
import { isBefore, startOfToday } from 'date-fns';

export default function PriorityPulse({ tasks = [], leads = [] }) {
  const overdueTasks = tasks.filter(
    (task) => task.due_date && isBefore(new Date(task.due_date), startOfToday()) && task.status !== 'done'
  );

  const highPriorityTasks = tasks.filter(
    (task) => (task.priority === 'high' || task.priority === 'urgent') && task.status !== 'done'
  );

  const newLeads = leads.filter((lead) => lead.status === 'new');
  
  const importantItems = [
    ...overdueTasks.map(task => ({
      id: `task-${task.id}`,
      type: 'Overdue Task',
      title: task.title,
      icon: FileWarning,
      color: 'text-red-600',
      url: createPageUrl('Tasks'),
    })),
    ...highPriorityTasks.map(task => ({
      id: `task-hp-${task.id}`,
      type: 'High Priority',
      title: task.title,
      icon: Flag,
      color: 'text-orange-600',
      url: createPageUrl('Tasks'),
    })),
    ...newLeads.map(lead => ({
      id: `lead-${lead.id}`,
      type: 'New Lead',
      title: `Follow up with new lead`, // Generic title for privacy
      icon: UserCheck,
      color: 'text-blue-600',
      url: createPageUrl('CrmGeneratedLeads'),
    })),
  ].slice(0, 5); // Limit to 5 most important items

  if (importantItems.length === 0) {
    return null; // Don't render the component if there's nothing to show
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            Priority Items
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            {importantItems.length} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {importantItems.map((item) => (
            <Link to={item.url} key={item.id}>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <div>
                    <Badge variant="outline" className="text-xs mb-1">{item.type}</Badge>
                    <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}