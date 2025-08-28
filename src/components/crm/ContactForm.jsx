
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CrmCompany } from '@/api/entities';

export default function ContactForm({ isOpen, onClose, onSave, companyId, contact }) {
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    job_title: '',
    crm_company_id: ''
  });
  const [crmCompanies, setCrmCompanies] = useState([]);

  useEffect(() => {
    if (contact) {
      setContactData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        job_title: contact.job_title || '',
        crm_company_id: contact.crm_company_id || ''
      });
    } else {
      setContactData({ name: '', email: '', phone: '', job_title: '', crm_company_id: '' });
    }
  }, [contact, isOpen]); // Added isOpen to dependency array to reset form when opened for a new contact

  useEffect(() => {
    if (isOpen && companyId) {
      const fetchCompanies = async () => {
        try {
          const companiesData = await CrmCompany.filter({ company_id: companyId });
          setCrmCompanies(companiesData);
        } catch (error) {
          console.error("Failed to fetch companies for contact form:", error);
        }
      };
      fetchCompanies();
    }
  }, [isOpen, companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(contactData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={contactData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={contactData.email} onChange={handleChange} required />
          </div>
           <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={contactData.phone} onChange={handleChange} />
          </div>
           <div>
            <Label htmlFor="job_title">Job Title</Label>
            <Input id="job_title" name="job_title" value={contactData.job_title} onChange={handleChange} />
          </div>
          <div>
            <Label>Company</Label>
            <Select name="crm_company_id" value={contactData.crm_company_id} onValueChange={(value) => handleSelectChange('crm_company_id', value)}>
              <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
              <SelectContent>
                {crmCompanies.map(company => <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{contact ? 'Save Changes' : 'Save Contact'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
