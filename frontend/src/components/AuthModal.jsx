import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { X, Mail, Lock, User, Crown, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { nycNeighborhoods } from '../data/mock';

const AuthModal = ({ onClose }) => {
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    membership_tier: 'basic',
    preferences: {
      delivery_area: 'Manhattan',
      categories: [],
      price_range: [20, 100]
    }
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(loginForm);
    if (result.success) {
      onClose();
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await register(registerForm);
    if (result.success) {
      onClose();
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className=\"sm:max-w-md bg-gradient-to-br from-gray-900 to-black border-green-400/30\">
        <DialogHeader>
          <DialogTitle className=\"text-white text-center flex items-center justify-center space-x-2\">
            <span className=\"text-green-400\">Status</span>
            <span className=\"text-yellow-400\">X</span>
            <span className=\"text-green-400\">Smoakland</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue=\"login\" className=\"w-full\">
          <TabsList className=\"grid w-full grid-cols-2 bg-black/50\">
            <TabsTrigger value=\"login\" className=\"data-[state=active]:bg-green-600 data-[state=active]:text-white\">
              Sign In
            </TabsTrigger>
            <TabsTrigger value=\"register\" className=\"data-[state=active]:bg-green-600 data-[state=active]:text-white\">
              Join Now
            </TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value=\"login\">
            <Card className=\"bg-transparent border-none\">
              <CardContent className=\"space-y-4 pt-4\">
                <form onSubmit={handleLogin} className=\"space-y-4\">
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"login-email\" className=\"text-white\">Email</Label>
                    <div className=\"relative\">
                      <Mail className=\"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400\" />
                      <Input
                        id=\"login-email\"
                        type=\"email\"
                        placeholder=\"Enter your email\"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className=\"pl-10 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-400\"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"login-password\" className=\"text-white\">Password</Label>
                    <div className=\"relative\">
                      <Lock className=\"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400\" />
                      <Input
                        id=\"login-password\"
                        type=\"password\"
                        placeholder=\"Enter your password\"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className=\"pl-10 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-400\"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type=\"submit\" 
                    disabled={loading}
                    className=\"w-full bg-green-600 hover:bg-green-700 text-white\"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Register Tab */}
          <TabsContent value=\"register\">
            <Card className=\"bg-transparent border-none\">
              <CardContent className=\"space-y-4 pt-4\">
                <form onSubmit={handleRegister} className=\"space-y-4\">
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"register-username\" className=\"text-white\">Username</Label>
                    <div className=\"relative\">
                      <User className=\"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400\" />
                      <Input
                        id=\"register-username\"
                        type=\"text\"
                        placeholder=\"Choose a username\"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        className=\"pl-10 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-400\"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"register-email\" className=\"text-white\">Email</Label>
                    <div className=\"relative\">
                      <Mail className=\"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400\" />
                      <Input
                        id=\"register-email\"
                        type=\"email\"
                        placeholder=\"Enter your email\"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className=\"pl-10 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-400\"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"register-password\" className=\"text-white\">Password</Label>
                    <div className=\"relative\">
                      <Lock className=\"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400\" />
                      <Input
                        id=\"register-password\"
                        type=\"password\"
                        placeholder=\"Create a password (min 8 chars)\"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className=\"pl-10 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-400\"
                        minLength={8}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Membership Tier */}
                  <div className=\"space-y-3\">
                    <Label className=\"text-white\">Membership Tier</Label>
                    <div className=\"grid grid-cols-1 gap-3\">
                      <div 
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          registerForm.membership_tier === 'basic'
                            ? 'border-green-400 bg-green-900/30'
                            : 'border-gray-600 bg-black/30'
                        }`}
                        onClick={() => setRegisterForm({ ...registerForm, membership_tier: 'basic' })}
                      >
                        <div className=\"flex items-center justify-between\">
                          <div>
                            <h4 className=\"text-white font-semibold\">Basic Membership</h4>
                            <p className=\"text-green-400 font-bold\">$4.99/month</p>
                          </div>
                          <div className=\"w-4 h-4 rounded-full border-2 border-green-400\">
                            {registerForm.membership_tier === 'basic' && (
                              <div className=\"w-full h-full bg-green-400 rounded-full\" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          registerForm.membership_tier === 'premium'
                            ? 'border-yellow-400 bg-yellow-900/30'
                            : 'border-gray-600 bg-black/30'
                        }`}
                        onClick={() => setRegisterForm({ ...registerForm, membership_tier: 'premium' })}
                      >
                        <div className=\"flex items-center justify-between\">
                          <div className=\"flex items-center space-x-2\">
                            <div>
                              <div className=\"flex items-center space-x-2\">
                                <h4 className=\"text-white font-semibold\">Premium + Wictionary</h4>
                                <Crown className=\"h-4 w-4 text-yellow-400\" />
                              </div>
                              <p className=\"text-yellow-400 font-bold\">$7.99/month</p>
                            </div>
                          </div>
                          <div className=\"w-4 h-4 rounded-full border-2 border-yellow-400\">
                            {registerForm.membership_tier === 'premium' && (
                              <div className=\"w-full h-full bg-yellow-400 rounded-full\" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delivery Area */}
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"delivery-area\" className=\"text-white flex items-center space-x-1\">
                      <MapPin className=\"h-4 w-4\" />
                      <span>Delivery Area</span>
                    </Label>
                    <select
                      id=\"delivery-area\"
                      value={registerForm.preferences.delivery_area}
                      onChange={(e) => setRegisterForm({
                        ...registerForm,
                        preferences: {
                          ...registerForm.preferences,
                          delivery_area: e.target.value
                        }
                      })}
                      className=\"w-full bg-black/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-green-400 focus:outline-none\"
                    >
                      {nycNeighborhoods.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Button 
                    type=\"submit\" 
                    disabled={loading}
                    className=\"w-full bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white font-bold\"
                  >
                    {loading ? 'Creating account...' : 'Join StatusXSmoakland'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className=\"text-center pt-4 border-t border-gray-700\">
          <p className=\"text-gray-400 text-xs\">
            By joining, you confirm you are 21+ and not affiliated with law enforcement.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;"