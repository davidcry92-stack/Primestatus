import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const PickupVerification = () => {
  const [paymentCode, setPaymentCode] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState('');
  const [notes, setNotes] = useState('');
  const { apiCall } = useContext(AuthContext);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!paymentCode.trim()) return;

    setLoading(true);
    setError('');
    setTransaction(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall(`/api/admin/pickup/${paymentCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransaction(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Transaction not found');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPickup = async (action) => {
    if (!transaction) return;

    setProcessing(true);
    setProcessingAction(action);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      
      const response = await apiCall('/api/admin/pickup/process', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_code: paymentCode,
          action: action,
          admin_email: adminUser.email,
          notes: notes.trim() || null
        }),
      });

      if (response.ok) {
        // Refresh transaction data
        await handleLookup({ preventDefault: () => {} });
        setNotes('');
        alert(`Pickup ${action === 'mark_picked_up' ? 'marked as completed' : 'marked as cash paid'}!`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to process pickup');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setProcessing(false);
      setProcessingAction('');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'paid_in_app': return 'bg-blue-600';
      case 'awaiting_pickup': return 'bg-purple-600';
      case 'picked_up': return 'bg-green-600';
      case 'cash_paid_in_store': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const canProcessPickup = (status) => {
    return ['pending', 'paid_in_app', 'awaiting_pickup'].includes(status);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Pickup Verification</h2>

      {/* Lookup Form */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
        <h3 className="text-xl font-semibold mb-4">Enter Pickup Code</h3>
        <form onSubmit={handleLookup} className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter 6-digit pickup code"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
              value={paymentCode}
              onChange={(e) => setPaymentCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading || paymentCode.length !== 6}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-md transition-colors"
          >
            {loading ? 'Looking up...' : 'Lookup'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Transaction Details */}
      {transaction && (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-white">Order #{transaction.payment_code}</h3>
              <p className="text-gray-400">Created: {formatDate(transaction.created_at)}</p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(transaction.status)}`}>
                {transaction.status.replace('_', ' ').toUpperCase()}
              </div>
              <div className="text-2xl font-bold text-green-400 mt-2">
                ${transaction.total}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-3 text-white">Customer Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">Name: </span>
                  <span className="text-white">{transaction.customer_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Email: </span>
                  <span className="text-white">{transaction.customer_email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Payment Method: </span>
                  <span className="text-white">{transaction.payment_method.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-3 text-white">Order Status</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">Status: </span>
                  <span className="text-white">{transaction.status.replace('_', ' ')}</span>
                </div>
                {transaction.picked_up_at && (
                  <div>
                    <span className="text-gray-400">Picked Up: </span>
                    <span className="text-white">{formatDate(transaction.picked_up_at)}</span>
                  </div>
                )}
                {transaction.admin_who_processed && (
                  <div>
                    <span className="text-gray-400">Processed By: </span>
                    <span className="text-white">{transaction.admin_who_processed}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-white">Order Items</h4>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {transaction.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-white">{item.product_name}</td>
                      <td className="px-4 py-3 text-gray-300">{item.tier}</td>
                      <td className="px-4 py-3 text-gray-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-gray-300">${item.price}</td>
                      <td className="px-4 py-3 text-green-400 font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Processing Actions */}
          {canProcessPickup(transaction.status) && (
            <div className="border-t border-gray-700 pt-6">
              <h4 className="text-lg font-semibold mb-4 text-white">Process Pickup</h4>
              
              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Add any notes about this pickup..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {transaction.payment_method === 'in_app' ? (
                  <button
                    onClick={() => handleProcessPickup('mark_picked_up')}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-md transition-colors"
                  >
                    {processing && processingAction === 'mark_picked_up' ? 'Processing...' : 'Mark as Picked Up'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleProcessPickup('mark_cash_paid')}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-md transition-colors"
                  >
                    {processing && processingAction === 'mark_cash_paid' ? 'Processing...' : 'Mark as Cash Paid & Picked Up'}
                  </button>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-400">
                {transaction.payment_method === 'in_app' 
                  ? 'Customer has already paid online. Mark as picked up when order is collected.'
                  : 'Customer will pay cash on pickup. Mark as cash paid when payment is received and order is collected.'
                }
              </div>
            </div>
          )}

          {/* Already Processed */}
          {!canProcessPickup(transaction.status) && (
            <div className="border-t border-gray-700 pt-6">
              <div className="bg-green-900/30 border border-green-600 p-4 rounded-lg">
                <h4 className="text-green-400 font-semibold mb-2">Order Completed</h4>
                <p className="text-green-300">This order has already been processed and picked up.</p>
                {transaction.picked_up_at && (
                  <p className="text-sm text-green-400 mt-2">
                    Picked up on: {formatDate(transaction.picked_up_at)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Notes */}
          {transaction.notes && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Order Notes</h4>
              <p className="text-gray-400 bg-gray-800 p-3 rounded">{transaction.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!transaction && (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">How to Process Pickups</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start space-x-3">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <p>Customer provides their 6-digit pickup code</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <p>Enter the code above to lookup order details</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <p>Verify customer identity and order items</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              <p>For cash orders: collect payment and mark as "Cash Paid"</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
              <p>For pre-paid orders: mark as "Picked Up"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupVerification;