import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Contact } from '@/api/entities';

export default function LeadForm({ isOpen, onClose, onSave, companyId }) {
  const [leadData, setLeadData] = useState({
    contact_id: '',
    source: '',
    status: 'new',
    next_step_text: '',
    next_step_due: ''
  });
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (isOpen && companyId) {
      const fetchContacts = async () => {
        try {
          const contactsData = await Contact.filter({ company_id: companyId });
          setContacts(contactsData);
        } catch (error) {
          console.error("Failed to fetch contacts for lead form:", error);
        }
      };
      fetchContacts();
    }
  }, [isOpen, companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeadData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setLeadData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(leadData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label>Contact</Label>
            <Select name="contact_id" onValueChange={(value) => handleSelectChange('contact_id', value)} required>
              <SelectTrigger><SelectValue placeholder="Select a contact" /></SelectTrigger>
              <SelectContent>
                {contacts.map(contact => <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="source">Source</Label>
            <Input id="source" name="source" value={leadData.source} onChange={handleChange} />
          </div>
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue="new" onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}