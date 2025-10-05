import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, ShoppingBag, ArrowLeft, Camera, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const MemberProfile = ({ user, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ address: '', phone: '' });
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchProfile();
    fetchTokenInfo();
    fetchOrderHistory();
    fetchSuggestions();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${backendUrl}/api/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditForm({
          address: data.profile?.address || '',
          phone: data.profile?.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTokenInfo = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${backendUrl}/api/profile/tokens`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTokenInfo(data);
      }
    } catch (error) {
      console.error('Error fetching token info:', error);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${backendUrl}/api/profile/orders?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderHistory(data);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${backendUrl}/api/profile/suggestions?limit=6`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${backendUrl}/api/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        await fetchProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${backendUrl}/api/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        await fetchProfile();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'premium': return 'bg-yellow-500 text-black';
      case 'basic': return 'bg-gray-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button onClick={onBack} variant="ghost" className="text-white hover:bg-gray-800">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Member Profile</h1>
          </div>
          <div className="text-center py-8">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button onClick={onBack} variant="ghost" className="text-white hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Member Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <Card className="lg:col-span-2 bg-gray-900 border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Photo */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {profile.profile?.profile_photo_url ? (
                      <img 
                        src={`${backendUrl}${profile.profile.profile_photo_url}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700">
                    <Camera className="h-3 w-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{profile.full_name}</h3>
                  <Badge className={getTierColor(profile.membership_tier)}>
                    {profile.membership_tier?.toUpperCase()} MEMBER
                  </Badge>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                  <div className="text-gray-300">{profile.email}</div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date of Birth</span>
                  </Label>
                  <div className="text-gray-300">{profile.date_of_birth}</div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  ) : (
                    <div className="text-gray-300">{profile.profile?.phone || 'Not provided'}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Address</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Address"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  ) : (
                    <div className="text-gray-300">{profile.profile?.address || 'Not provided'}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="text-gray-300">{formatDate(profile.member_since)}</div>
              </div>

              <div className="space-y-2">
                <Label>Verification Status</Label>
                <Badge variant={profile.is_verified ? "default" : "secondary"}>
                  {profile.is_verified ? "Verified" : "Pending"}
                </Badge>
              </div>

              {isEditing && (
                <Button onClick={handleUpdateProfile} className="w-full">
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Token Balance Card */}
          <Card className="bg-gray-900 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span>Token Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tokenInfo && (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">{tokenInfo.tokens_balance}</div>
                    <div className="text-sm text-gray-400">Tokens Available</div>
                    <div className="text-sm text-green-400">${tokenInfo.tokens_balance} cash value</div>
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Purchases:</span>
                      <span>{tokenInfo.purchases_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Token In:</span>
                      <span>{tokenInfo.purchases_to_next_token} purchases</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded text-xs text-gray-300">
                    <div className="font-semibold mb-1">Token System:</div>
                    <div>• 12 purchases = 10 tokens</div>
                    <div>• 10 tokens = $10 cash value</div>
                    <div>• Valid for in-app purchases only</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <Card className="mt-6 bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5" />
              <span>Recent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderHistory.length > 0 ? (
              <div className="space-y-4">
                {orderHistory.map((order, index) => (
                  <div key={order.id || index} className="border border-gray-600 rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">Order #{order.payment_code}</div>
                        <div className="text-sm text-gray-400">{formatDate(order.created_at)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${order.total_amount}</div>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="text-sm text-gray-300">
                        {order.items.length} item(s) - {order.items.map(item => item.product_name || item.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                No orders found. Start shopping to see your order history!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Card className="mt-6 bg-gray-900 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Suggested For You</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((product) => (
                  <div key={product.id} className="border border-gray-600 rounded p-4 hover:border-gray-500 transition-colors">
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <div className="font-semibold text-sm">{product.name}</div>
                    <div className="text-xs text-gray-400 mb-1">{product.brand}</div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-400">${product.price}</span>
                      <Badge variant="outline" className="text-xs">
                        {product.tier?.toUpperCase()}
                      </Badge>
                    </div>
                    {product.rating > 0 && (
                      <div className="text-xs text-yellow-400 mt-1">
                        ★ {product.rating} ({product.reviews} reviews)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;