import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';

export default function HighPriorityTasks({ tasks = [], onTaskSelect }) {
  const priorityColors = {
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    urgent: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          High-Priority Tasks
        </CardTitle>
        <Link to={createPageUrl('Tasks')}>
          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => onTaskSelect(task)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <Badge className={`${priorityColors[task.priority]} border text-xs capitalize`}>
                    {task.priority}
                  </Badge>
                </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-xs text-gray-600">You have no urgent or high-priority tasks.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}