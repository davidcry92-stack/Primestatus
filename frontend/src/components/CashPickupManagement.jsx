import React, { useState, useEffect } from 'react';
import { Search, Package, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const CashPickupManagement = () => {
  const [pickupCode, setPickupCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [allPickups, setAllPickups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [staffName, setStaffName] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadAllPickups();
    loadStats();
  }, []);

  const loadAllPickups = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/cash-pickups`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllPickups(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading pickups:', error);
    }
  };

  const loadStats = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/cash-pickups/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
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

    // Validate that it's a C code
    if (!pickupCode.toUpperCase().startsWith('C')) {
      alert('Cash pickup codes start with "C". For pre-paid codes starting with "P", use the Pre-paid Lookup Verification tab.');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/cash-pickups/lookup/${pickupCode.toUpperCase()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
        setCashAmount(data.total_amount.toString());
      } else if (response.status === 404) {
        setSearchResult(null);
        alert('Cash pickup code not found. Make sure the code starts with "C" or check the Pre-paid Lookup tab for "P" codes.');
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

  const handleProcessPayment = async () => {
    if (!searchResult || !cashAmount || !staffName.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(cashAmount) !== searchResult.total_amount) {
      const confirm = window.confirm(
        `Order total is $${searchResult.total_amount} but you entered $${cashAmount}. Are you sure this is correct?`
      );
      if (!confirm) return;
    }

    setProcessing(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/cash-pickups/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          pickup_code: pickupCode,
          cash_received: parseFloat(cashAmount),
          processed_by: staffName
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Payment processed successfully!\n\nOrder ID: ${data.order_id}\nAmount: $${data.amount_paid}`);
        
        // Reset form
        setPickupCode('');
        setSearchResult(null);
        setCashAmount('');
        setStaffName('');
        
        // Reload data
        loadAllPickups();
        loadStats();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
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
          <h2 className="text-2xl font-bold text-white">Cash Pickup Lookup</h2>
          <p className="text-gray-300 text-sm">For pickup codes starting with "C" (Cash pickup orders)</p>
        </div>
        <button
          onClick={loadAllPickups}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Cash Pickup System Info Banner - Matching Pre-paid Design */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="bg-orange-600 text-white rounded-full p-2">
              💵
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-3">
              <h4 className="text-orange-400 font-medium mb-2">💵 Cash Pickup System</h4>
              <div className="text-orange-200 space-y-1 text-sm">
                <p>• <strong>C-codes:</strong> Cash pickup orders (customer pays at pickup)</p>
                <p>• <strong>P-codes:</strong> Pre-paid orders (use Pre-paid Lookup Verification tab)</p>
                <p>• Verify code and complete transaction at pickup</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Total Orders</p>
                <p className="text-2xl font-bold text-white">{stats.total_orders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending_orders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completed_orders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Cash Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.total_cash_revenue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Code Lookup */}

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Lookup Cash Pickup Code</h3>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter cash pickup code (starts with C, e.g., C123456)"
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleLookupCode()}
            />
            <p className="text-xs text-gray-400 mt-1">💡 Tip: C-codes = Cash pickup, P-codes = Pre-paid (different tab)</p>
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
              <h4 className="text-lg font-semibold text-white">Order Details</h4>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                searchResult.status === 'completed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-yellow-600 text-white'
              }`}>
                {searchResult.status === 'completed' ? 'Completed' : 'Pending Pickup'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-300"><strong>Order ID:</strong> {searchResult.order_id}</p>
                <p className="text-gray-300"><strong>Customer:</strong> {searchResult.user_email}</p>
                <p className="text-gray-300"><strong>Total Amount:</strong> {formatCurrency(searchResult.total_amount)}</p>
                <p className="text-gray-300"><strong>Created:</strong> {formatDate(searchResult.created_at)}</p>
              </div>
              <div>
                {searchResult.processed_at && (
                  <>
                    <p className="text-gray-300"><strong>Processed:</strong> {formatDate(searchResult.processed_at)}</p>
                    <p className="text-gray-300"><strong>Processed By:</strong> {searchResult.processed_by}</p>
                  </>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h5 className="text-white font-medium mb-2">Items:</h5>
              <div className="space-y-2">
                {searchResult.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-gray-300 text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Payment Form */}
            {searchResult.status !== 'completed' && (
              <div className="border-t border-gray-600 pt-4">
                <h5 className="text-white font-medium mb-3">Process Cash Payment</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Cash Received
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                      placeholder="0.00"
                    />
                  </div>
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
                      onClick={handleProcessPayment}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {processing ? 'Processing...' : 'Process Payment'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Cash Pickup Orders</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th className="px-6 py-3">Pickup Code</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {allPickups.slice(0, 10).map((order, index) => (
                <tr key={index} className="bg-gray-800 border-b border-gray-700">
                  <td className="px-6 py-4 font-mono">{order.pickup_code}</td>
                  <td className="px-6 py-4">{order.user_email}</td>
                  <td className="px-6 py-4">{formatCurrency(order.total_amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'completed' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {order.status === 'completed' ? 'Completed' : 'Pending'}
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
          
          {allPickups.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No cash pickup orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashPickupManagement;