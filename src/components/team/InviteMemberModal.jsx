
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Users, Check } from "lucide-react";

export default function InviteMemberModal({ isOpen, onClose, company, currentUser }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!company || !company.unique_code) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Invite Team Members
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-red-600">Company code not available. Please contact support.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Invite Team Members
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Company Code Display */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Share this code with your team members:</p>
            
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
              <div className="text-3xl font-bold font-mono text-purple-600 tracking-wider text-center mb-3">
                {company.unique_code}
              </div>
              <Button 
                size="sm" 
                onClick={() => copyToClipboard(company.unique_code)}
                className={`w-full ${copySuccess ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"}`}
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2">How to invite:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Share the code above with your team</li>
                <li>They visit the Marketing OS landing page</li>
                <li>Click "Join Company" and enter the code</li>
                <li>They instantly join your workspace</li>
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
