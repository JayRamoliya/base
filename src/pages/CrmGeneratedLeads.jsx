import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lead } from "@/api/entities";
import { Contact } from "@/api/entities";
import { CrmCompany } from "@/api/entities";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import Loader from "../components/ui/Loader";
import { Mail, Phone, Briefcase, Building2, UserCheck, Trash2 } from "lucide-react";
import { useToast } from "../components/ui/toast";
import ConfirmationModal from '../components/ui/ConfirmationModal';

export default function CrmGeneratedLeads() {
  const [generatedLeads, setGeneratedLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCompany, setCurrentCompany] = useState(null);
  const { success, error: toastError } = useToast();
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [userData, companiesData] = await Promise.all([User.me(), Company.list()]);
        setUser(userData);
        if (companiesData.length > 0) {
          const company = companiesData.find(c => c.id === userData.company_id) || companiesData[0];
          setCurrentCompany(company);
          await loadLeads(company.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        toastError("Load Failed", "Could not load generated leads.");
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const loadLeads = async (companyId) => {
    try {
      const leadsData = await Lead.filter({ company_id: companyId }, "-created_date");
      const contactIds = leadsData.map(l => l.contact_id).filter(Boolean);
      const crmCompanyIds = leadsData.map(l => l.contact?.crm_company_id).filter(Boolean);

      let contactsData = [];
      if (contactIds.length > 0) {
        contactsData = await Contact.filter({ id: { "$in": contactIds } });
      }
      
      const contactsMap = contactsData.reduce((acc, contact) => {
        acc[contact.id] = contact;
        return acc;
      }, {});

      const crmCompanyIdsFromContacts = contactsData.map(c => c.crm_company_id).filter(Boolean);
      const allCrmCompanyIds = [...new Set([...crmCompanyIds, ...crmCompanyIdsFromContacts])];

      let crmCompaniesData = [];
      if (allCrmCompanyIds.length > 0) {
        crmCompaniesData = await CrmCompany.filter({ id: { "$in": allCrmCompanyIds } });
      }

      const crmCompaniesMap = crmCompaniesData.reduce((acc, c) => {
        acc[c.id] = c;
        return acc;
      }, {});

      const populatedLeads = leadsData.map(lead => ({
        ...lead,
        contact: contactsMap[lead.contact_id],
        crmCompany: contactsMap[lead.contact_id] ? crmCompaniesMap[contactsMap[lead.contact_id].crm_company_id] : null,
      }));

      setGeneratedLeads(populatedLeads);
    } catch (err) {
      console.error("Failed to load leads:", err);
      toastError("Load Failed", "There was an error fetching your leads.");
    }
  };
  
  const handleDeleteClick = (lead) => {
    setLeadToDelete(lead);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      // Must delete the associated contact first if it exists
      if (leadToDelete.contact_id) {
        await Contact.delete(leadToDelete.contact_id);
      }
      await Lead.delete(leadToDelete.id);
      
      success("Lead Deleted", "The lead has been successfully removed.");
      setGeneratedLeads(prev => prev.filter(l => l.id !== leadToDelete.id));
    } catch (err) {
      console.error("Failed to delete lead:", err);
      toastError("Delete Failed", "Could not delete the lead. Please try again.");
    } finally {
      setIsConfirmOpen(false);
      setLeadToDelete(null);
    }
  };

  if (isLoading) {
    return <Loader message="Loading generated leads..." />;
  }

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generated Leads</h1>
            <p className="text-gray-600">Leads generated from your "Find Leads" search.</p>
          </div>
        </div>

        {generatedLeads.length === 0 ? (
          <div className="text-center py-16">
            <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads generated yet</h3>
            <p className="text-gray-500">Use the "Find Leads" tool to generate and import new leads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedLeads.map((lead) => (
              <Card key={lead.id} className="bg-white shadow-sm border-0">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-purple-100 text-purple-600 font-bold">
                          {lead.contact?.name?.charAt(0) || 'L'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{lead.contact?.name}</CardTitle>
                        <p className="text-sm text-gray-500">{lead.contact?.job_title}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(lead)}>
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {lead.crmCompany && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{lead.crmCompany.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{lead.contact?.email}</span>
                  </div>
                  {lead.contact?.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{lead.contact.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant={lead.status === 'new' ? 'default' : 'secondary'} className="capitalize bg-green-100 text-green-700">
                      {lead.status}
                    </Badge>
                    <Badge variant="outline">{lead.source}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This will also remove the associated contact and cannot be undone."
        type="danger"
        confirmText="Delete"
      />
    </>
  );
}