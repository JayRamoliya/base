import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  ArrowRight,
  CalendarDays,
  Send,
  Plus } from
"lucide-react";
import { format, isAfter, startOfDay, isSameDay } from "date-fns";

export default function CalendarSchedulerCard({ events = [], tasks = [] }) {
  // Get upcoming events (today and future)
  const upcomingEvents = events.
  filter((e) => isAfter(new Date(e.scheduled_at), startOfDay(new Date())) || isSameDay(new Date(e.scheduled_at), new Date())).
  sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)).
  slice(0, 4);

  // Get upcoming tasks with due dates
  const upcomingTasks = tasks.
  filter((task) => task.due_date && task.status !== 'done').
  sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).
  slice(0, 3);

  const scheduledToday = events.filter((e) =>
  isSameDay(new Date(e.scheduled_at), new Date())
  ).length;

  const scheduledThisWeek = events.filter((e) => {
    const eventDate = new Date(e.scheduled_at);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= now && eventDate <= weekFromNow;
  }).length;

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">Upcomings


        </CardTitle>
        <div className="flex gap-2">
          <Link to={createPageUrl("Calendar")}>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
            </Button>
          </Link>
          <Link to={createPageUrl("Scheduler")}>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <Send className="w-4 h-4 mr-1" />
              Scheduler
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{scheduledToday}</div>
            <div className="text-xs text-purple-700">Today</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{scheduledThisWeek}</div>
            <div className="text-xs text-blue-700">This Week</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{upcomingTasks.length}</div>
            <div className="text-xs text-green-700">Due Tasks</div>
          </div>
        </div>

        {/* Upcoming Content */}
        <div className="space-y-4">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 &&
          <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Upcoming Posts
              </h4>
              <div className="space-y-2">
                {upcomingEvents.map((event) =>
              <div key={`event-${event.id}`} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="font-medium text-sm text-gray-900 truncate">{event.title}</h5>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {event.platform}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {format(new Date(event.scheduled_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
              )}
              </div>
            </div>
          }

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 &&
          <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                Due Tasks
              </h4>
              <div className="space-y-2">
                {upcomingTasks.map((task) =>
              <div key={`task-${task.id}`} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="font-medium text-sm text-gray-900 truncate">{task.title}</h5>
                      <Badge className={`text-xs ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'}`
                  }>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </p>
                  </div>
              )}
              </div>
            </div>
          }

          {/* Empty State */}
          {upcomingEvents.length === 0 && upcomingTasks.length === 0 &&
          <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm mb-3">No upcoming events or tasks</p>
              <div className="flex gap-2 justify-center">
                <Link to={createPageUrl("Calendar")}>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Schedule Post
                  </Button>
                </Link>
                <Link to={createPageUrl("Tasks")}>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Task
                  </Button>
                </Link>
              </div>
            </div>
          }
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Link to={createPageUrl("Calendar")} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="w-4 h-4 mr-1" />
              View Calendar
            </Button>
          </Link>
          <Link to={createPageUrl("Scheduler")} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Send className="w-4 h-4 mr-1" />
              Schedule Posts
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>);

}