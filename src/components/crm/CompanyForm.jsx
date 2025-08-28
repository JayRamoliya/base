
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CompanyForm({ isOpen, onClose, onSave, company }) {
  const [companyData, setCompanyData] = useState({
    name: '',
    website: '',
    industry: '',
    size: '',
    notes: ''
  });

  useEffect(() => {
    if (company) {
      setCompanyData({
        name: company.name || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.size || '',
        notes: company.notes || ''
      });
    } else {
      setCompanyData({ name: '', website: '', industry: '', size: '', notes: '' });
    }
  }, [company, isOpen]); // Add isOpen as a dependency to reset form when dialog opens for new company

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(companyData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{company ? 'Edit Company' : 'Add New Company'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" name="name" value={companyData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" value={companyData.website} onChange={handleChange} />
          </div>
           <div>
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" name="industry" value={companyData.industry} onChange={handleChange} />
          </div>
           <div>
            <Label htmlFor="size">Size (e.g., 1-10 employees)</Label>
            <Input id="size" name="size" value={companyData.size} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" value={companyData.notes} onChange={handleChange} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{company ? 'Save Changes' : 'Save Company'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
