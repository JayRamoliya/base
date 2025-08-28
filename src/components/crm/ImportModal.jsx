import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import { Contact } from '@/api/entities';
import { CrmCompany } from '@/api/entities';
import { Lead } from '@/api/entities';

const ENTITY_MAP = {
  Lead: {
    entity: Lead,
    schema: {
      type: 'object',
      properties: {
        contact_name: { type: 'string' },
        contact_email: { type: 'string' },
        contact_phone: { type: 'string' },
        company_name: { type: 'string' },
        company_website: { type: 'string' },
        company_industry: { type: 'string' },
        source: { type: 'string' },
        status: { type: 'string', enum: ['new', 'contacted', 'qualified'] },
        next_step_text: { type: 'string' },
      }
    }
  }
};

export default function ImportModal({ isOpen, onClose, companyId, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleImport = async () => {
    if (!file || !companyId) return;

    setIsImporting(true);
    setError(null);

    try {
      // 1. Upload the file
      const { file_url } = await UploadFile({ file });
      
      // 2. Extract data from the file
      const entityInfo = ENTITY_MAP.Lead;
      const extractionResult = await ExtractDataFromUploadedFile({
        file_url: file_url,
        json_schema: { type: 'array', items: entityInfo.schema }
      });

      if (extractionResult.status === 'error' || !extractionResult.output) {
        throw new Error(extractionResult.details || 'Failed to extract data from file.');
      }

      let successCount = 0;
      let errorCount = 0;
      
      // 3. Process each lead record
      for (const record of extractionResult.output) {
        try {
          // Create CRM Company if provided
          let crmCompanyId = null;
          if (record.company_name) {
            const crmCompany = await CrmCompany.create({
              name: record.company_name,
              website: record.company_website || '',
              industry: record.company_industry || '',
              company_id: companyId
            });
            crmCompanyId = crmCompany.id;
          }

          // Create Contact
          const contact = await Contact.create({
            name: record.contact_name || 'Imported Contact',
            email: record.contact_email || '',
            phone: record.contact_phone || '',
            crm_company_id: crmCompanyId,
            company_id: companyId
          });

          // Create Lead
          await Lead.create({
            contact_id: contact.id,
            source: record.source || 'CSV Import',
            status: record.status || 'new',
            next_step_text: record.next_step_text || '',
            company_id: companyId
          });

          successCount++;
        } catch (error) {
          console.error("Failed to import record:", error);
          errorCount++;
        }
      }

      // 4. Close modal and refresh data
      onImportComplete(successCount, errorCount);
      onClose();

    } catch (e) {
      console.error("Import failed:", e);
      setError(e.message || "An unknown error occurred during import.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            Import Leads
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">CSV Format Requirements:</p>
                <p className="text-blue-800">Include columns: contact_name, contact_email, contact_phone, company_name, company_website, company_industry, source, status</p>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="import-file">CSV or PDF File</Label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label htmlFor="import-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 border-gray-300 hover:border-purple-400 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <FileText className="w-8 h-8 mb-2 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">{file.name}</p>
                      <p className="text-xs text-green-600">Ready to import</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">CSV or PDF files only</p>
                    </>
                  )}
                </div>
                <Input 
                  id="import-file" 
                  type="file" 
                  className="hidden" 
                  accept=".csv,.pdf" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isImporting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isImporting ? 'Importing...' : 'Start Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}