import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Invitation } from "@/api/entities";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import { CheckCircle, AlertCircle, Building2, Users, Globe, X } from "lucide-react";
import Loader from "../components/ui/Loader";
import { useToast } from '../components/ui/toast';

export default function AcceptInvitation() {
  const [invitation, setInvitation] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      setError('Invalid invitation link. No token provided.');
      setIsLoading(false);
      return;
    }
    
    loadInvitation(token);
  }, []);

  const loadInvitation = async (token) => {
    try {
      const invitations = await Invitation.filter({ token: token, status: 'pending' });
      
      if (invitations.length === 0) {
        setError('This invitation is invalid, expired, or has already been used.');
        setIsLoading(false);
        return;
      }
      
      const invite = invitations[0];
      setInvitation(invite);
      
      const companyData = await Company.filter({ id: invite.company_id });
      if (companyData.length > 0) {
        setCompany(companyData[0]);
      } else {
        setError('The company you were invited to no longer exists.');
      }
    } catch (err) {
      console.error('Failed to load invitation:', err);
      setError('Failed to verify invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCompany = async () => {
    if (!invitation) return;
    
    setIsProcessing(true);
    try {
      const user = await User.me();
      
      await User.updateMyUserData({ 
        company_id: invitation.company_id 
      });
      
      await Invitation.update(invitation.id, { status: 'accepted' });

      localStorage.setItem('currentCompanyId', invitation.company_id);
      
      success('Welcome to the team!', `You have successfully joined ${company.name}.`);
      
      navigate(createPageUrl('Dashboard'));
    } catch (err) {
      if (err.message?.includes('not logged in')) {
        const currentUrl = window.location.href;
        await User.loginWithRedirect(currentUrl);
      } else {
        console.error('Failed to join company:', err);
        toastError('Failed to join company', 'An unexpected error occurred. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  const handleRejectInvitation = async () => {
    if (!invitation) return;
    
    setIsProcessing(true);
    try {
      await Invitation.update(invitation.id, { status: 'rejected' });
      setError('Invitation rejected. You can now close this window.');
    } catch (err) {
      console.error('Failed to reject invitation:', err);
      toastError('Failed to process rejection', 'Please try again or simply close this window.');
    } finally {
        setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <Loader message="Verifying your invitation..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95">
        <CardHeader className="text-center p-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            {error ? 'Invitation Status' : `You're Invited!`}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {error ? 'There was an issue with your invitation.' : `You have been invited to join the following workspace on Marketing OS.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {error ? (
            <div className="text-center py-4">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${invitation?.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  {invitation?.status === 'rejected' ? <X className="w-8 h-8 text-red-500"/> : <AlertCircle className="w-8 h-8 text-yellow-500" />}
              </div>
              <p className="text-gray-700 mb-6">{error}</p>
              <Button 
                onClick={() => window.close()}
                variant="outline"
                className="w-full"
              >
                Close Window
              </Button>
            </div>
          ) : company ? (
            <div className="space-y-6">
                <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
                    <h3 className="font-semibold text-lg text-gray-800">{company.name}</h3>
                    <div className="flex items-center text-gray-500 text-sm">
                        <Globe className="w-4 h-4 mr-2" /> {company.website || "No website provided"}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                        <Users className="w-4 h-4 mr-2" /> {company.industry || "No industry provided"}
                    </div>
                </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleRejectInvitation} 
                  variant="outline" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Invitation
                </Button>
                <Button 
                  onClick={handleJoinCompany} 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader message="Processing..." isSmall={true} /> : <> <CheckCircle className="w-4 h-4 mr-2" /> Join Company </>}
                </Button>
              </div>
            </div>
          ) : <Loader message="Loading company details..." />}
        </CardContent>
      </Card>
    </div>
  );
}