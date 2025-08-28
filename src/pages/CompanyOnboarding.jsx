
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";

// Generate a secure random company code
const generateCompanyCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function CompanyOnboarding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    // Fetch current user data on component mount
    // Handle potential errors during user data fetching
    User.me().then(setCurrentUser).catch(error => {
      console.error("Failed to fetch current user data:", error);
      // Depending on the app's needs, could show a message or redirect
    });
  }, []); // Empty dependency array ensures this runs only once on component mount

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs: company name must not be empty and current user must be loaded
    if (!companyName.trim()) {
      alert("Company name cannot be empty.");
      return;
    }
    if (!currentUser) {
      console.warn("Attempted to submit before user data was loaded.");
      alert("User data is not yet loaded. Please wait a moment and try again.");
      return;
    }

    setIsLoading(true);
    try {
      const uniqueCode = generateCompanyCode();
      
      const newCompany = await Company.create({ 
        name: companyName.trim(),
        unique_code: uniqueCode,
        members: [currentUser.email], // Add creator as the first member
        status: "active"
      });
      
      // Update current user to be associated with this new company
      await User.updateMyUserData({ company_id: newCompany.id });
      
      // Navigate to Dashboard after successful company creation and user update
      // Using React Router's navigate for a smoother Single Page Application (SPA) experience
      // instead of a full page reload (window.location.href).
      navigate(createPageUrl("Dashboard"));
      
    } catch (error) {
      console.error("Failed to create company:", error);
      alert("Failed to create company. Please check your inputs and try again.");
      setIsLoading(false); // Reset loading state on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
            <div className="inline-block bg-purple-100 p-4 rounded-2xl">
              <Building2 className="w-10 h-10 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mt-4">Create Your Workspace</h1>
            <p className="text-lg text-gray-600 mt-2">Give your company a name to get started.</p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="name" className="text-base font-medium">Company Name *</Label>
                    <p className="text-sm text-gray-500 mb-3">You can always change this later.</p>
                    <Input
                        id="name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Stark Industries"
                        className="text-lg h-14"
                        disabled={isLoading}
                    />
                </div>
                <Button
                    type="submit"
                    // Disable the button if loading, company name is empty, or current user data is not yet loaded.
                    // This prevents submission before necessary data is available and provides better UX.
                    disabled={isLoading || !companyName.trim() || !currentUser} 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-8 py-3 h-14 text-lg font-medium shadow-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            Create Company
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </Button>
            </form>
             <p className="text-center text-sm text-gray-500 mt-8">
              <button
                onClick={() => navigate(-1)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                ← Back
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
