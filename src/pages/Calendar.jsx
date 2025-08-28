
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Event } from "@/api/entities";
import { Company } from "@/api/entities";
import { Activity } from "@/api/entities";
import { User } from "@/api/entities";
import { Task } from "@/api/entities"; // Import Task entity
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  CalendarDays,
  Clock,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays, isAfter, startOfDay, isBefore } from "date-fns";
import EventForm from "../components/calendar/EventForm";
import MonthView from "../components/calendar/MonthView";
import WeekView from "../components/calendar/WeekView";
import DayView from "../components/calendar/DayView";
import { platforms, platformBadges } from '../components/calendar/common';
import Loader from "../components/ui/Loader";
import { useToast } from "../components/ui/toast";
import CreateItemMenu from "../components/calendar/CreateItemMenu"; // New component for creation menu
import TaskCreateModal from "../components/tasks/TaskCreateModal"; // To create tasks

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]); // State for tasks
  const [currentCompany, setCurrentCompany] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [platformFilter, setPlatformFilter] = useState(
    platforms.reduce((acc, p) => ({...acc, [p]: true}), {})
  );
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // State for creation modals/menus
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [dateForCreation, setDateForCreation] = useState(null);
  const [eventTypeToCreate, setEventTypeToCreate] = useState(null); // 'general' or 'post'
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const { success, error: toastError } = useToast();

  const loadCalendarData = useCallback(async (companyId) => {
    if (!companyId) return;
    try {
      const [fetchedEvents, fetchedTasks] = await Promise.all([
        Event.filter({ company_id: companyId }),
        Task.filter({ company_id: companyId })
      ]);
      setEvents(fetchedEvents);
      setTasks(fetchedTasks);
    } catch(e) {
      console.error("could not load calendar data", e);
      toastError("Error", "Could not load calendar data.");
    }
  }, [setEvents, setTasks, toastError]);

  const loadCompanyAndData = useCallback(async () => {
    setIsLoading(true);
    setEvents([]);
    setTasks([]);
    try {
      const userData = await User.me();
      setUser(userData);
      if (userData.company_id) {
        const company = await Company.get(userData.company_id);
        setCurrentCompany(company);
        await loadCalendarData(company.id);
      } else {
        // Handle case where no companies are found, e.g., clear data
        setCurrentCompany(null);
        setEvents([]);
        setTasks([]);
      }
    } catch(e) {
      console.error("could not load company or user", e);
      toastError("Error", "Could not load company or user data.");
    } finally {
      setIsLoading(false);
    }
  }, [loadCalendarData, setCurrentCompany, setEvents, setTasks, setIsLoading, setUser, toastError]);

  useEffect(() => {
    loadCompanyAndData();
  }, [loadCompanyAndData]);

  // Reduced frequency for company changes and reload data
  useEffect(() => {
    let debounceTimer;
    const handleStorageChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadCompanyAndData();
      }, 1000); // Debounce to prevent multiple rapid calls
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(debounceTimer);
    };
  }, [loadCompanyAndData]);

  // REMOVED: The problematic automatic event status updating that was causing network errors

  const handleSaveTask = async (taskData) => {
    if (!currentCompany) {
      toastError("Error", "No company selected to create a task.");
      return;
    }
    try {
      await Task.create({
        ...taskData,
        status: "backlog",
        company_id: currentCompany.id,
      });
      success("Task Created", `Task "${taskData.title}" has been created.`);
      await loadCalendarData(currentCompany.id);
      setIsTaskModalOpen(false);
    } catch (error) {
      toastError("Failed to create task", "There was an issue creating the task.");
      console.error(error);
    }
  };

  const handleSaveEvent = async (eventData) => {
    if (!currentCompany) {
      toastError("Error", "No company selected to create an event.");
      return;
    }
    try {
      const now = new Date();
      const eventDate = new Date(eventData.scheduled_at);
      const status = isBefore(eventDate, now) ? 'published' : 'scheduled';

      const dataToSave = {
        title: eventData.title,
        description: eventData.description,
        platform: eventData.platform,
        scheduled_at: eventData.scheduled_at,
        status: status,
        company_id: currentCompany.id,
        type: eventTypeToCreate || 'post', // Default to 'post' if not specified
      };

      if (eventData.id) {
        await Event.update(eventData.id, dataToSave);
        await Activity.create({
          description: `<strong>${user.full_name}</strong> updated event: <em>${dataToSave.title}</em>`,
          type: "update",
          entity_type: "Event",
          entity_title: dataToSave.title,
          user_name: user.full_name,
          company_id: currentCompany.id
        });
      } else {
        const newEvent = await Event.create(dataToSave);
        await Activity.create({
          description: `<strong>${user.full_name}</strong> scheduled a new event: <em>${newEvent.title}</em>`,
          type: "create",
          entity_type: "Event",
          entity_title: newEvent.title,
          user_name: user.full_name,
          company_id: currentCompany.id
        });
      }
      loadCalendarData(currentCompany.id);
      setIsFormOpen(false);
      setEditingEvent(null);
      setEventTypeToCreate(null);
    } catch (e) {
      console.error("Failed to save event", e);
      toastError("Failed to save event", "There was an issue saving the event.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!currentCompany) {
      toastError("Error", "No company selected.");
      return;
    }
    try {
      const eventToDelete = events.find(e => e.id === eventId);
      await Event.delete(eventId);
      if (eventToDelete) {
        await Activity.create({
          description: `<strong>${user.full_name}</strong> deleted event: <em>${eventToDelete.title}</em>`,
          type: "delete",
          entity_type: "Event",
          entity_title: eventToDelete.title,
          user_name: user.full_name,
          company_id: currentCompany.id
        });
      }
      loadCalendarData(currentCompany.id);
      setIsFormOpen(false);
      setEditingEvent(null);
    } catch (e) {
      console.error("Failed to delete event", e);
      toastError("Failed to delete event", "There was an issue deleting the event.");
    }
  };

  const handleOpenEventForm = (event = null, type = 'general') => {
    setEditingEvent(event);
    setEventTypeToCreate(type);
    setIsFormOpen(true);
  }
  
  const handleOpenCreateMenu = (date) => {
    setDateForCreation(date);
    setIsCreateMenuOpen(true);
  };
  
  const handleSelectCreationType = (type) => {
    setIsCreateMenuOpen(false);
    if (type === 'task') {
      setIsTaskModalOpen(true);
    } else {
      // type is 'general' or 'post'
      handleOpenEventForm(null, type);
    }
  };

  const handleEventClick = (event) => {
    handleOpenEventForm(event, event.type || 'post');
  }
  
  const handleTaskClick = (task) => {
    // For now, let's just log it. A detail view could be implemented.
    console.log("Task clicked:", task);
    toastError("Task Detail View", "This feature is coming soon!");
  };
  
  const handleConnectGoogleCalendar = async () => {
    try {
      success("Google Calendar", "Integration feature will be available soon!");
    } catch (error) {
      toastError("Connection Failed", "Unable to connect to Google Calendar.");
    }
  };

  const handlePrev = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    if (view === "day") setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    if (view === "day") setCurrentDate(addDays(currentDate, 1));
  };

  const calendarItems = useMemo(() => {
    const eventItems = events.filter(e => platformFilter[e.platform] || e.type === 'general').map(event => ({
      ...event,
      itemType: 'event',
      date: event.scheduled_at,
    }));
    
    const taskItems = tasks.filter(task => task.due_date).map(task => ({
      ...task,
      itemType: 'task',
      date: task.due_date,
    }));

    return [...eventItems, ...taskItems];
  }, [events, tasks, platformFilter]);

  const itemsByDate = useMemo(() => {
    return calendarItems.reduce((acc, item) => {
      const dateStr = format(new Date(item.date), 'yyyy-MM-dd');
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(item);
      return acc;
    }, {});
  }, [calendarItems]);

  const monthDays = eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate)), end: endOfWeek(endOfMonth(currentDate)) });
  const weekDays = eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) });

  const getHeaderTitle = () => {
    if (view === 'month') return format(currentDate, "MMMM yyyy");
    if (view === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }
    if (view === 'day') return format(currentDate, "MMMM d, yyyy");
  };

  // Get upcoming events (today and future) - remains event-specific as per outline
  const upcomingEvents = events
    .filter(e => isAfter(new Date(e.scheduled_at), startOfDay(new Date())) || isSameDay(new Date(e.scheduled_at), new Date()))
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  if (isLoading) {
    return <Loader message="Loading your content calendar..." />;
  }

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <div className="w-full space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Calendar</h1>
            <p className="text-gray-600">Plan, schedule, and manage your content, events, and tasks.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={handleConnectGoogleCalendar} className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Connect Google Calendar
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter Scheduled Posts
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Platforms</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {platforms.map(platform => (
                  <DropdownMenuCheckboxItem
                    key={platform}
                    checked={platformFilter[platform]}
                    onCheckedChange={(checked) => setPlatformFilter(prev => ({...prev, [platform]: checked}))}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <Button 
                  variant={view === 'month' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setView('month')}
                  className={view === 'month' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'}
                >
                  Month
                </Button>
                <Button 
                  variant={view === 'week' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setView('week')}
                  className={view === 'week' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'}
                >
                  Week
                </Button>
                <Button 
                  variant={view === 'day' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => { setView('day'); setCurrentDate(selectedDate); }}
                  className={view === 'day' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'}
                >
                  Day
                </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="lg:col-span-3 shadow-sm border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
                {getHeaderTitle()}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {view === 'month' && (
                <MonthView
                  currentDate={currentDate}
                  daysInMonth={monthDays}
                  itemsByDate={itemsByDate}
                  onDateClick={handleOpenCreateMenu}
                  onEventClick={handleEventClick}
                  onTaskClick={handleTaskClick}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              )}
              {view === 'week' && (
                <WeekView
                  daysInWeek={weekDays}
                  items={calendarItems} 
                  onEventClick={handleEventClick}
                  onTaskClick={handleTaskClick}
                  onTimeslotClick={handleOpenCreateMenu}
                />
              )}
              {view === 'day' && (
                <DayView
                  selectedDate={currentDate}
                  items={calendarItems}
                  onEventClick={handleEventClick}
                  onTaskClick={handleTaskClick}
                  onTimeslotClick={handleOpenCreateMenu}
                />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleOpenCreateMenu(new Date())} 
                  className="w-full bg-purple-600 hover:bg-purple-700 justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New...
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Upcoming Events ({upcomingEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 10).map((event) => (
                    <div key={event.id} className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleEventClick(event)}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{event.title}</h4>
                        {event.type !== 'general' && (
                          <Badge className={`${platformBadges[event.platform]} border-0 text-xs capitalize`}>
                            {event.platform}
                          </Badge>
                        )}
                        {event.type === 'general' && (
                          <Badge className="bg-gray-200 text-gray-700 border-0 text-xs capitalize">
                            General
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {format(new Date(event.scheduled_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      <Badge variant="outline" className={`text-xs mt-1 ${event.status === 'scheduled' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                        {event.status === 'scheduled' ? 'Scheduled' : 'Published'}
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  )}
                  {upcomingEvents.length > 10 && (
                    <p className="text-xs text-gray-500 text-center pt-2 border-t">
                      +{upcomingEvents.length - 10} more upcoming events
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-600" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Posts Scheduled</span>
                  <span className="font-medium text-blue-600">
                    {events.filter(e => isSameMonth(new Date(e.scheduled_at), currentDate) && e.status === 'scheduled').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Posts Published</span>
                  <span className="font-medium text-green-600">
                    {events.filter(e => isSameMonth(new Date(e.scheduled_at), currentDate) && e.status === 'published').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Most Active Platform</span>
                  <span className="font-medium text-purple-600">
                    {events.filter(e => isSameMonth(new Date(e.scheduled_at), currentDate)).length > 0 ? Object.entries(events.filter(e => isSameMonth(new Date(e.scheduled_at), currentDate) && e.type !== 'general').reduce((acc, e) => ({ ...acc, [e.platform]: (acc[e.platform] || 0) + 1 }), {}))
                      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None' : 'None'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isFormOpen && (
         <EventForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingEvent(null);
              setEventTypeToCreate(null);
            }}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            event={editingEvent}
            selectedDate={dateForCreation || selectedDate}
            eventType={eventTypeToCreate}
         />
      )}
      
      {isCreateMenuOpen && (
        <CreateItemMenu 
          isOpen={isCreateMenuOpen}
          onClose={() => setIsCreateMenuOpen(false)}
          onSelect={handleSelectCreationType}
        />
      )}

      {isTaskModalOpen && (
        <TaskCreateModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
