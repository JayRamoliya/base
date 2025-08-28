
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Invitation } from "@/api/entities";
import { Company } from "@/api/entities";
import { Activity } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Mail, 
  Crown, 
  MoreHorizontal,
  Trash2,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; 
import InviteMemberModal from "../components/team/InviteMemberModal";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import Loader from "@/components/ui/Loader";
import { useToast } from "../components/ui/toast";

// Generate a secure random company code
const generateCompanyCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});
  const { success, error: toastError, warning, info } = useToast();

  useEffect(() => {
    loadInitialData();
    // Auto-refresh every 2 minutes to show team changes
    const interval = setInterval(loadInitialData, 120000);
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (user.company_id) {
        const company = await Company.get(user.company_id);
        
        // If company exists but has no unique_code, generate and save one.
        if (company && !company.unique_code) {
          const newCode = generateCompanyCode();
          await Company.update(company.id, { unique_code: newCode });
          company.unique_code = newCode; // Update local object immediately
        }
        
        setCurrentCompany(company);
        await Promise.all([
          loadTeamMembers(company.id),
          loadPendingInvites(company.id)
        ]);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
      if (toastError) {
        toastError("Load Failed", "Could not load team data. Please refresh the page.");
      }
    }
    setIsLoading(false);
  };
  
  const loadTeamMembers = async (companyId) => {
    try {
      // Get all users with the same company_id
      const users = await User.filter({ company_id: companyId });
      setTeamMembers(users);
    } catch (err) {
      console.error("Failed to load team members:", err);
    }
  };
  
  const loadPendingInvites = async (companyId) => {
    try {
      const invites = await Invitation.filter({ 
        company_id: companyId, 
        status: "pending" 
      }, "-created_date");
      setPendingInvites(invites);
    } catch (err) {
      console.error("Failed to load pending invites:", err);
    }
  };

  const showConfirmation = ({ title, message, type = "warning", onConfirm, confirmText = "Confirm" }) => {
    setConfirmConfig({
      title,
      message, 
      type,
      onConfirm,
      confirmText
    });
    setIsConfirmOpen(true);
  };

  const handleRevokeInvitation = async (invitationId) => {
    // Only admins can revoke invitations
    if (!currentUser || currentUser.role !== 'admin') {
      warning("Permission Denied", "Only administrators can revoke invitations.");
      return;
    }

    showConfirmation({
      title: "Revoke Invitation",
      message: "Are you sure you want to revoke this invitation?",
      type: "warning",
      confirmText: "Revoke",
      onConfirm: async () => {
        try {
          await Invitation.update(invitationId, { status: 'expired' });
          if (currentCompany) {
            loadPendingInvites(currentCompany.id);
          }
          success("Invitation Revoked", "The invitation has been successfully revoked.");
        } catch (err) {
          console.error('Failed to revoke invitation:', err);
          toastError("Revoke Failed", "Failed to revoke invitation. Please try again.");
        }
        setIsConfirmOpen(false);
      }
    });
  };

  const handleRemoveUser = async (userToRemove) => {
    if (!currentUser || currentUser.role !== 'admin') {
      warning("Permission Denied", "Only administrators can remove team members.");
      return;
    }
    
    showConfirmation({
      title: "Remove Team Member", 
      message: `Are you sure you want to remove ${userToRemove.full_name || userToRemove.email} from the company?\n\nThis action will:\n• Remove their access to all company data\n• Remove them from all projects and tasks\n• This action cannot be undone`,
      type: "danger",
      confirmText: "Remove",
      onConfirm: async () => {
        try {
          await User.update(userToRemove.id, { 
            role: 'user', // Downgrade role
            company_id: null // Unlink from company
          });
          
          await Activity.create({
            description: `<strong>${currentUser.full_name}</strong> removed <strong>${userToRemove.full_name}</strong> from the company.`,
            type: "delete",
            entity_type: "User",
            entity_title: userToRemove.full_name,
            user_name: currentUser.full_name,
            company_id: currentCompany.id
          });
          
          if (currentCompany) {
            loadTeamMembers(currentCompany.id);
          }
          
          success("Member Removed", `${userToRemove.full_name || userToRemove.email} has been removed from the company.`);
        } catch (err) {
          console.error('Failed to remove user:', err);
          toastError("Removal Failed", "Failed to remove user. Please try again.");
        }
        setIsConfirmOpen(false);
      }
    });
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-red-100 text-red-700",
      user: "bg-blue-100 text-blue-700",
    };
    return styles[role] || "bg-gray-100 text-gray-700";
  };
  
  const admins = teamMembers.filter(m => m.role === 'admin');
  const totalMembers = teamMembers.length;

  if (isLoading) {
    return <Loader message="Loading team..." />;
  }

  return (
    <>
      <div className="p-8">
        <div className="w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
              <p className="text-gray-600">
                Manage team members, roles, and permissions • {totalMembers} total members
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => loadInitialData()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              
              {/* Only show invite button to admins */}
              {currentUser?.role === 'admin' && (
                <Button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  disabled={!currentCompany}
                >
                  <Plus className="w-4 h-4" />
                  Invite Team Member
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalMembers}</div>
                    <div className="text-sm text-gray-500">Total Members</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-green-100">
                    <Crown className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {admins.length}
                    </div>
                    <div className="text-sm text-gray-500">Administrators</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-orange-100">
                    <Mail className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{pendingInvites.length}</div>
                    <div className="text-sm text-gray-500">Pending Invites</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Info - Show to all users */}
          {currentCompany && (
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <p className="text-gray-900">{currentCompany.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Unique Company Code</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-lg font-mono">
                        {currentCompany.unique_code}
                      </code>
                      <p className="text-sm text-gray-500">Share this code with new team members</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Invitations - Only show to admins */}
          {currentUser?.role === 'admin' && pendingInvites.length > 0 && (
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-600" />
                  Pending Invitations ({pendingInvites.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">
                          {invite.email || "Link-based invitation"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Invited by {invite.invited_by} • {new Date(invite.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-700">
                          Pending
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeInvitation(invite.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members List - Show to all users */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Team Members ({totalMembers})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {teamMembers.length === 0 ? (
                   <p className="text-center p-8 text-gray-500">No team members found.</p>
                ) : (
                  teamMembers.map((member) => (
                    <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                                {member.full_name?.split(' ').map(n => n[0]).join('') || member.email[0].toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          <div>
                            <h4 className="font-medium text-gray-900">{member.full_name || 'No Name'}</h4>
                            <p className="text-sm text-gray-500">{member.email}</p>
                            {member.job_title && (
                              <p className="text-sm text-gray-600 mt-1">{member.job_title}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge className={`${getRoleBadge(member.role)} border-0 capitalize`}>
                            {member.role}
                          </Badge>
                          
                          {/* Only show remove option to admins, and not for current user */}
                          {currentUser?.role === 'admin' && member.email !== currentUser?.email && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  onClick={() => handleRemoveUser(member)}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove from Company
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Modal - Only for admins */}
        {isInviteModalOpen && currentUser?.role === 'admin' && (
          <InviteMemberModal
            isOpen={isInviteModalOpen}
            onClose={() => {
              setIsInviteModalOpen(false);
              if (currentCompany) loadPendingInvites(currentCompany.id);
            }}
            company={currentCompany}
            currentUser={currentUser}
          />
        )}

        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          {...confirmConfig}
        />
      </div>
    </>
  );
}
