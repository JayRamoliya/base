
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";

export default function AcceptInvitation() {
  const navigate = useNavigate();
  const [companyCode, setCompanyCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch current user details
    User.me()
      .then(setCurrentUser)
      .catch(() => {
        // If user is not logged in or cannot be fetched, redirect to Landing page
        navigate(createPageUrl("Landing"));
      });
  }, [navigate]);

  const handleJoinCompany = async (e) => {
    e.preventDefault();
    if (!companyCode.trim() || !currentUser) {
      setError("Please enter a company code.");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Find company by unique code
      const companies = await Company.filter({ unique_code: companyCode.toUpperCase().trim() });
      
      if (companies.length === 0) {
        setError("Invalid company code. Please check and try again.");
        setIsJoining(false);
        return;
      }

      const companyToJoin = companies[0];
      const members = companyToJoin.members || [];
      
      // Add user to company's member list if not already there
      if (!members.includes(currentUser.email)) {
        await Company.update(companyToJoin.id, {
          members: [...members, currentUser.email]
        });
      }
      
      // Set this as the user's active company
      await User.updateMyUserData({ 
        company_id: companyToJoin.id,
        role: 'user' // Always assign user role
      });

      setSuccess(true);
      
      // Redirect to dashboard after successful join, forcing a full page reload to ensure company context is loaded
      setTimeout(() => {
        window.location.href = createPageUrl("Dashboard");
      }, 2000);

    } catch (err) {
      console.error("Failed to join company:", err);
      setError("An error occurred while trying to join the company. Please try again.");
    }
    // setIsJoining(false) is called inside catch block if there's an error. 
    // If success, it redirects, so no need to set to false here.
    // If the try block fails, setIsJoining(false) is handled in the catch block.
    // If it succeeds, the page will redirect.
    if (!success) { // Only set to false if not successful and thus not redirecting
      setIsJoining(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <CheckCircle className="mx-auto h-16 w-16 mb-4" />
            <CardTitle className="text-2xl">Successfully Joined!</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">
              You have successfully joined the company workspace.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
            <div className="mt-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Company</h1>
          <p className="text-gray-600">Enter your company code to join your team workspace</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Users className="w-6 h-6" />
              Join Your Team
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleJoinCompany} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Company Code
                </label>
                <Input
                  type="text"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  placeholder="Enter your 6-digit company code"
                  className="text-lg text-center font-mono h-14 tracking-widest"
                  maxLength={6}
                  disabled={isJoining}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Ask your team admin for the company code
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isJoining || !companyCode.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium h-12 text-lg shadow-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Joining Company...
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5 mr-2" />
                    Join Company
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                Don't have a company code?{" "}
                <button
                  onClick={() => navigate(createPageUrl("CompanyOnboarding"))}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Create your own company
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
