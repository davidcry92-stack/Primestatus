import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Shield, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const VerificationPending = ({ user }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'needs_medical': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'needs_medical': return <FileText className="h-5 w-5" />;
      case 'approved': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <AlertCircle className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getStatusMessage = (status, requiresMedical) => {
    switch (status) {
      case 'pending':
        return 'Your ID documents are being reviewed by our verification team.';
      case 'needs_medical':
        return 'Medical documentation required. Please ensure your doctor\'s prescription is clearly visible.';
      case 'approved':
        return 'Verification complete! You now have full access to StatusXSmoakland.';
      case 'rejected':
        return 'Verification rejected. Please contact support for assistance.';
      default:
        return 'Verification status unknown. Please contact support.';
    }
  };

  if (user.is_verified) {
    return null; // Don't show this component if user is already verified
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/90 border-blue-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_herbal-memberhub/artifacts/g7wqgiz2_Logo.png" 
              alt="StatusXSmoakland Logo" 
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-2">
            Account Verification
          </CardTitle>
          <div className="flex items-center justify-center space-x-2">
            <Badge className={`${getStatusColor(user.verification_status)} text-white flex items-center space-x-2 px-4 py-2`}>
              {getStatusIcon(user.verification_status)}
              <span className="capitalize">{user.verification_status?.replace('_', ' ') || 'Unknown'}</span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Message */}
          <div className="text-center">
            <p className="text-gray-300 text-lg mb-4">
              {getStatusMessage(user.verification_status, user.requires_medical)}
            </p>
          </div>

          {/* Verification Requirements */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <span>Verification Requirements</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">State-issued ID (front) - Uploaded</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">State-issued ID (back) - Uploaded</span>
              </div>
              {user.requires_medical && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Medical prescription - Uploaded</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300">Admin review - In progress</span>
              </div>
            </div>
          </div>

          {/* Age Information */}
          {user.age_verified && (
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-400/30">
              <h4 className="text-blue-400 font-semibold mb-2">Age Verification</h4>
              <p className="text-gray-300 text-sm">
                Age verified: {user.age_verified} years old
                {user.requires_medical && (
                  <span className="block mt-1 text-yellow-400">
                    Medical documentation required for users under 21
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">What happens next?</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <p>Our verification team reviews your documents (1-2 business days)</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                <p>You'll receive an email notification when verification is complete</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                <p>Upon approval, you'll have full access to StatusXSmoakland</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-2">
              Questions about your verification?
            </p>
            <a 
              href="mailto:support@statusxsmoakland.com" 
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              Contact Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationPending;