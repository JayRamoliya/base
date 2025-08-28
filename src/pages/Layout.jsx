

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { apiThrottler } from "@/components/utils/apiThrottle";
import { format, isToday } from "date-fns";
import {
  LayoutDashboard,
  Sparkles,
  Calendar,
  BarChart3,
  Users,
  Settings,
  FolderOpen,
  Target,
  Bell,
  ChevronDown,
  Building2,
  LogOut,
  TrendingUp,
  Lightbulb,
  Trophy,
  Brain,
  Rss,
  Send,
  FileText,
  Search,
  UserPlus,
  Mail,
  Eye,
  Activity,
  ChevronLeft,
  ChevronRight,
  Home,
  Check,
  Trash2,
  Crown,
  RefreshCw,
  Clock,
  ShieldQuestion,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User } from "@/api/entities";
import { Company } from "@/api/entities";
import { Notification } from "@/api/entities";
import { Task } from "@/api/entities";
import { Event } from "@/api/entities";
import { Activity as ActivityEntity } from "@/api/entities";
import Loader from "../components/ui/Loader";
import { ToastProvider } from "../components/ui/toast";

const navigationSections = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard }
    ]
  },
  {
    title: "CRM",
    items: [
      { title: "Companies", url: createPageUrl("CrmCompanies"), icon: Building2 },
      { title: "Contacts", url: createPageUrl("CrmContacts"), icon: Users },
      { title: "Find Leads", url: createPageUrl("FindLeads"), icon: Search },
      { title: "Generated Leads", url: createPageUrl("CrmGeneratedLeads"), icon: UserPlus },
      { title: "Deal Pipeline", url: createPageUrl("CrmPipeline"), icon: Target },
      { title: "Reports", url: createPageUrl("CrmReports"), icon: BarChart3 }
    ]
  },
  {
    title: "Content Creation",
    items: [
      { title: "Creative Studio", url: createPageUrl("CreativeStudioV2"), icon: Sparkles },
      { title: "AI Graphic Designer", url: createPageUrl("AIGraphicDesignerV2"), icon: Brain },
      { title: "Trending Topics", url: createPageUrl("TrendingTopics"), icon: Rss },
      { title: "Quick Mail", url: createPageUrl("QuickMail"), icon: Mail }
    ]
  },
  {
    title: "Communication",
    items: [
      { title: "Chat", url: createPageUrl("Chat"), icon: MessageSquare },
      { title: "Activities", url: createPageUrl("Activities"), icon: Activity },
      { title: "Notifications", url: createPageUrl("Notifications"), icon: Bell }
    ]
  },
  {
    title: "Scheduling & Publishing",
    items: [
      { title: "Calendar", url: createPageUrl("Calendar"), icon: Calendar },
      { title: "Scheduler", url: createPageUrl("Scheduler"), icon: Send }
    ]
  },
  {
    title: "Analytics & Insights",
    items: [
      { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart3 },
      { title: "Social Analytics", url: createPageUrl("SocialAnalytics"), icon: TrendingUp },
      { title: "Campaign Analytics", url: createPageUrl("ChampionAnalytics"), icon: Trophy },
      { title: "Competitor Intelligence", url: createPageUrl("CompetitorIntelligence"), icon: Eye }
    ]
  },
  {
    title: "Management",
    items: [
      { title: "Tasks", url: createPageUrl("Tasks"), icon: FileText },
      { title: "Assets Library", url: createPageUrl("Assets"), icon: FolderOpen },
      { title: "Team", url: createPageUrl("Team"), icon: Users }
    ]
  },
  {
    title: "Tools",
    items: [
      { title: "AI Coach", url: createPageUrl("AICoach"), icon: Lightbulb },
      { title: "Keyword Research", url: createPageUrl("KeywordResearch"), icon: Search }
    ]
  },
  {
    title: "Legal",
    items: [
      { title: "Privacy Policy", url: createPageUrl("PrivacyPolicy"), icon: ShieldQuestion },
      { title: "Terms & Conditions", url: createPageUrl("TermsAndConditions"), icon: FileText }
    ]
  }
];

const mobileNavItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Home },
  { title: "Chat", url: createPageUrl("Chat"), icon: MessageSquare },
  { title: "Calendar", url: createPageUrl("Calendar"), icon: Calendar },
  { title: "Tasks", url: createPageUrl("Tasks"), icon: FileText },
  { title: "Creative", url: createPageUrl("CreativeStudioV2"), icon: Sparkles },
  { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart3 },
  { title: "CRM", url: createPageUrl("CrmPipeline"), icon: Target }
];

function LayoutComponent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [teamCount, setTeamCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate trial time left based on company creation date - FIXED
  const [trialTimeLeft, setTrialTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Don't load notifications for certain pages to reduce API calls
  const shouldLoadNotifications = !['Landing', 'CompanyOnboarding', 'AcceptInvitation', 'Premium', 'Login'].includes(currentPageName);

  // FIXED: Real-time trial countdown based on company creation date (3 days = 72 hours)
  useEffect(() => {
  let interval;

  if (currentCompany && currentCompany.created_date) {
    const updateCountdown = () => {
      let createdDateStr = currentCompany.created_date;
      // If the string contains a time component ('T') but no explicit timezone ('Z', '+', or detected '-')
      // then append 'Z' to ensure it's parsed as UTC.
      // This handles "YYYY-MM-DDTHH:MM:SS" -> "YYYY-MM-DDTHH:MM:SSZ" which new Date() interprets as UTC.
      // It avoids touching "YYYY-MM-DD" (date only), "YYYY-MM-DDTHH:MM:SSZ" (already UTC),
      // or "YYYY-MM-DDTHH:MM:SS+02:00" (already has offset).
      if (createdDateStr && createdDateStr.includes('T') && !(createdDateStr.endsWith('Z') || createdDateStr.includes('+') || createdDateStr.match(/-\d{2}:\d{2}$/))) {
        createdDateStr += 'Z';
      }
      const companyCreationDate = new Date(createdDateStr);
      // 3 days = 72 hours
      const trialEndDate = new Date(companyCreationDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      const now = new Date();
      let diff = Math.floor((trialEndDate.getTime() - now.getTime()) / 1000); // total seconds

      if (diff > 0) {
        const days = Math.floor(diff / (60 * 60 * 24));
        diff -= days * 60 * 60 * 24;

        const hours = Math.floor(diff / (60 * 60));
        diff -= hours * 60 * 60;

        const minutes = Math.floor(diff / 60);
        diff -= minutes * 60;

        const seconds = diff;

        setTrialTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTrialTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    interval = setInterval(updateCountdown, 1000);
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [currentCompany]);


  useEffect(() => {
    // Apply saved theme on layout load
    const savedTheme = localStorage.getItem('app-theme') || 'purple';
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme) => {
    const themeColors = {
      purple: { primary: "#7c3aed", primary100: "#ede9fe", primary700: "#6d28d9" },
      blue: { primary: "#2563eb", primary100: "#eff6ff", primary700: "#1d4ed8" },
      green: { primary: "#059669", primary100: "#ecfdf5", primary700: "#047857" },
      red: { primary: "#dc2626", primary100: "#fee2e2", primary700: "#b91c1c" },
      orange: { primary: "#ea580c", primary100: "#fff7ed", primary700: "#c2410c" },
      pink: { primary: "#db2777", primary100: "#fdf2f8", primary700: "#be185d" }
    };

    const themeConfig = themeColors[theme];
    if (themeConfig) {
      document.documentElement.style.setProperty('--primary', themeConfig.primary);
      document.documentElement.style.setProperty('--primary-hover', themeConfig.primary700);
      document.documentElement.style.setProperty('--primary-100', themeConfig.primary100);
      document.documentElement.style.setProperty('--primary-text-active', themeConfig.primary700);
      document.documentElement.style.setProperty('--primary-text-icon', themeConfig.primary);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = await apiThrottler.throttledRequest(() => User.me());
        setUser(userData);

        if (userData.company_id) {
          try {
            const company = await apiThrottler.throttledRequest(() => Company.get(userData.company_id));
            setCurrentCompany(company);
          } catch (error) {
            console.error("Failed to load company:", error);
            setCurrentCompany(null);
          }

          try {
            const teamMembers = await apiThrottler.throttledRequest(() => User.filter({ company_id: userData.company_id }));
            setTeamCount(teamMembers.length);
          } catch (error) {
            setTeamCount(0);
          }
        } else if (currentPageName !== 'CompanyOnboarding' && currentPageName !== 'Landing' && currentPageName !== 'AcceptInvitation') {
          navigate(createPageUrl('CompanyOnboarding'));
        }

      } catch (error) {
        console.error("Initialization failed:", error);
        if (currentPageName !== 'Landing' && currentPageName !== 'AcceptInvitation' && currentPageName !== 'Login') {
          navigate(createPageUrl('Landing'));
        }
      }
    };
    initialize();
  }, [navigate, currentPageName]);

  // Simple mock notifications instead of generating them from API calls
  useEffect(() => {
    if (shouldLoadNotifications && user?.company_id && !isLoadingNotifications) {
      // Set some mock notifications to reduce API calls
      const mockNotifications = [
        {
          id: 'welcome-1',
          type: 'info',
          title: 'Welcome to Marketing OS!',
          message: 'Explore our powerful features to boost your marketing.',
          timestamp: new Date().toISOString(),
          action: createPageUrl('Dashboard'),
          icon: 'Activity'
        }
      ];
      setNotifications(mockNotifications);
    }
  }, [shouldLoadNotifications, user?.company_id, isLoadingNotifications]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobileMenuOpen]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    try {
      await User.logout();
      // Redirect to a known public page after logout.
      navigate(createPageUrl("Landing"));
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // Modified handlers for dynamic notifications
  const handleReadNotification = useCallback((notification) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    if (notification.action) {
      navigate(notification.action);
    }
  }, [setNotifications, navigate]);

  const handleMarkAsRead = useCallback((notification) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
  }, [setNotifications]);

  const handleDeleteNotification = useCallback((notification, event) => {
    event.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
  }, [setNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Simulate refresh delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (currentPageName === 'Landing' || currentPageName === 'AcceptInvitation' || currentPageName === 'Premium' || currentPageName === 'Login') {
    return <>{children}</>;
  }

  if (currentPageName === 'CompanyOnboarding') {
    return <div className="bg-gray-50 min-h-screen">{children}</div>;
  }

  // Map icon names to components for dynamic rendering
  const IconMap = {
    LayoutDashboard, Sparkles, Calendar, BarChart3, Users, Settings, FolderOpen, Target, Bell, ChevronDown, Building2, LogOut, TrendingUp, Lightbulb, Trophy, Brain, Rss, Send, FileText, Search, UserPlus, Mail, Eye, Activity: Activity, ChevronLeft, ChevronRight, Home, Check, Trash2, Crown, RefreshCw, Clock, ShieldQuestion, MessageSquare, AlertTriangle
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <aside className={`hidden lg:flex bg-white border-r border-gray-200 flex-col h-screen fixed top-0 left-0 z-40 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-80'}`}>
        {/* Header Section */}
        <div className={`p-4 border-b border-gray-200 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {sidebarCollapsed ?
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              className="hover:bg-gray-100 w-10 h-10 rounded-md border border-gray-200"
              title="Expand sidebar">
              <ChevronRight className="w-5 h-5" />
            </Button> :
            <>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-gray-900 truncate">Marketing OS</h1>
                  <p className="text-sm text-gray-500 truncate">All-in-one Platform</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(true)}
                className="hover:bg-gray-100 w-8 h-8 rounded-md flex-shrink-0 border border-gray-200"
                title="Collapse sidebar">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </>
          }
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {navigationSections.map((section) =>
              <div key={section.title}>
                {!sidebarCollapsed &&
                  <h3 className="text-gray-300 mb-3 px-3 text-xs font-normal uppercase tracking-wider">
                    {section.title}
                  </h3>
                }
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.url;
                    // Dynamically add team count to the "Team" navigation item
                    const displayCount = item.title === "Team" ? teamCount || 0 : undefined;
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 group ${
                          isActive ?
                            'bg-[var(--primary-100)] text-[var(--primary-text-active)]' :
                            'text-gray-700 hover:bg-gray-100 hover:text-gray-900'} ${
                          sidebarCollapsed ? 'justify-center' : ''}`}
                        title={sidebarCollapsed ? item.title : ''}>
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[var(--primary-text-icon)]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        {!sidebarCollapsed && <span className="font-medium truncate">{item.title}</span>}
                        {!sidebarCollapsed && displayCount !== undefined && displayCount > 0 &&
                          <Badge className="ml-auto bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                            {displayCount}
                          </Badge>
                        }
                      </Link>);
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'} pb-20 lg:pb-0`}>
        <header className="bg-white border-b border-gray-200 px-0 py-4 lg:py-6 w-full">
          <div className="px-4 lg:px-6 xl:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="lg:hidden w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>

              {currentCompany && (
                <div className="flex items-center gap-4">
                  {/* Trial Countdown */}
                  {trialTimeLeft.days > 0 || trialTimeLeft.hours > 0 || trialTimeLeft.minutes > 0 || trialTimeLeft.seconds > 0 ? (
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-red-300 bg-red-50">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-sm font-semibold text-red-800 font-sans">Free Trial Ends In:</div>
                        <div className="text-sm text-red-700 tabular-nums font-mono">
                          <span className="font-bold">{trialTimeLeft.days}</span>d:{' '}
                          <span className="font-bold">{trialTimeLeft.hours.toString().padStart(2, '0')}</span>h:{' '}
                          <span className="font-bold">{trialTimeLeft.minutes.toString().padStart(2, '0')}</span>m:{' '}
                          <span className="font-bold">{trialTimeLeft.seconds.toString().padStart(2, '0')}</span>s
                        </div>
                      </div>
                    </div>
                  ) : currentCompany.created_date && (
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-orange-300 bg-orange-50">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <div className="text-sm font-semibold text-orange-800">Free Trial Expired</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <Link to={createPageUrl("Premium")}>
                <Button
                  className="shine-button relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 text-sm">
                  <span className="relative z-10 flex items-center">
                    <Crown className="w-4 h-4 mr-1 lg:mr-1.5 fill-current" />
                    <span className="hidden sm:inline">Pro</span>
                  </span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hover:bg-gray-100 w-10 h-10 rounded-lg border border-gray-200"
                title="Refresh for latest data">
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 w-10 h-10 rounded-lg border border-gray-200">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 &&
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-[var(--primary)] text-white text-xs">
                        {notifications.length}
                      </Badge>
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 mr-4">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-500">You have {notifications.length} new notifications</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ?
                      notifications.map((notification) => {
                        const IconComponent = IconMap[notification.icon];
                        return (
                          <div
                            key={notification.id}
                            className="relative group">
                            <DropdownMenuItem
                              onSelect={() => handleReadNotification(notification)}
                              className="p-4 hover:bg-gray-50 cursor-pointer flex items-start gap-3">
                              {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0 text-[var(--primary-text-icon)]" />}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800">{notification.title}</p>
                                <p className="text-sm text-gray-500">{notification.message}</p>
                              </div>
                            </DropdownMenuItem>
                            {/* Hover Actions with Icons */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification);
                                }}
                                className="h-7 w-7 rounded-full hover:bg-blue-100 text-blue-600"
                                title="Mark as read">
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleDeleteNotification(notification, e)}
                                className="h-7 w-7 rounded-full hover:bg-red-100 text-red-600"
                                title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      }) :
                      <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                    }
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl h-12">
                    <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
                      {user?.avatar_url ?
                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" /> :
                        <AvatarFallback className="bg-[var(--primary)] text-white font-medium">
                          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      }
                    </Avatar>
                    <div className="text-left hidden lg:block">
                      <div className="font-medium text-sm text-gray-900">{user?.full_name || 'User'}</div>
                      <div className="text-xs text-gray-500 max-w-32 truncate">{currentCompany?.name || user?.email}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-900 truncate">{user?.full_name || 'User'}</p>
                    <p className="text-sm text-gray-500 break-all">{user?.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Settings")} className="flex items-center gap-2 p-3 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600 p-3 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Enhanced Mobile Navigation - 7 icons without names */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 shadow-lg">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 min-w-0 ${
                  isActive ?
                    'bg-[var(--primary-100)] text-[var(--primary-text-active)]' :
                    'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                }>
                <item.icon className={`w-6 h-6 ${isActive ? 'text-[var(--primary-text-icon)]' : 'text-gray-400'}`} />
              </Link>);
          })}
        </div>
      </nav>

      <style>{`
        :root {
          --radius: 4px;
        }

        .shine-button {
          position: relative;
          overflow: hidden;
        }

        .shine-button::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(20deg);
          animation: shine 5s infinite linear;
          opacity: 0;
        }

        @keyframes shine {
          0% {
            transform: translateX(-75%) rotate(20deg);
            opacity: 0;
          }
          20% {
            transform: translateX(-75%) rotate(20deg);
            opacity: 0.8;
          }
          100% {
            transform: translateX(75%) rotate(20deg);
            opacity: 0;
          }
        }

        /* Apply 4px border radius globally */
        .rounded, .rounded-md, .rounded-lg, .rounded-xl {
          border-radius: 4px !important;
        }

        .rounded-sm {
          border-radius: 2px !important;
        }

        .rounded-full {
          border-radius: 9999px !important;
        }
      `}</style>
    </div>);
}

export default function Layout({ children, currentPageName }) {
  return (
    <ToastProvider>
      <LayoutComponent currentPageName={currentPageName}>
        {children}
      </LayoutComponent>
    </ToastProvider>);
}

