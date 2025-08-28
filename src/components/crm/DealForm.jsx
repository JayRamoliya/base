
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Contact } from '@/api/entities';
import { CrmCompany } from '@/api/entities';

// Simple Loader component for demonstration
const Loader = ({ message }) => (
  <div className="flex justify-center items-center h-40">
    <p className="text-gray-500">{message}</p>
  </div>
);

export default function DealForm({ isOpen, onClose, onSave, companyId, deal = null, leadToConvert = null }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    stage: 'qualified',
    expected_close_date: '',
    contact_id: '',
    crm_company_id: ''
  });
  const [contacts, setContacts] = useState([]);
  const [crmCompanies, setCrmCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New state for loading
  const [isSaving, setIsSaving] = useState(false); // New state for saving

  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!companyId) return;
      setIsLoading(true); // Start loading
      try {
        const [contactsData, crmCompaniesData] = await Promise.all([
          Contact.filter({ company_id: companyId }),
          CrmCompany.filter({ company_id: companyId })
        ]);
        setContacts(contactsData);
        setCrmCompanies(crmCompaniesData);

        if (leadToConvert) {
          // Fetch specific contact to pre-populate for lead conversion
          const contact = await Contact.get(leadToConvert.contact_id);
          if (contact) {
            setFormData({
              name: `${contact.name} Deal`,
              amount: '',
              stage: 'qualified',
              expected_close_date: '',
              contact_id: contact.id,
              crm_company_id: contact.crm_company_id
            });
          }
        } else if (deal) {
          setFormData({
            name: deal.name || '',
            amount: deal.amount || '',
            stage: deal.stage || 'qualified',
            expected_close_date: deal.expected_close_date ? deal.expected_close_date.split('T')[0] : '', // Format date for input type="date"
            contact_id: deal.contact_id || '',
            crm_company_id: deal.crm_company_id || ''
          });
        } else {
          // Reset form for new deal
          setFormData({
            name: '',
            amount: '',
            stage: 'qualified',
            expected_close_date: '',
            contact_id: '',
            crm_company_id: ''
          });
        }
      } catch (error) {
        console.error("Failed to fetch contacts/companies for deal form:", error);
      } finally {
        setIsLoading(false); // End loading
      }
    };
    
    if (isOpen) {
      fetchRelatedData();
    }
  }, [isOpen, companyId, leadToConvert, deal]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {deal ? 'Edit Deal' : (leadToConvert ? 'Convert Lead to Deal' : 'Create New Deal')}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Loader message="Loading deal data..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Deal Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="expected_close_date">Expected Close Date</Label>
              <Input id="expected_close_date" name="expected_close_date" type="date" value={formData.expected_close_date} onChange={handleChange} required />
            </div>
            <div>
              <Label>Contact</Label>
              <Select name="contact_id" value={formData.contact_id} onValueChange={(value) => handleSelectChange('contact_id', value)}>
                <SelectTrigger><SelectValue placeholder="Select a contact" /></SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Company</Label>
              <Select name="crm_company_id" value={formData.crm_company_id} onValueChange={(value) => handleSelectChange('crm_company_id', value)}>
                <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                <SelectContent>
                  {crmCompanies.map(company => <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || !formData.name.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 font-medium"
              >
                {isSaving ? 'Saving...' : (deal ? 'Update Deal' : 'Create Deal')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
