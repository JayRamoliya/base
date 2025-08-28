import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Circle, 
  Clock,
  ArrowRight,
  Calendar
} from "lucide-react";
import { format, isBefore } from "date-fns";

export default function UpcomingTasks({ tasks, events = [] }) {
  const upcomingTasks = tasks
    .filter(task => task.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  const upcomingEvents = events
    .filter(event => !isBefore(new Date(event.scheduled_at), new Date()))
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 3);

  const priorityColors = {
    urgent: "bg-red-50 text-red-700 border-red-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    low: "bg-green-50 text-green-700 border-green-200"
  };

  const statusIcons = {
    backlog: Circle,
    in_progress: Clock,
    review: CheckCircle,
    done: CheckCircle
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Upcoming Tasks & Events</CardTitle>
        <Link to={createPageUrl("Tasks")}>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Scheduled Posts
              </h4>
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div key={`event-${event.id}`} className="p-2 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="font-medium text-sm text-gray-900 truncate">{event.title}</h5>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {event.platform}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {format(new Date(event.scheduled_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tasks</h4>
              <div className="space-y-2">
                {upcomingTasks.map((task) => {
                  const StatusIcon = statusIcons[task.status];
                  const isOverdue = new Date(task.due_date) < new Date();
                  
                  return (
                    <div key={`task-${task.id}`} className="p-2 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <StatusIcon className={`w-4 h-4 mt-0.5 ${
                          task.status === 'done' ? 'text-green-600' : 
                          task.status === 'in_progress' ? 'text-blue-600' : 
                          'text-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm text-gray-900 mb-1 truncate">
                            {task.title}
                          </h5>
                          <div className="flex items-center gap-2">
                            <Badge className={`${priorityColors[task.priority]} border text-xs`}>
                              {task.priority}
                            </Badge>
                            <span className={`text-xs ${
                              isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                            }`}>
                              {format(new Date(task.due_date), 'MMM d')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {upcomingTasks.length === 0 && upcomingEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No upcoming tasks or events</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}