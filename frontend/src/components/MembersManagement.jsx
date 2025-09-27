import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const MembersManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const { apiCall } = useContext(AuthContext);

  useEffect(() => {
    loadMembers();
  }, [searchTerm, filterStatus, filterTier]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filterStatus) queryParams.append('status', filterStatus);
      if (filterTier) queryParams.append('membership_tier', filterTier);

      const response = await apiCall(`/api/admin/members?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberTransactions = async (memberId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall(`/api/admin/members/${memberId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const transactions = await response.json();
        setSelectedMember(prev => ({ ...prev, transactions }));
      }
    } catch (error) {
      console.error('Failed to load member transactions:', error);
    }
  };

  const handleMemberClick = async (member) => {
    setSelectedMember({ ...member, transactions: null });
    await loadMemberTransactions(member.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'approved': 'bg-green-600 text-white',
      'pending': 'bg-yellow-600 text-white',
      'rejected': 'bg-red-600 text-white',
      'needs_medical': 'bg-blue-600 text-white'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-600 text-white'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getTierBadge = (tier) => {
    const tierStyles = {
      'basic': 'bg-gray-600 text-white',
      'premium': 'bg-purple-600 text-white'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierStyles[tier] || 'bg-gray-600 text-white'}`}>
        {tier.toUpperCase()}
      </span>
    );
  };

  if (selectedMember) {
    return (
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setSelectedMember(null)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md text-sm transition-colors"
          >
            ← Back to Members
          </button>
          <h2 className="text-2xl font-bold">Member Profile: {selectedMember.full_name}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Member Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Full Name</label>
                  <p className="text-white">{selectedMember.full_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{selectedMember.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <p className="text-white">{selectedMember.username}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Date of Birth</label>
                  <p className="text-white">{selectedMember.date_of_birth}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Member Since</label>
                  <p className="text-white">{formatDate(selectedMember.member_since)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Membership Tier</label>
                  <div className="mt-1">{getTierBadge(selectedMember.membership_tier)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Verification Status</label>
                  <div className="mt-1">{getStatusBadge(selectedMember.verification_status)}</div>
                </div>
                {selectedMember.parent_email && (
                  <div>
                    <label className="text-sm text-gray-400">Parent Email</label>
                    <p className="text-white">{selectedMember.parent_email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mt-6">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Orders</span>
                  <span className="text-white font-semibold">{selectedMember.order_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Spent</span>
                  <span className="text-green-400 font-semibold">${selectedMember.total_spent}</span>
                </div>
                {selectedMember.last_order && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Order</span>
                    <span className="text-white">{formatDate(selectedMember.last_order)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
              
              {selectedMember.transactions === null ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : selectedMember.transactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No transactions found</p>
              ) : (
                <div className="space-y-4">
                  {selectedMember.transactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-white">Order #{transaction.payment_code}</p>
                          <p className="text-sm text-gray-400">{formatDateTime(transaction.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">${transaction.total}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'picked_up' ? 'bg-green-600 text-white' :
                            transaction.status === 'paid_in_app' ? 'bg-blue-600 text-white' :
                            transaction.status === 'pending' ? 'bg-yellow-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {transaction.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {transaction.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.product_name} x{item.quantity}</span>
                            <span className="text-gray-300">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-600 flex justify-between text-sm">
                        <span className="text-gray-400">Payment Method</span>
                        <span className="text-white">{transaction.payment_method.replace('_', ' ').toUpperCase()}</span>
                      </div>

                      {transaction.picked_up_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Picked Up</span>
                          <span className="text-white">{formatDateTime(transaction.picked_up_at)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Members Management</h2>
        <div className="text-sm text-gray-400">
          Total Members: {members.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, or username"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Verification Status</label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="needs_medical">Needs Medical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Membership Tier</label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            >
              <option value="">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No members found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{member.full_name}</div>
                        <div className="text-sm text-gray-400">{member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(member.verification_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTierBadge(member.membership_tier)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {member.order_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                      ${member.total_spent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(member.member_since)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleMemberClick(member)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersManagement;