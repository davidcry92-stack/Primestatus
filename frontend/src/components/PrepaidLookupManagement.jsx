import React, { useState, useEffect } from 'react';
import { Search, CreditCard, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const PrepaidLookupManagement = () => {
  const [pickupCode, setPickupCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadAllOrders();
    loadStats();
  }, []);

  const loadAllOrders = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/prepaid-orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading prepaid orders:', error);
    }
  };

  const loadStats = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/prepaid-orders/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLookupCode = async () => {
    if (!pickupCode.trim()) {
      alert('Please enter a pickup code');
      return;
    }

    // Validate that it's a P code
    if (!pickupCode.toUpperCase().startsWith('P')) {
      alert('Pre-paid codes start with "P". For cash pickup codes starting with "C", use the Cash Pickup Lookup tab.');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/prepaid-orders/lookup/${pickupCode.toUpperCase()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
      } else if (response.status === 404) {
        setSearchResult(null);
        alert('Pre-paid pickup code not found. Make sure the code starts with "P" or check the Cash Pickup tab for "C" codes.');
      } else {
        throw new Error('Failed to lookup pickup code');
      }
    } catch (error) {
      console.error('Error looking up code:', error);
      alert('Error looking up pickup code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePickup = async () => {
    if (!searchResult || !staffName.trim()) {
      alert('Please enter your staff name');
      return;
    }

    if (searchResult.status === 'picked_up') {
      alert('This order has already been picked up');
      return;
    }

    setProcessing(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/prepaid-orders/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          pickup_code: pickupCode.toUpperCase(),
          completed_by: staffName
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Pre-paid Order Completed!\n\n📋 Order ID: ${data.order_id}\n💳 Payment: Already processed ($${data.amount_paid})\n👤 Completed by: ${staffName}\n\n📦 Order ready for customer pickup!`);
        
        // Reset form
        setPickupCode('');
        setSearchResult(null);
        setStaffName('');
        
        // Reload data
        loadAllOrders();
        loadStats();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error completing pickup:', error);
      alert('Error completing pickup. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Order Lookup</h2>
          <p className="text-gray-300 text-sm">Lookup customer orders by pickup code</p>
        </div>
        <button
          onClick={loadAllOrders}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">💳 Order Management System</h3>
        <div className="text-blue-300 text-sm space-y-1">
          <p>• All orders are pre-paid via credit/debit card (Square)</p>
          <p>• Payment already processed - verify code and complete pickup</p>
          <p>• Pickup codes start with "P" followed by 6 digits</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Total Pre-paid Orders</p>
                <p className="text-2xl font-bold text-white">{stats.total_orders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Awaiting Pickup</p>
                <p className="text-2xl font-bold text-white">{stats.pending_pickup}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Completed Pickups</p>
                <p className="text-2xl font-bold text-white">{stats.completed_pickups}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Pre-paid Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.total_revenue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Code Lookup */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Lookup Pre-paid Code</h3>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter pre-paid code (starts with P, e.g., P123456)"
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleLookupCode()}
            />
            <p className="text-xs text-gray-400 mt-1">💡 Tip: P-codes = Pre-paid, C-codes = Cash pickup (different tab)</p>
          </div>
          <button
            onClick={handleLookupCode}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Searching...' : 'Lookup'}
          </button>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-white">Pre-paid Order Details</h4>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                searchResult.status === 'picked_up' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {searchResult.status === 'picked_up' ? 'Already Picked Up' : 'Ready for Pickup'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-300"><strong>Pickup Code:</strong> {searchResult.pickup_code}</p>
                <p className="text-gray-300"><strong>Order ID:</strong> {searchResult.order_id}</p>
                <p className="text-gray-300"><strong>Customer:</strong> {searchResult.user_email}</p>
                <p className="text-gray-300"><strong>Total Amount:</strong> {formatCurrency(searchResult.total_amount)} <span className="text-green-400">(Already Paid)</span></p>
                <p className="text-gray-300"><strong>Payment Method:</strong> Credit/Debit Card (Square)</p>
                <p className="text-gray-300"><strong>Ordered:</strong> {formatDate(searchResult.created_at)}</p>
              </div>
              <div>
                {searchResult.pickup_completed_at && (
                  <>
                    <p className="text-gray-300"><strong>Picked Up:</strong> {formatDate(searchResult.pickup_completed_at)}</p>
                    <p className="text-gray-300"><strong>Completed By:</strong> {searchResult.completed_by}</p>
                  </>
                )}
                {searchResult.pickup_notes && (
                  <p className="text-gray-300"><strong>Notes:</strong> {searchResult.pickup_notes}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h5 className="text-white font-medium mb-2">Items to Give Customer:</h5>
              <div className="space-y-2">
                {searchResult.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-gray-300 text-sm bg-gray-600 p-2 rounded">
                    <span><strong>{item.name}</strong> x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Pickup Form */}
            {searchResult.status !== 'picked_up' && (
              <div className="border-t border-gray-600 pt-4">
                <h5 className="text-white font-medium mb-3">Complete Pickup (Payment Already Processed)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Staff Name
                    </label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCompletePickup}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {processing ? 'Completing...' : '✅ Mark as Picked Up'}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  💳 Payment already processed - just hand over items and mark as complete
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Pre-paid Orders */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Pre-paid Orders</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th className="px-6 py-3">Pickup Code</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Ordered</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.slice(0, 10).map((order, index) => (
                <tr key={index} className="bg-gray-800 border-b border-gray-700">
                  <td className="px-6 py-4 font-mono text-blue-400">{order.pickup_code}</td>
                  <td className="px-6 py-4">{order.user_email}</td>
                  <td className="px-6 py-4">{formatCurrency(order.total_amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'picked_up' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {order.status === 'picked_up' ? 'Picked Up' : 'Ready'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setPickupCode(order.pickup_code);
                        handleLookupCode();
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {allOrders.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No pre-paid orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrepaidLookupManagement;