import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const DailyDealsManagement = () => {
  const [activeDeals, setActiveDeals] = useState([]);
  const [newDeal, setNewDeal] = useState({
    category: 'lows',
    title: '',
    message: '',
    video: null,
    deals: [],
    expires_at: ''
  });
  const [newStructuredDeal, setNewStructuredDeal] = useState({
    product_name: '',
    discount_percentage: '',
    original_price: '',
    deal_description: ''
  });
  const [dealMode, setDealMode] = useState('text'); // 'text' or 'structured'
  const [videoPreview, setVideoPreview] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { apiCall } = useContext(AuthContext);

  const categories = [
    { id: 'lows', name: 'Lows (Affordable)', icon: '💰' },
    { id: 'deps', name: 'Deps (Regular)', icon: '🌿' },
    { id: 'za', name: 'Za (Premium)', icon: '⭐' },
    { id: 'edibles', name: 'Edibles', icon: '🍪' },
    { id: 'vapes', name: 'Vapes', icon: '💨' },
    { id: 'pre-rolls', name: 'Pre-rolls', icon: '🚬' },
    { id: 'concentrates', name: 'Concentrates', icon: '🫧' },
    { id: 'suppositories', name: 'Wellness', icon: '💊' }
  ];

  useEffect(() => {
    loadActiveDeals();
    loadInventory();
  }, []);

  const loadActiveDeals = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall('/api/admin/daily-deals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setActiveDeals(data.deals || []);
      }
    } catch (error) {
      console.error('Failed to load active deals:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall('/api/admin/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data.products || []);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file
      if (file.type !== 'video/mp4') {
        alert('Please upload MP4 files only');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Video file must be less than 10MB');
        return;
      }

      // Create video element to check duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        if (video.duration > 30) {
          alert('Video must be 30 seconds or less');
          return;
        }
        
        setNewDeal({ ...newDeal, video: file });
        setVideoPreview(URL.createObjectURL(file));
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const addStructuredDeal = () => {
    if (newStructuredDeal.product_name && newStructuredDeal.discount_percentage) {
      const deal = {
        type: 'structured',
        product_name: newStructuredDeal.product_name,
        discount_percentage: parseInt(newStructuredDeal.discount_percentage),
        original_price: parseFloat(newStructuredDeal.original_price) || 0,
        deal_description: newStructuredDeal.deal_description,
        id: Date.now()
      };

      setNewDeal({
        ...newDeal,
        deals: [...newDeal.deals, deal]
      });

      setNewStructuredDeal({
        product_name: '',
        discount_percentage: '',
        original_price: '',
        deal_description: ''
      });
    }
  };

  const removeStructuredDeal = (dealId) => {
    setNewDeal({
      ...newDeal,
      deals: newDeal.deals.filter(deal => deal.id !== dealId)
    });
  };

  const createDailyDeal = async () => {
    if (!newDeal.title || !newDeal.message) {
      alert('Please fill in title and message');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      
      // Set expiry to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      formData.append('category', newDeal.category);
      formData.append('title', newDeal.title);
      formData.append('message', newDeal.message);
      formData.append('expires_at', expiresAt.toISOString());
      formData.append('deals', JSON.stringify(newDeal.deals));
      
      if (newDeal.video) {
        formData.append('video', newDeal.video);
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/daily-deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Daily deal created successfully!');
        setNewDeal({
          category: 'lows',
          title: '',
          message: '',
          video: null,
          deals: [],
          expires_at: ''
        });
        setVideoPreview(null);
        loadActiveDeals();
      } else {
        const error = await response.json();
        alert(`Failed to create deal: ${error.detail}`);
      }
    } catch (error) {
      console.error('Failed to create deal:', error);
      alert('Failed to create deal');
    } finally {
      setLoading(false);
    }
  };

  const deleteDeal = async (dealId) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall(`/api/admin/daily-deals/${dealId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadActiveDeals();
      } else {
        alert('Failed to delete deal');
      }
    } catch (error) {
      console.error('Failed to delete deal:', error);
      alert('Failed to delete deal');
    }
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '📱';
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Daily Deals Management</h2>
        <div className="text-sm text-gray-400">
          📱 Create engaging daily messages with video content for your members
        </div>
      </div>

      {/* Create New Deal Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Create New Daily Deal</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Deal Creation */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={newDeal.category}
                onChange={(e) => setNewDeal({ ...newDeal, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Deal Title</label>
              <input
                type="text"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                placeholder="e.g., Today's Za Special!"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea
                value={newDeal.message}
                onChange={(e) => setNewDeal({ ...newDeal, message: e.target.value })}
                placeholder="Type your daily message here..."
                rows="4"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Video Upload (Optional)</label>
              <input
                type="file"
                accept="video/mp4"
                onChange={handleVideoUpload}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-emerald-600 file:text-white file:cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">
                MP4 files only, max 30 seconds, under 10MB
              </div>
              {videoPreview && (
                <div className="mt-2">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-w-xs rounded-md"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Deal Structure */}
          <div className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setDealMode('text')}
                className={`px-4 py-2 rounded-md text-sm ${
                  dealMode === 'text' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                📝 Free Text
              </button>
              <button
                onClick={() => setDealMode('structured')}
                className={`px-4 py-2 rounded-md text-sm ${
                  dealMode === 'structured' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                🛍️ Structured Deals
              </button>
            </div>

            {dealMode === 'text' && (
              <div className="bg-gray-800 rounded-md p-4">
                <h4 className="text-sm font-medium text-emerald-400 mb-2">Free Text Mode</h4>
                <p className="text-xs text-gray-400">
                  Type your deals directly in the message above. Example: "Za OG Kush 20% off today!"
                </p>
              </div>
            )}

            {dealMode === 'structured' && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-emerald-400">Add Structured Deal</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newStructuredDeal.product_name}
                    onChange={(e) => setNewStructuredDeal({ ...newStructuredDeal, product_name: e.target.value })}
                    placeholder="Product Name"
                    className="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm"
                  />
                  <input
                    type="number"
                    value={newStructuredDeal.discount_percentage}
                    onChange={(e) => setNewStructuredDeal({ ...newStructuredDeal, discount_percentage: e.target.value })}
                    placeholder="Discount %"
                    className="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm"
                  />
                </div>

                <input
                  type="number"
                  step="0.01"
                  value={newStructuredDeal.original_price}
                  onChange={(e) => setNewStructuredDeal({ ...newStructuredDeal, original_price: e.target.value })}
                  placeholder="Original Price ($)"
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm"
                />

                <input
                  type="text"
                  value={newStructuredDeal.deal_description}
                  onChange={(e) => setNewStructuredDeal({ ...newStructuredDeal, deal_description: e.target.value })}
                  placeholder="Deal Description (optional)"
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm"
                />

                <button
                  onClick={addStructuredDeal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
                >
                  Add Deal
                </button>

                {/* Display added structured deals */}
                {newDeal.deals.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-400">Added Deals:</h5>
                    {newDeal.deals.map(deal => (
                      <div key={deal.id} className="bg-gray-700 rounded-md p-3 flex justify-between items-center">
                        <div>
                          <div className="text-sm text-white">{deal.product_name}</div>
                          <div className="text-xs text-emerald-400">{deal.discount_percentage}% off</div>
                          {deal.original_price > 0 && (
                            <div className="text-xs text-gray-400">${deal.original_price}</div>
                          )}
                        </div>
                        <button
                          onClick={() => removeStructuredDeal(deal.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={createDailyDeal}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md font-medium"
          >
            {loading ? 'Creating...' : 'Create Daily Deal (24hr expiry)'}
          </button>
        </div>
      </div>

      {/* Active Deals Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Active Daily Deals</h3>
        
        {activeDeals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📱</div>
            <p className="text-gray-400">No active deals. Create your first daily deal above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeDeals.map(deal => (
              <div key={deal.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(deal.category)}</span>
                    <div>
                      <h4 className="text-white font-medium">{deal.title}</h4>
                      <p className="text-xs text-gray-400 capitalize">{deal.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDeal(deal.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-gray-300 text-sm mb-3">{deal.message}</p>

                {deal.video_url && (
                  <div className="mb-3">
                    <video
                      src={deal.video_url}
                      controls
                      className="w-full rounded-md"
                      style={{ maxHeight: '150px' }}
                    />
                  </div>
                )}

                {deal.structured_deals && deal.structured_deals.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-emerald-400 mb-1">Structured Deals:</h5>
                    {deal.structured_deals.map((structDeal, index) => (
                      <div key={index} className="text-xs text-gray-300">
                        • {structDeal.product_name} - {structDeal.discount_percentage}% off
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">
                    Created: {new Date(deal.created_at).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    new Date(deal.expires_at) > new Date()
                      ? 'bg-green-900 text-green-300'
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {formatTimeRemaining(deal.expires_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyDealsManagement;