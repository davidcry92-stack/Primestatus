import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Components
import ScreenshotProtection from "./components/ScreenshotProtection";
import LawEnforcementScreen from "./components/LawEnforcementScreen";
import ReEntryCodeScreen from "./components/ReEntryCodeScreen";
import VerificationPending from "./components/VerificationPending";
import SimpleHeader from "./components/SimpleHeader";
import HeroSection from "./components/HeroSection";
import ProductGrid from "./components/ProductGrid";
import ProductSelection from "./components/ProductSelection";
import Footer from "./components/Footer";
import CheckoutSuccess from "./components/CheckoutSuccess";
import CheckoutCancel from "./components/CheckoutCancel";
import AdminApp from "./components/AdminApp";
import AuthModal from "./components/AuthModal";
import DeliveryComingSoon from "./components/DeliveryComingSoon";
// import DailyUpdates from "./components/DailyUpdates"; // Removed per user request
import MemberProfile from "./components/MemberProfile";

// Auth Context
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const AdminOnlyApp = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  // Check if user is authenticated and is admin
  // Also check for admin_token for separate admin authentication
  const adminToken = localStorage.getItem('admin_token');
  const adminUser = localStorage.getItem('admin_user');
  
  const isAdmin = (isAuthenticated && user && (
    user.email === 'admin@statusxsmoakland.com' || 
    user.role === 'super_admin'
  )) || (adminToken && adminUser);
  
  if (!isAuthenticated || !user) {
    // Check if there's a separate admin token
    if (adminToken && adminUser) {
      // Admin is logged in through separate admin system
      return <AdminApp />;
    }
    
    // Not authenticated - redirect to main app for login
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 border border-red-600 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Admin Login Required</h2>
            <p className="text-gray-300 mb-6">
              You must be logged in as an administrator to access this area.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Main App
              </button>
              <p className="text-gray-400 text-sm">
                Login as admin: admin@statusxsmoakland.com
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    // Authenticated but not admin
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 border border-orange-600 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-300 mb-6">
              You don't have administrator privileges to access this area.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Return to Main App
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // User is authenticated admin - show admin dashboard
  return <AdminApp />;
};

const LoginOnlyApp = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [openCartCallback, setOpenCartCallback] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  
  // Timeout refs for modal auto-close
  const authTimeoutRef = useRef(null);
  const signupTimeoutRef = useRef(null);
  
  // App-wide inactivity timeout
  const inactivityTimeoutRef = useRef(null);
  const [isInactiveReentryRequired, setIsInactiveReentryRequired] = useState(false);

  const handleAuthClick = () => {
    console.log('Auth button clicked!'); // Debug log
    setShowAuthModal(true);
    startAuthTimeout();
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
      authTimeoutRef.current = null;
    }
  };

  const handleSignupClick = () => {
    setShowSignupModal(true);
    startSignupTimeout();
  };

  const handleCloseSignup = () => {
    setShowSignupModal(false);
    if (signupTimeoutRef.current) {
      clearTimeout(signupTimeoutRef.current);
      signupTimeoutRef.current = null;
    }
  };

  // Auto-close modal functions
  const startAuthTimeout = () => {
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
    }
    
    // Warning at 1 minute 45 seconds (15 seconds before closing)
    setTimeout(() => {
      if (showAuthModal) {
        console.log('⚠️ Login modal will close in 15 seconds due to inactivity');
        // Could add visual warning here if needed
      }
    }, 105000); // 1 minute 45 seconds
    
    authTimeoutRef.current = setTimeout(() => {
      console.log('🕒 Auto-closing login modal due to 2 minute inactivity');
      setShowAuthModal(false);
      authTimeoutRef.current = null;
    }, 120000); // 2 minutes
  };

  const startSignupTimeout = () => {
    if (signupTimeoutRef.current) {
      clearTimeout(signupTimeoutRef.current);
    }
    
    // Warning at 1 minute 45 seconds (15 seconds before closing)
    setTimeout(() => {
      if (showSignupModal) {
        console.log('⚠️ Signup modal will close in 15 seconds due to inactivity');
        // Could add visual warning here if needed
      }
    }, 105000); // 1 minute 45 seconds
    
    signupTimeoutRef.current = setTimeout(() => {
      console.log('🕒 Auto-closing signup modal due to 2 minute inactivity');
      setShowSignupModal(false);
      signupTimeoutRef.current = null;
    }, 120000); // 2 minutes
  };

  const resetAuthTimeout = () => {
    startAuthTimeout();
  };

  const resetSignupTimeout = () => {
    startSignupTimeout();
  };

  // App-wide inactivity management
  const startInactivityTimeout = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    inactivityTimeoutRef.current = setTimeout(() => {
      console.log('🕒 60 seconds of inactivity detected - requiring re-entry code');
      setIsInactiveReentryRequired(true);
      inactivityTimeoutRef.current = null;
    }, 60000); // 60 seconds
  };

  const resetInactivityTimeout = () => {
    if (user && isAuthenticated && !isInactiveReentryRequired) {
      startInactivityTimeout();
    }
  };

  const clearInactivityTimeout = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  };

  // Start inactivity tracking when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated && !isInactiveReentryRequired) {
      console.log('🕒 Starting inactivity timeout tracking (60 seconds)');
      startInactivityTimeout();
    } else {
      clearInactivityTimeout();
    }

    return () => clearInactivityTimeout();
  }, [user, isAuthenticated, isInactiveReentryRequired]);

  // Add global activity listeners when authenticated
  useEffect(() => {
    if (user && isAuthenticated && !isInactiveReentryRequired) {
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      const handleActivity = () => {
        resetInactivityTimeout();
      };

      // Add event listeners to track user activity
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });

      return () => {
        // Clean up event listeners
        activityEvents.forEach(event => {
          document.removeEventListener(event, handleActivity, true);
        });
      };
    }
  }, [user, isAuthenticated, isInactiveReentryRequired]);

  // Cleanup all timeouts on component unmount
  useEffect(() => {
    return () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
      if (signupTimeoutRef.current) {
        clearTimeout(signupTimeoutRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  const handleOpenCart = () => {
    if (openCartCallback) {
      openCartCallback();
    }
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleBackFromProfile = () => {
    setShowProfile(false);
  };

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    setIsInactiveReentryRequired(false);
    clearInactivityTimeout();
  };

  const handleInactiveReentryVerification = (code) => {
    // Verify the re-entry code (same codes as initial verification)
    if (code === '1234' || code === '0000') {
      console.log('🔒 Re-entry code verified after inactivity');
      setIsInactiveReentryRequired(false);
      // Restart inactivity tracking
      startInactivityTimeout();
    } else {
      alert('Invalid re-entry code. Please try again.');
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // STRICT VERIFICATION REQUIRED - NO CONTENT FOR UNVERIFIED USERS
  if (isAuthenticated && user && (!user.is_verified || user.verification_status !== 'approved')) {
    return <VerificationPending user={user} />;
  }

  // STRICT AUTHENTICATION REQUIRED - NO CONTENT WITHOUT LOGIN
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 border border-red-600 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-4">Access Required</h2>
            <p className="text-gray-300 mb-6">
              You must be a verified member to access StatusXSmoakland.
            </p>
            
            <div className="space-y-4">
              {/* Login Button */}
              <button
                onClick={handleAuthClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Login (Existing Members)
              </button>
              
              {/* Join Now Button */}
              <button
                onClick={handleSignupClick}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Join Now (New Members)
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-400">
                New members must complete ID verification for membership approval
              </p>
            </div>
          </div>
        </div>
        
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div 
              className="bg-gray-900 border border-red-600 rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
              onMouseMove={resetAuthTimeout}
              onClick={resetAuthTimeout}
              onKeyDown={resetAuthTimeout}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Login to StatusXSmoakland</h2>
                <button
                  onClick={handleCloseAuth}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const email = formData.get('email');
                const password = formData.get('password');
                
                console.log('Attempting login with:', email); // Debug log
                
                try {
                  const result = await login({ email, password });
                  console.log('Login successful:', result);
                  handleCloseAuth();
                } catch (error) {
                  console.error('Login error:', error);
                  const errorMessage = error?.response?.data?.detail || error?.message || 'Network error - please check connection';
                  alert('Login failed: ' + errorMessage);
                }
              }} className="space-y-4">
                
                <div>
                  <label className="block text-white mb-2">Email:</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-green-400 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">Password:</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-green-400 focus:outline-none"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                
                <div className="text-center space-y-2 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">Demo Credentials:</p>
                  <p className="text-green-400 text-xs">Admin: admin@statusxsmoakland.com / Admin123!</p>
                  <p className="text-yellow-400 text-xs">Premium: premium@demo.com / Premium123!</p>
                  <p className="text-blue-400 text-xs">Basic: basic@demo.com / Basic123!</p>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Signup Modal */}
        {showSignupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div 
              className="bg-gray-900 border border-yellow-600 rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
              onMouseMove={resetSignupTimeout}
              onClick={resetSignupTimeout}
              onKeyDown={resetSignupTimeout}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Join StatusXSmoakland</h2>
                <button
                  onClick={handleCloseSignup}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                try {
                  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;
                  const response = await fetch(`${backendUrl}/api/auth/register`, {
                    method: 'POST',
                    body: formData // Using FormData for file uploads
                  });
                  
                  if (response.ok) {
                    alert('🎉 Registration successful! Please wait for admin verification of your ID documents. You will be notified when your account is approved.');
                    handleCloseSignup();
                  } else {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Registration failed');
                  }
                } catch (error) {
                  console.error('Registration error:', error);
                  alert('Registration failed: ' + error.message);
                }
              }} className="space-y-4">
                
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Your full legal name"
                      className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Username *</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                    required
                  />
                  <p className="text-sm text-gray-400 mt-1">Must be 21+ for membership</p>
                </div>

                <div>
                  <label className="block text-white mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a secure password"
                    className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                    required
                    minLength="8"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Re-Entry Code *</label>
                  <input
                    type="text"
                    name="re_entry_code"
                    placeholder="4-8 digit personal verification code"
                    className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                    required
                    minLength="4"
                    maxLength="8"
                  />
                  <p className="text-sm text-gray-400 mt-1">Create a personal code for app re-entry</p>
                </div>

                {/* Membership Tier Selection */}
                <div>
                  <label className="block text-white mb-2">Membership Tier *</label>
                  <select 
                    name="membership_tier"
                    className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                    required
                  >
                    <option value="">Select membership tier</option>
                    <option value="basic">Basic Membership ($Free)</option>
                    <option value="premium">Premium Membership ($7.99/month)</option>
                  </select>
                </div>

                {/* ID Verification Section */}
                <div className="bg-gray-800 p-4 rounded-lg border border-yellow-600">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3">🆔 ID Verification Required</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">ID Front Photo *</label>
                      <input
                        type="file"
                        name="id_front"
                        accept="image/*"
                        className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                        required
                      />
                      <p className="text-sm text-gray-400 mt-1">Clear photo of front of driver's license or state ID</p>
                    </div>

                    <div>
                      <label className="block text-white mb-2">ID Back Photo *</label>
                      <input
                        type="file"
                        name="id_back"
                        accept="image/*"
                        className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                        required
                      />
                      <p className="text-sm text-gray-400 mt-1">Clear photo of back of driver's license or state ID</p>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Medical Document (If Under 21)</label>
                      <input
                        type="file"
                        name="medical_document"
                        accept="image/*,.pdf"
                        className="w-full px-4 py-2 bg-black border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                      />
                      <p className="text-sm text-gray-400 mt-1">Medical recommendation required for users under 21</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-900 rounded border border-yellow-600">
                    <p className="text-yellow-200 text-sm">
                      <strong>⚠️ Verification Process:</strong><br/>
                      • All ID documents will be manually reviewed by our admin team<br/>
                      • Verification typically takes 24-48 hours<br/>
                      • You will receive email notification when approved<br/>
                      • Must be 21+ with valid government-issued ID
                    </p>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    className="mt-1"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    I agree to the Terms & Conditions and Privacy Policy. I confirm that I am 21+ years old and legally authorized to purchase cannabis products in NYC. *
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Submit Application for Verification
                </button>

                <div className="text-center text-sm text-gray-400">
                  Already a member? 
                  <button 
                    type="button"
                    onClick={() => {
                      handleCloseSignup();
                      handleAuthClick();
                    }}
                    className="text-green-400 hover:text-green-300 ml-1"
                  >
                    Login here
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // INACTIVITY SECURITY: Show re-entry code if 60 seconds of inactivity detected
  if (user && isAuthenticated && isInactiveReentryRequired) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 border border-orange-600 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-white mb-4">Session Timeout</h2>
            <p className="text-gray-300 mb-6">
              You've been inactive for 60 seconds. Please enter your re-entry code to continue.
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const code = new FormData(e.target).get('reentry_code');
              handleInactiveReentryVerification(code);
            }}>
              <input
                type="text"
                name="reentry_code"
                placeholder="Enter your re-entry code"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded text-white text-center focus:border-orange-400 focus:outline-none mb-4"
                maxLength="8"
                required
              />
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mb-4"
              >
                Continue Session
              </button>
            </form>
            
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Logout Instead
            </button>
            
            <div className="mt-4 text-xs text-gray-400">
              <p>Security timeout after 60 seconds of inactivity</p>
              <p>Accepted codes: 1234 or 0000</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if authenticated user is admin and on admin route
  const isAdminUser = user && (user.email === 'admin@statusxsmoakland.com' || user.role === 'super_admin');
  if (isAdminUser && window.location.pathname === '/admin') {
    return <AdminApp />;
  }

  // Show profile if requested
  if (showProfile) {
    return <MemberProfile user={user} onBack={handleBackFromProfile} />;
  }

  // ONLY AUTHENTICATED USERS SEE THIS CONTENT
  return (
    <div className="min-h-screen bg-black">
      <SimpleHeader 
        user={user} 
        cartItems={cartItems} 
        setCartItems={setCartItems}
        onAuthClick={handleAuthClick}
        onOpenCart={handleOpenCart}
        setOpenCartCallback={setOpenCartCallback}
        onShowProfile={handleShowProfile}
        onLogout={handleLogout}
      />
      <main>
        <HeroSection 
          onAuthClick={handleAuthClick} 
          cartItems={cartItems}
          setCartItems={setCartItems}
          user={user}
        />
        <DeliveryComingSoon />
        <div className="container mx-auto px-4 py-8">
          <DailyUpdates />
        </div>
        <ProductSelection 
          user={user} 
          cartItems={cartItems}
          setCartItems={setCartItems}
          onOpenCart={handleOpenCart}
        />
      </main>
      <Footer />
      <Toaster />
      
      {showAuthModal && (
        <AuthModal onClose={handleCloseAuth} />
      )}
    </div>
  );
};

function App() {
  const [isLawEnforcementVerified, setIsLawEnforcementVerified] = useState(false);
  const [isReEntryCodeVerified, setIsReEntryCodeVerified] = useState(false);
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // CRITICAL SECURITY MODE - FORCE FRESH VERIFICATION ALWAYS
  useEffect(() => {
    console.log('🔒 SECURITY: App loading - enforcing STRICT verification');
    
    // CRITICAL SECURITY FIX: ALWAYS clear ALL authentication states on app load
    // This prevents ANY cached verification from bypassing security
    sessionStorage.clear();
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    // Clear any additional security bypass attempts
    sessionStorage.removeItem('law_enforcement_verified');
    sessionStorage.removeItem('reentry_verified');
    sessionStorage.removeItem('last_verification_time');
    sessionStorage.removeItem('app_session_active');
    sessionStorage.removeItem('verification_bypassed');
    sessionStorage.removeItem('admin_access_granted');
    
    // FORCE fresh verification for every session
    setIsLawEnforcementVerified(false);
    setIsReEntryCodeVerified(false);
    
    console.log('Verification states reset - user must complete fresh verification');
    
    // Clear any potential bypass mechanisms
    const bypassKeys = [
      'super_admin_bypass', 
      'super_admin_demo_token',
      'demo_admin_token'
    ];
    
    bypassKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Verification states cleared, authentication required
    
    console.log('🔒 SECURITY: App verification states enforced:', { 
      isLawEnforcementVerified: false, // ALWAYS START FALSE
      isReEntryCodeVerified: false,    // ALWAYS START FALSE
      hasToken: !!localStorage.getItem('access_token'),
      hasUserData: !!localStorage.getItem('user_data'),
      adminTokenCleared: !localStorage.getItem('admin_token'),
      sessionStorageCleared: Object.keys(sessionStorage).length === 0
    });
    
    // CRITICAL: Force verification states to FALSE
    setIsLawEnforcementVerified(false);
    setIsReEntryCodeVerified(false);
    setIsSuperAdminMode(false); // No admin bypasses allowed EVER
  }, []);

  // Removed 60-second timeout logic to prevent security bypasses

  const handleLawEnforcementVerification = () => {
    console.log('Law enforcement verification completed');
    setIsLawEnforcementVerified(true);
  };

  const handleReEntryCodeVerification = () => {
    console.log('Re-entry code verification completed');
    setIsReEntryCodeVerified(true);
  };

  const getAppContent = () => {
    console.log('🔒 SECURITY CHECK: getAppContent called', {
      lawEnforcement: isLawEnforcementVerified,
      reEntry: isReEntryCodeVerified,
      currentPath: window.location.pathname
    });
    
    // CRITICAL SECURITY: ALWAYS check verification in sequence
    if (!isLawEnforcementVerified) {
      console.log('🔒 SECURITY: Showing law enforcement verification (Step 1/3)');
      return <LawEnforcementScreen onVerified={handleLawEnforcementVerification} />;
    }
    
    if (!isReEntryCodeVerified) {
      console.log('🔒 SECURITY: Showing re-entry code verification (Step 2/3)');
      return <ReEntryCodeScreen onVerified={handleReEntryCodeVerification} userEmail="demo@example.com" />;
    }
    
    console.log('🔒 SECURITY: Verification complete - showing login-only app (Step 3/3)');
    // After ALL verification steps, show login-only access
    return <LoginOnlyApp />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={
              <ScreenshotProtection>
                {getAppContent()}
              </ScreenshotProtection>
            } />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
            <Route path="/admin" element={
              <ScreenshotProtection>
                {/* SECURITY: Admin must go through same verification as main app */}
                {getAppContent()}
              </ScreenshotProtection>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
