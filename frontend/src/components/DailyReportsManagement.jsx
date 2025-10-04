import React, { useState, useEffect } from 'react';
import { Calendar, Download, FileText, DollarSign, TrendingUp, CreditCard, BarChart3 } from 'lucide-react';

const DailyReportsManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [todayStats, setTodayStats] = useState(null);

  useEffect(() => {
    loadReports();
    loadTodayStats();
  }, []);

  const loadReports = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/reports?report_type=square_sales&limit=30`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadTodayStats = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/reports/quick-stats/today`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTodayStats(data);
      }
    } catch (error) {
      console.error('Error loading today stats:', error);
    }
  };

  const generateReport = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    setGenerating(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          report_date: selectedDate,
          report_type: 'square_sales'
        })
      });

      if (response.ok) {
        const report = await response.json();
        setCurrentReport(report);
        alert(`✅ Report generated successfully!\n\nDate: ${report.report_date}\nTotal Sales: $${report.total_amount}\nTransactions: ${report.total_transactions}`);
        loadReports(); // Refresh the reports list
      } else {
        const error = await response.json();
        alert(`Error generating report: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const viewReport = async (reportId) => {
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/admin/reports/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const report = await response.json();
        setCurrentReport(report);
      }
    } catch (error) {
      console.error('Error viewing report:', error);
      alert('Error loading report details.');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (report) => {
    const csvContent = [
      ['Square Sales Report', report.report_date].join(','),
      [],
      ['Summary'],
      ['Total Transactions', report.total_transactions].join(','),
      ['Total Amount', `$${report.total_amount}`].join(','),
      ['Average Transaction', `$${report.average_transaction}`].join(','),
      ['Successful Payments', report.successful_payments].join(','),
      ['Failed Payments', report.failed_payments].join(','),
      [],
      ['Transaction Details'],
      ['Transaction ID', 'Order ID', 'Amount', 'Status', 'Customer', 'Time', 'Pickup Code'].join(','),
      ...report.transactions.map(t => [
        t.transaction_id,
        t.order_id,
        `$${t.amount}`,
        t.status,
        t.user_email,
        new Date(t.created_at).toLocaleString(),
        t.pickup_code || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `square-sales-report-${report.report_date}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Daily Square Sales Reports</h2>
        <button
          onClick={loadReports}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Today's Quick Stats */}
      {todayStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Today's Square Sales</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(todayStats.total_square_sales)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Transactions Today</p>
                <p className="text-2xl font-bold text-white">{todayStats.total_transactions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-300">Average Sale</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(todayStats.average_transaction)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate New Report */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Generate New Report</h3>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={generateReport}
            disabled={generating}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Current Report View */}
      {currentReport && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">Square Sales Report</h3>
              <p className="text-gray-300">{formatDate(currentReport.report_date)}</p>
            </div>
            <button
              onClick={() => exportReport(currentReport)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>

          {/* Report Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Total Sales</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(currentReport.total_amount)}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-blue-400">{currentReport.total_transactions}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Successful</p>
              <p className="text-2xl font-bold text-green-400">{currentReport.successful_payments}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Average Sale</p>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(currentReport.average_transaction)}</p>
            </div>
          </div>

          {/* Transaction Details */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Transaction Details</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Pickup Code</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReport.transactions.map((transaction, index) => (
                    <tr key={index} className="bg-gray-800 border-b border-gray-700">
                      <td className="px-6 py-4 font-mono">{transaction.order_id}</td>
                      <td className="px-6 py-4">{transaction.user_email}</td>
                      <td className="px-6 py-4">{formatCurrency(transaction.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.status === 'completed' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatDateTime(transaction.created_at)}</td>
                      <td className="px-6 py-4 font-mono">{transaction.pickup_code || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {currentReport.transactions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No transactions found for this date
                </div>
              )}
            </div>
          </div>

          {/* Report Metadata */}
          <div className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400">
            <p>Generated on: {formatDateTime(currentReport.generated_at)}</p>
            <p>Generated by: {currentReport.generated_by}</p>
            <p>Report ID: {currentReport.report_id}</p>
          </div>
        </div>
      )}

      {/* Previous Reports */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Previous Reports</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total Sales</th>
                <th className="px-6 py-3">Transactions</th>
                <th className="px-6 py-3">Avg Sale</th>
                <th className="px-6 py-3">Generated</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index} className="bg-gray-800 border-b border-gray-700">
                  <td className="px-6 py-4 font-medium">{formatDate(report.report_date)}</td>
                  <td className="px-6 py-4 text-green-400">{formatCurrency(report.total_amount)}</td>
                  <td className="px-6 py-4">{report.total_transactions}</td>
                  <td className="px-6 py-4">{formatCurrency(report.average_transaction)}</td>
                  <td className="px-6 py-4">{formatDateTime(report.generated_at)}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => viewReport(report.report_id)}
                      disabled={loading}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => exportReport(report)}
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {reports.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No reports generated yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyReportsManagement;