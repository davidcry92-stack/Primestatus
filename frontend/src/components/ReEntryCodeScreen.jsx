import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield, Lock, AlertCircle } from 'lucide-react';

const ReEntryCodeScreen = ({ onVerified, userEmail }) => {
  const [reEntryCode, setReEntryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if this is actually a fresh session (app was closed)
  const wasFreshSession = React.useMemo(() => {
    return !sessionStorage.getItem('app_session_active');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate code format
    if (!reEntryCode || reEntryCode.length < 4 || reEntryCode.length > 8) {
      setError('Please enter your 4-8 digit verification code');
      setLoading(false);
      return;
    }

    if (!/^\d+$/.test(reEntryCode)) {
      setError('Verification code must contain only numbers');
      setLoading(false);
      return;
    }

    try {
      // In a real app, this would call the backend API
      // For now, simulate verification with mock data
      
      // Mock successful verification after 1 second
      setTimeout(() => {
        if (reEntryCode === '1234') { // Required re-entry code
          // Mark session as active
          sessionStorage.setItem('app_session_active', 'true');
          sessionStorage.setItem('reentry_verified', 'true');
          onVerified();
        } else {
          setError('Invalid verification code. Please try again.');
        }
        setLoading(false);
      }, 1000);

    } catch (err) {
      setError('Verification failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/90 border-green-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_herbal-memberhub/artifacts/g7wqgiz2_Logo.png" 
              alt="StatusXSmoakland Logo" 
              className="h-12 w-auto"
            />
          </div>
          <Shield className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <CardTitle className="text-white text-2xl mb-2">Re-Entry Verification</CardTitle>
          <p className="text-gray-300 text-sm">
            Enter your personal verification code to access StatusXSmoakland
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="bg-green-900/30 border border-green-400/30 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-semibold text-sm">Security Notice</span>
              </div>
              <p className="text-gray-300 text-xs">
                This is your personal verification code that you created during registration. 
                It's required each time you access the app for additional security.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reentry-code" className="text-white">
                Verification Code
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="reentry-code"
                  type="password"
                  placeholder="Enter your 4-8 digit code"
                  value={reEntryCode}
                  onChange={(e) => {
                    setReEntryCode(e.target.value);
                    setError(''); // Clear error when user types
                  }}
                  className="pl-10 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 text-center text-2xl tracking-widest"
                  maxLength={8}
                  required
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loading || !reEntryCode}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
            >
              {loading ? 'Verifying...' : 'Access StatusXSmoakland'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs mb-2">Demo Codes for Testing:</p>
              <div className="flex justify-center space-x-4 text-xs">
                <span className="text-green-400">1234</span>
                <span className="text-gray-500">•</span>
                <span className="text-green-400">0000</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-gray-700 mt-6">
            <p className="text-gray-500 text-xs mb-2">
              Forgot your verification code?
            </p>
            <a 
              href="mailto:support@statusxsmoakland.com" 
              className="text-green-400 hover:text-green-300 transition-colors text-sm"
            >
              Contact Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReEntryCodeScreen;