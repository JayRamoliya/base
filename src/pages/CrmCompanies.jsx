
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Upload, Globe, Briefcase, Users } from "lucide-react";
import { CrmCompany } from "@/api/entities";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import Loader from "../components/ui/Loader";
import CompanyForm from "../components/crm/CompanyForm";
import ImportModal from "../components/crm/ImportModal";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";


export default function CrmCompanies() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);

  const loadCrmCompanies = async (companyId) => {
    try {
      const crmCompaniesData = await CrmCompany.filter({ company_id: companyId });
      setCompanies(crmCompaniesData);
    } catch (error) {
      console.error("Failed to load CRM companies:", error);
    }
  };

  const handleSaveCompany = async (companyData) => {
    if (!currentCompany) return;
    try {
      if (editingCompany) {
        await CrmCompany.update(editingCompany.id, companyData);
      } else {
        await CrmCompany.create({
          ...companyData,
          company_id: currentCompany.id,
        });
      }
      await loadCrmCompanies(currentCompany.id);
      setIsFormOpen(false);
      setEditingCompany(null);
    } catch (error) {
      console.error("Failed to save company:", error);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  const handleDelete = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company? This will not delete associated contacts.")) {
      try {
        await CrmCompany.delete(companyId);
        await loadCrmCompanies(currentCompany.id);
      } catch (error) {
        console.error("Failed to delete company:", error);
      }
    }
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCompany(null);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setCompanies([]); // Clear companies when loading new data
      try {
        const user = await User.me();
        if (user.company_id) {
          const company = await Company.get(user.company_id);
          setCurrentCompany(company);
          await loadCrmCompanies(company.id);
        } else {
          console.warn("No company ID found for the current user.");
          // Optionally handle cases where a user might not be associated with a company
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <Loader message="Loading companies..." />;
  }

  return (
    <>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600">Directory of all companies in your CRM.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setIsFormOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </div>
        </div>

        {companies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map(company => (
                <Card key={company.id} className="bg-white shadow-sm hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <CardTitle className="truncate">{company.name}</CardTitle>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(company)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(company.id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {company.website && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline truncate">
                          {company.website}
                        </a>
                      </div>
                    )}
                    {company.industry && (
                       <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <Badge variant="outline">{company.industry}</Badge>
                      </div>
                    )}
                    {company.size && (
                       <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{company.size} employees</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16 text-gray-500">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
                <p>Click "Add Company" to create your first company, or import from a file.</p>
              </CardContent>
            </Card>
          )}
      </div>
      <CompanyForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        onSave={handleSaveCompany}
        company={editingCompany}
      />
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        entityName="CrmCompany"
        companyId={currentCompany?.id}
        onImportComplete={() => loadCrmCompanies(currentCompany.id)}
      />
    </>
  );
}
