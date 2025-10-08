import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, Shield } from 'lucide-react';

const LawEnforcementScreen = ({ onVerified, onSkipToLogin }) => {
  const [response, setResponse] = useState(null);
  const [showError, setShowError] = useState(false);

  const handleResponse = (isLawEnforcement) => {
    setResponse(isLawEnforcement);
    
    if (isLawEnforcement) {
      setShowError(true);
      // Deny access and show error
      setTimeout(() => {
        window.location.href = 'https://www.instagram.com/smoaklandnycbx';
      }, 3000);
    } else {
      // Allow access
      setTimeout(() => {
        onVerified();
      }, 1000);
    }
  };

  if (showError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-red-950/90 border-red-700">
          <CardHeader className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-red-200 text-2xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-300 mb-4">
              This application is for authorized members only.
            </p>
            <p className="text-red-400 text-sm">
              Redirecting to our public social media...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/90 border-blue-700">
        <CardHeader className="text-center">
          <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <CardTitle className="text-white text-2xl mb-2">Security Verification</CardTitle>
          <p className="text-gray-300 text-sm">
            This is a members-only platform. Please answer truthfully.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-white text-lg font-semibold mb-4">
              Are you affiliated with law enforcement in any capacity?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              This includes police, DEA, FBI, or any other law enforcement agency.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => handleResponse(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              Yes, I am affiliated with law enforcement
            </Button>
            
            <Button
              onClick={() => handleResponse(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              No, I am not affiliated with law enforcement
            </Button>
          </div>
          
          {/* Skip verification for existing users */}
          <div className="mt-6 pt-4 border-t border-gray-600">
            <p className="text-center text-sm text-gray-400 mb-3">
              Already a verified member?
            </p>
            <Button
              onClick={onSkipToLogin}
              variant="outline"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              size="lg"
            >
              Login with Existing Account
            </Button>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-gray-500 text-xs">
              By proceeding, you acknowledge that you are legally authorized to access this platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LawEnforcementScreen;