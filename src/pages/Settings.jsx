
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SocialConnection } from "@/api/entities";
import { Company } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User as UserIcon, 
  Bell, 
  Shield, 
  Save,
  Link2, 
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  Globe,
  Building2,
  Copy,
  Edit3,
  Clock
} from "lucide-react";
import { apiThrottler } from "@/components/utils/apiThrottle";

// Define social media platforms and their properties
const socialPlatforms = {
  linkedin: { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  youtube: { name: "YouTube", icon: Youtube, color: "text-red-600" },
  instagram: { name: "Instagram", icon: Instagram, color: "text-pink-500" },
  facebook: { name: "Facebook", icon: Facebook, color: "text-blue-800" },
  pinterest: { name: "Pinterest", icon: Globe, color: "text-red-700" },
};

const settingsTabs = [
  { id: "profile", title: "Profile", icon: UserIcon },
  { id: "accounts", title: "Connected Accounts", icon: Link2 },
  { id: "notifications", title: "Notifications", icon: Bell },
  { id: "security", title: "Security & Privacy", icon: Shield },
  { id: "company", title: "Company", icon: Building2 },
];

const timeZoneOptions = [
    { value: 'Asia/Kolkata', label: 'Indian Standard Time (IST)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
];

// Generate a secure random company code
const generateCompanyCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [companyFormData, setCompanyFormData] = useState({});
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [connections, setConnections] = useState({});
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: false,
    marketing_emails: true,
    weekly_reports: true
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      if (userData.company_id) {
        try {
          const company = await Company.get(userData.company_id);
          
          // If company exists but has no unique_code, generate and save one.
          if (company && !company.unique_code) {
            const newCode = generateCompanyCode();
            await Company.update(company.id, { unique_code: newCode });
            company.unique_code = newCode;
          }

          setCurrentCompany(company);
          setCompanyFormData({
            name: company.name || '',
            website: company.website || '',
            employee_count: company.employee_count || '',
            industry: company.industry || '',
            description: company.description || ''
          });
          
          // Load social connections for this company
          const connectionsData = await SocialConnection.filter({ company_id: company.id });
          const connectionsMap = connectionsData.reduce((acc, conn) => {
            acc[conn.platform] = conn;
            return acc;
          }, {});
          setConnections(connectionsMap);
        } catch (error) {
          console.error("Failed to load company:", error);
        }
      }
      
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
    setIsLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await apiThrottler.throttledRequest(() => User.updateMyUserData({
        full_name: user.full_name,
        time_zone: user.time_zone
      }));
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert('Failed to update profile. Please try again.');
    }
    setIsSaving(false);
  };

  const handleSaveCompany = async () => {
    if (!currentCompany) return;
    setIsSaving(true);
    try {
      await apiThrottler.throttledRequest(() => Company.update(currentCompany.id, companyFormData));
      setCurrentCompany({ ...currentCompany, ...companyFormData });
      setIsEditingCompany(false);
      alert('Company information updated successfully!');
    } catch (error) {
      console.error("Failed to update company:", error);
      alert('Failed to update company information. Please try again.');
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsSaving(true);
    try {
      console.log("Uploading avatar file:", file.name, file.type, file.size);
      const { file_url } = await apiThrottler.throttledRequest(() => UploadFile({ file }));
      console.log("Avatar uploaded, URL:", file_url);
      
      await apiThrottler.throttledRequest(() => User.updateMyUserData({ avatar_url: file_url }));
      setUser(prev => ({ ...prev, avatar_url: file_url }));
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert('Failed to update profile picture. Please try again.');
    }
    setIsSaving(false);
  };

  const handleConnect = async (platform) => {
    if (!currentCompany) {
      console.error("No current company found");
      return;
    }
    
    try {
      setIsSaving(true);
      const newConnection = await apiThrottler.throttledRequest(() => SocialConnection.create({
        platform: platform,
        status: 'connected',
        account_name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} User`,
        company_id: currentCompany.id
      }));
      setConnections(prev => ({...prev, [platform]: newConnection}));
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async (platform) => {
    const connection = connections[platform];
    if (!connection || !connection.id) return;
    try {
      setIsSaving(true);
      await apiThrottler.throttledRequest(() => SocialConnection.delete(connection.id));
      setConnections(prev => {
        const newConns = { ...prev };
        delete newConns[platform];
        return newConns;
      });
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateNewCode = async () => {
    if (!currentCompany || !window.confirm('Are you sure you want to generate a new invite code? This will invalidate the current code.')) {
      return;
    }
    
    setIsSaving(true);
    try {
      const newCode = generateCompanyCode();
      await apiThrottler.throttledRequest(() => Company.update(currentCompany.id, { unique_code: newCode }));
      setCurrentCompany(prev => ({ ...prev, unique_code: newCode }));
      alert('New invite code generated successfully!');
    } catch (error) {
      console.error("Failed to generate new code:", error);
      alert('Failed to generate new code. Please try again.');
    }
    setIsSaving(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <AvatarFallback className="bg-purple-600 text-white text-xl font-medium">
                          {user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label htmlFor="avatar-upload">
                      <Button variant="outline" size="sm" asChild className="cursor-pointer">
                        <span>
                          {isSaving ? 'Uploading...' : 'Change Avatar'}
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 10MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={user?.full_name || ''}
                      onChange={(e) => setUser({...user, full_name: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="mt-2 bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                    <Label htmlFor="time_zone">Time Zone</Label>
                    <Select 
                      value={user?.time_zone || 'Asia/Kolkata'} 
                      onValueChange={(value) => setUser({ ...user, time_zone: value })}
                    >
                        <SelectTrigger id="time_zone" className="mt-2">
                            <SelectValue placeholder="Select your time zone" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeZoneOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "accounts":
        return (
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-600" />
                Connected Accounts
              </CardTitle>
              <CardDescription>
                Connect your social media accounts to enable additional features and data synchronization.
                {currentCompany && (
                  <span className="block mt-1 text-xs text-gray-600">
                    Connections for company: <span className="font-semibold">{currentCompany.name}</span>
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(socialPlatforms).map(([key, { name, icon: Icon, color }]) => {
                const connection = connections[key];
                const isConnected = connection && connection.status === 'connected';
                return (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-4">
                      <Icon className={`w-8 h-8 ${color}`} />
                      <div>
                        <div className="font-medium text-gray-900">{name}</div>
                        {isConnected ? (
                          <div className="text-sm text-green-600 font-medium">{connection.account_name}</div>
                        ) : (
                          <div className="text-sm text-gray-500">Not Connected</div>
                        )}
                      </div>
                    </div>
                    {isConnected ? (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDisconnect(key)}
                        disabled={isSaving}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleConnect(key)}
                        disabled={isSaving || !currentCompany}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );

      case "notifications":
        return (
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-500">Receive notifications via email</div>
                </div>
                <Switch
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, email_notifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Push Notifications</div>
                  <div className="text-sm text-gray-500">Receive browser push notifications</div>
                </div>
                <Switch
                  checked={notificationSettings.push_notifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, push_notifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Marketing Emails</div>
                  <div className="text-sm text-gray-500">Receive product updates and tips</div>
                </div>
                <Switch
                  checked={notificationSettings.marketing_emails}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, marketing_emails: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Weekly Reports</div>
                  <div className="text-sm text-gray-500">Receive weekly analytics summaries</div>
                </div>
                <Switch
                  checked={notificationSettings.weekly_reports}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weekly_reports: checked})}
                />
              </div>
            </CardContent>
          </Card>
        );

      case "security":
        return (
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Login Sessions</div>
                  <div className="text-sm text-gray-500">Manage your active login sessions</div>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Data Export</div>
                  <div className="text-sm text-gray-500">Download a copy of your data</div>
                </div>
                <Button variant="outline" size="sm">
                  Request
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "company":
        return (
          <div className="space-y-6">
            {currentCompany ? (
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      Company Information
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingCompany(!isEditingCompany);
                        if (isEditingCompany && currentCompany) {
                          setCompanyFormData({
                            name: currentCompany.name || '',
                            website: currentCompany.website || '',
                            employee_count: currentCompany.employee_count || '',
                            industry: currentCompany.industry || '',
                            description: currentCompany.description || ''
                          });
                        }
                      }}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {isEditingCompany ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditingCompany ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company_name">Company Name</Label>
                          <Input
                            id="company_name"
                            value={companyFormData.name}
                            onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="company_website">Website</Label>
                          <Input
                            id="company_website"
                            value={companyFormData.website}
                            onChange={(e) => setCompanyFormData({...companyFormData, website: e.target.value})}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="employee_count">Employee Count</Label>
                          <Select value={companyFormData.employee_count} onValueChange={(value) => setCompanyFormData({...companyFormData, employee_count: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10</SelectItem>
                              <SelectItem value="11-50">11-50</SelectItem>
                              <SelectItem value="51-200">51-200</SelectItem>
                              <SelectItem value="201-1000">201-1000</SelectItem>
                              <SelectItem value="1000+">1000+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="industry">Industry</Label>
                          <Select value={companyFormData.industry} onValueChange={(value) => setCompanyFormData({...companyFormData, industry: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="consulting">Consulting</SelectItem>
                              <SelectItem value="real_estate">Real Estate</SelectItem>
                              <SelectItem value="hospitality">Hospitality</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="company_description">Description</Label>
                        <Textarea
                          id="company_description"
                          value={companyFormData.description}
                          onChange={(e) => setCompanyFormData({...companyFormData, description: e.target.value})}
                          placeholder="Tell us about your company..."
                          className="h-24"
                        />
                      </div>
                      <Button
                        onClick={handleSaveCompany}
                        disabled={isSaving}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Company Info'}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Company Name</Label>
                          <p className="text-lg font-medium text-gray-900">{currentCompany.name}</p>
                        </div>
                        {currentCompany.website && (
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Website</Label>
                            <p className="text-lg font-medium text-gray-900">{currentCompany.website}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Employee Count</Label>
                          <p className="text-lg font-medium text-gray-900">{currentCompany.employee_count}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Industry</Label>
                          <p className="text-lg font-medium text-gray-900 capitalize">{currentCompany.industry?.replace('_', ' ')}</p>
                        </div>
                      </div>
                      
                      {/* Company Code Section */}
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-purple-900">Team Invite Code</h4>
                            <p className="text-sm text-purple-700">Share this code with team members to invite them to your workspace</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(currentCompany.unique_code || '');
                                alert('Company code copied to clipboard!');
                              }}
                              className="border-purple-300 text-purple-700 hover:bg-purple-100"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy Code
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleGenerateNewCode}
                              disabled={isSaving}
                              className="border-orange-300 text-orange-700 hover:bg-orange-100"
                            >
                              Generate New
                            </Button>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                          <div className="text-3xl font-bold font-mono text-purple-600 tracking-wider text-center">
                            {currentCompany.unique_code || 'Loading...'}
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>How to invite team members:</strong>
                            <br />
                            1. Share this code with your team
                            <br />
                            2. They visit the landing page and click "Join Company"
                            <br />
                            3. They enter this code to join your workspace
                          </p>
                        </div>
                      </div>

                      {currentCompany.description && (
                        <div className="mt-6">
                          <Label className="text-sm font-medium text-gray-500">Description</Label>
                          <p className="text-gray-900 mt-1">{currentCompany.description}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
                <Card className="shadow-sm border-0 bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-600">
                            <Building2 className="w-5 h-5" />
                            No Company Selected
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-8 text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <h3 className="text-sm font-medium text-gray-900 mb-2">No Active Company</h3>
                        <p className="text-xs text-gray-600">You are not associated with an active company. Please join or create one.</p>
                    </CardContent>
                </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center text-gray-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and application settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.title}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
