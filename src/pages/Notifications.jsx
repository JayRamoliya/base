
import React, { useState, useEffect } from 'react';
import { Notification } from '@/api/entities';
import { User } from '@/api/entities';
import { apiThrottler } from "@/components/utils/apiThrottle";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, Archive, Inbox, RefreshCw, MailCheck } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { useToast } from '../components/ui/toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { success } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const userData = await apiThrottler.throttledRequest(() => User.me());
        setUser(userData);
        await fetchNotifications(userData.email);
      } catch (error) {
        console.error("Failed to load user or notifications", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    window.addEventListener('notifications_updated', loadData);
    return () => window.removeEventListener('notifications_updated', loadData);
  }, []);

  const fetchNotifications = async (email) => {
    if (!email) return;
    try {
      const allNotifs = await apiThrottler.throttledRequest(() => Notification.filter({ user_email: email }, "-created_date"));
      setNotifications(allNotifs);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleRefresh = () => {
    if (user) {
      setIsLoading(true);
      fetchNotifications(user.email).finally(() => setIsLoading(false));
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await apiThrottler.throttledRequest(() => Notification.update(id, { is_read: true }));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      window.dispatchEvent(new Event('notifications_updated'));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if(unreadIds.length === 0) return;

    try {
      // Process in smaller batches to avoid overwhelming the server
      for (let i = 0; i < unreadIds.length; i += 3) {
        const batch = unreadIds.slice(i, i + 3);
        await Promise.all(batch.map(id => apiThrottler.throttledRequest(() => Notification.update(id, { is_read: true }))));
      }
      
      setNotifications(prev => prev.map(n => ({...n, is_read: true})));
      window.dispatchEvent(new Event('notifications_updated'));
      success(`${unreadIds.length} notification(s) marked as read.`);
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiThrottler.throttledRequest(() => Notification.delete(id));
      setNotifications(prev => prev.filter(n => n.id !== id));
      window.dispatchEvent(new Event('notifications_updated'));
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true });
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const groupedNotifications = notifications.reduce((acc, notif) => {
    const date = new Date(notif.created_date);
    let group = 'Older';
    if (isToday(date)) group = 'Today';
    else if (isYesterday(date)) group = 'Yesterday';

    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {});

  const groupOrder = ['Today', 'Yesterday', 'Older'];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Manage your updates, reminders, and alerts.</p>
            {unreadCount > 0 && 
              <Badge variant="outline" className="mt-2 bg-purple-100 text-purple-700">{unreadCount} unread</Badge>
            }
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <MailCheck className="w-4 h-4 mr-2" /> Mark all as read
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20"><Loader message="Loading notifications..." /></div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p>You have no new notifications.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {groupOrder.map(group => (
                  groupedNotifications[group] && (
                    <div key={group} className="py-4">
                      <h4 className="text-sm font-semibold text-gray-500 mb-3 px-6">{group}</h4>
                      <div className="space-y-1">
                        {groupedNotifications[group].map(notification => (
                          <div
                            key={notification.id}
                            className={`relative p-4 pl-6 pr-4 mx-2 rounded-lg flex items-start gap-4 group transition-colors duration-200 hover:bg-gray-50 ${
                              !notification.is_read ? 'bg-purple-50' : 'bg-white'
                            }`}
                          >
                            {!notification.is_read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>}
                            <div className="flex-1 ml-2">
                              <p className="font-semibold text-gray-800">{notification.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                              <span className="text-xs text-gray-400 mt-2 block">{formatNotificationDate(notification.created_date)}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full hover:bg-green-100 text-green-600"
                                  title="Mark as read"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-red-100 text-red-600"
                                title="Delete"
                                onClick={() => handleDelete(notification.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
