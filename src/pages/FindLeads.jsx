import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  MapPin, 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  Plus,
  ArrowRight,
  Sparkles,
  Target,
  Globe,
  Briefcase,
  Copy
} from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import { User } from "@/api/entities";
import { Company } from "@/api/entities";
import { Contact } from "@/api/entities";
import { CrmCompany } from "@/api/entities";
import { Lead } from "@/api/entities";
import { Activity } from "@/api/entities";
import Loader from "../components/ui/Loader";
import { useToast } from "../components/ui/toast";

export default function FindLeads() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [currentCompany, setCurrentCompany] = useState(null);
  const [user, setUser] = useState(null);
  const { success, error: toastError } = useToast();

  const industries = [
    "Technology", "Healthcare", "Finance", "Retail", "Education", 
    "Manufacturing", "Real Estate", "Hospitality", "Consulting", "Marketing", "Other"
  ];

  const companySizes = [
    "1-10", "11-50", "51-200", "201-1000", "1000+"
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [userData, companies] = await Promise.all([User.me(), Company.list()]);
      setUser(userData);
      if (companies.length > 0) {
        const activeCompany = companies.find(c => c.id === userData.company_id) || companies[0];
        setCurrentCompany(activeCompany);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toastError("Search Required", "Please enter a search query to find leads.");
      return;
    }

    setIsLoading(true);
    setSearchResults([]);

    try {
      const prompt = `You are an expert lead generation specialist. Find potential business leads based on these criteria:

Search Query: ${searchQuery}
Location: ${location || 'Any location'}
Industry: ${industry || 'Any industry'}
Company Size: ${companySize || 'Any size'}

Generate 8-12 realistic potential leads with complete contact information. Each lead should have:
- Company name
- Contact person (decision maker role like CEO, Marketing Director, etc.)
- Complete email address
- Complete phone number with proper formatting
- Job title
- Company description
- Location (city, state/country)
- Industry
- Company size estimate
- LinkedIn profile URL (realistic format)

Make the data realistic and professional. Ensure all email addresses and phone numbers are complete and properly formatted.`;

      const response = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            leads: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company_name: { type: "string" },
                  contact_name: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  job_title: { type: "string" },
                  company_description: { type: "string" },
                  location: { type: "string" },
                  industry: { type: "string" },
                  company_size: { type: "string" },
                  linkedin_url: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response && response.leads) {
        setSearchResults(response.leads);
        success("Leads Found", `Found ${response.leads.length} potential leads matching your criteria.`);
      } else {
        toastError("No Results", "No leads found matching your criteria. Try adjusting your search parameters.");
      }
    } catch (error) {
      console.error("Lead search failed:", error);
      toastError("Search Failed", "Failed to search for leads. Please try again.");
    }
    setIsLoading(false);
  };

  const handleSelectLead = (index, checked) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeads(new Set(Array.from({ length: searchResults.length }, (_, i) => i)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleAddToLeads = async () => {
    if (selectedLeads.size === 0) {
      toastError("No Selection", "Please select at least one lead to add.");
      return;
    }

    if (!currentCompany || !user) {
      toastError("Setup Required", "Please ensure your company is properly set up.");
      return;
    }

    setIsLoading(true);
    let successCount = 0;

    try {
      for (const index of selectedLeads) {
        const leadData = searchResults[index];
        
        try {
          // First create or find the CRM company
          const existingCrmCompanies = await CrmCompany.filter({ 
            name: leadData.company_name,
            company_id: currentCompany.id 
          });
          
          let crmCompany;
          if (existingCrmCompanies.length > 0) {
            crmCompany = existingCrmCompanies[0];
          } else {
            crmCompany = await CrmCompany.create({
              name: leadData.company_name,
              industry: leadData.industry,
              company_id: currentCompany.id
            });
          }

          // Create or find the contact
          const existingContacts = await Contact.filter({ 
            email: leadData.email,
            company_id: currentCompany.id 
          });
          
          let contact;
          if (existingContacts.length > 0) {
            contact = existingContacts[0];
          } else {
            contact = await Contact.create({
              name: leadData.contact_name,
              email: leadData.email,
              phone: leadData.phone,
              job_title: leadData.job_title,
              crm_company_id: crmCompany.id,
              company_id: currentCompany.id
            });
          }

          // Create the lead
          await Lead.create({
            contact_id: contact.id,
            source: 'AI Lead Generation',
            status: 'new',
            owner_id: user.id,
            company_id: currentCompany.id,
            last_activity_date: new Date().toISOString()
          });

          // Create activity log
          await Activity.create({
            description: `<strong>${user.full_name}</strong> added new lead: <em>${leadData.contact_name}</em> from ${leadData.company_name}`,
            type: "create",
            entity_type: "Lead",
            entity_title: leadData.contact_name,
            user_name: user.full_name,
            company_id: currentCompany.id
          });

          successCount++;
        } catch (leadError) {
          console.error(`Failed to create lead for ${leadData.contact_name}:`, leadError);
        }
      }

      if (successCount > 0) {
        success("Leads Added", `Successfully added ${successCount} leads to your CRM.`);
        setSelectedLeads(new Set());
        
        // Trigger refresh on Generated Leads page
        window.dispatchEvent(new Event('leads_updated'));
      } else {
        toastError("Creation Failed", "Failed to create leads. Please try again.");
      }
    } catch (error) {
      console.error("Failed to add leads:", error);
      toastError("Creation Failed", "Failed to add leads to your CRM.");
    }
    setIsLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    success("Copied", "Copied to clipboard!");
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Find Leads</h1>
          <p className="text-gray-600">Discover potential customers and grow your business with AI-powered lead generation.</p>
        </div>

        {/* Search Form */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              Lead Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="searchQuery">Search Query *</Label>
                <Input
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., SaaS companies, Marketing agencies, Real estate"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., New York, California, USA"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry" className="mt-2">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any Industry</SelectItem>
                    {industries.map(ind => (
                      <SelectItem key={ind} value={ind.toLowerCase()}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger id="companySize" className="mt-2">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any Size</SelectItem>
                    {companySizes.map(size => (
                      <SelectItem key={size} value={size}>{size} employees</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="bg-purple-600 hover:bg-purple-700 font-medium"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Searching...' : 'Find Leads'}
            </Button>
          </CardContent>
        </Card>

        {/* Search Results */}
        {isLoading && (
          <Loader message="Searching for leads..." />
        )}

        {searchResults.length > 0 && (
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Search Results ({searchResults.length})
                </CardTitle>
                <div className="flex items-center gap-3">
                  {selectedLeads.size > 0 && (
                    <Badge className="bg-purple-100 text-purple-700">
                      {selectedLeads.size} selected
                    </Badge>
                  )}
                  <Button
                    onClick={handleAddToLeads}
                    disabled={selectedLeads.size === 0 || isLoading}
                    className="bg-purple-600 hover:bg-purple-700 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Leads ({selectedLeads.size})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Checkbox
                    checked={selectedLeads.size === searchResults.length}
                    onCheckedChange={handleSelectAll}
                    className="border-gray-300"
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedLeads.size === searchResults.length ? "Unselect All" : "Select All"}
                  </span>
                </div>

                {searchResults.map((lead, index) => {
                  const isSelected = selectedLeads.has(index);
                  return (
                    <div 
                      key={index} 
                      className={`p-6 border rounded-xl transition-colors ${isSelected ? 'border-purple-200 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectLead(index, checked)}
                          className="mt-1 border-gray-300"
                        />

                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                              {lead.contact_name?.charAt(0) || 'L'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{lead.contact_name}</h3>
                                <p className="text-sm text-gray-600">{lead.job_title}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-100 text-blue-700">{lead.industry}</Badge>
                                <Badge variant="outline">{lead.company_size} employees</Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-gray-900">{lead.company_name}</div>
                                    <div className="text-sm text-gray-500 truncate">{lead.company_description}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm text-gray-600">{lead.location}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-sm text-gray-900 break-all">{lead.email}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 flex-shrink-0"
                                      onClick={() => copyToClipboard(lead.email)}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-sm text-gray-900">{lead.phone}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 flex-shrink-0"
                                      onClick={() => copyToClipboard(lead.phone)}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && searchResults.length === 0 && (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="text-center py-16">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Find Your Next Customers</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Use our AI-powered search to discover potential leads based on your target criteria. 
                Enter your search parameters above to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}