
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Upload } from "lucide-react";
import { Contact } from "@/api/entities";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import Loader from "../components/ui/Loader";
import ContactForm from "../components/crm/ContactForm";
import ImportModal from "../components/crm/ImportModal";
import { CrmCompany } from "@/api/entities";
import { Mail, Phone, Briefcase, Building2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CrmContacts() {
  const [contacts, setContacts] = useState([]);
  const [crmCompanies, setCrmCompanies] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [userData, companiesData] = await Promise.all([User.me(), Company.list()]);
        setUser(userData);
        if (companiesData.length > 0) {
          // Prioritize the company_id from the user object, fallback to first company
          const activeCompany = companiesData.find(c => c.id === userData.company_id) || companiesData[0];
          setCurrentCompany(activeCompany);
          await loadContacts(activeCompany.id);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const loadContacts = async (companyId) => {
    try {
      const [contactsData, crmCompaniesData] = await Promise.all([
        Contact.filter({ company_id: companyId }),
        CrmCompany.filter({ company_id: companyId })
      ]);
      setContacts(contactsData);
      const companiesMap = crmCompaniesData.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
      setCrmCompanies(companiesMap);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    }
  };

  const handleSaveContact = async (contactData) => {
    if (!currentCompany || !user) return;
    try {
      if (editingContact) {
        await Contact.update(editingContact.id, contactData);
      } else {
        await Contact.create({
          ...contactData,
          owner_id: user.id,
          company_id: currentCompany.id,
        });
      }
      await loadContacts(currentCompany.id);
      setIsFormOpen(false);
      setEditingContact(null);
    } catch (error) {
      console.error("Failed to save contact:", error);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDelete = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await Contact.delete(contactId);
        // Refresh the contacts list after successful deletion
        await loadContacts(currentCompany.id);
      } catch (error) {
        console.error("Failed to delete contact:", error);
        // Inform the user if deletion fails
        alert("Failed to delete contact. It might have been already removed. The list will be refreshed.");
        // Refresh the list anyway to ensure UI consistency
        if (currentCompany) {
          loadContacts(currentCompany.id);
        }
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  if (isLoading) {
    return <Loader message="Loading contacts..." />;
  }

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600">Your central address book for all CRM contacts.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setIsFormOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map(contact => {
              const companyName = crmCompanies[contact.crm_company_id]?.name;
              return (
                <Card key={contact.id} className="bg-white shadow-sm hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-purple-600">{contact.name[0]}</span>
                      </div>
                      <div>
                        <CardTitle className="truncate text-lg">{contact.name}</CardTitle>
                        {contact.job_title && <p className="text-sm text-gray-500">{contact.job_title}</p>}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(contact)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm pt-0">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${contact.email}`} className="text-purple-600 hover:underline truncate">{contact.email}</a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {companyName && (
                       <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span>{companyName}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-16 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
              <p>Click "Add Contact" to create your first contact, or import from a file.</p>
            </CardContent>
          </Card>
        )}
      </div>
      <ContactForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        onSave={handleSaveContact}
        companyId={currentCompany?.id}
        contact={editingContact}
      />
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        entityName="Contact"
        companyId={currentCompany?.id}
        onImportComplete={() => loadContacts(currentCompany.id)}
      />
    </>
  );
}
