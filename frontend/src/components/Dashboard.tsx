'use client';

import { useState, useEffect } from 'react';
import { Coins, Receipt, Calendar, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface ReceiptData {
  id: number;
  merchant: string;
  total_amount: number;
  points_awarded: number;
  processed_at: string;
  confidence: number;
}

interface DashboardData {
  receipts: ReceiptData[];
  total_points: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [receiptsResponse, pointsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/receipts`),
        axios.get(`${API_BASE_URL}/api/points`)
      ]);

      setData({
        receipts: receiptsResponse.data.receipts,
        total_points: pointsResponse.data.total_points
      });
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <span className="text-white ml-3">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  const receiptsCount = data?.receipts.length || 0;
  const totalSpent = data?.receipts.reduce((sum, receipt) => sum + receipt.total_amount, 0) || 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Your Rewards Dashboard</h2>
        <p className="text-white/80">Track your points and receipt history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Points */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-white/80 font-medium">Total Points</h3>
          </div>
          <p className="text-3xl font-bold text-white">{data?.total_points || 0}</p>
        </div>

        {/* Receipts Processed */}
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white/80 font-medium">Receipts</h3>
          </div>
          <p className="text-3xl font-bold text-white">{receiptsCount}</p>
        </div>

        {/* Total Spent */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white/80 font-medium">Total Spent</h3>
          </div>
          <p className="text-3xl font-bold text-white">${totalSpent.toFixed(2)}</p>
        </div>

        {/* Average per Receipt */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white/80 font-medium">Avg/Receipt</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            ${receiptsCount > 0 ? (totalSpent / receiptsCount).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Receipts List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Receipts</h3>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {receiptsCount === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl">
            <Receipt className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">No receipts yet</h4>
            <p className="text-white/60">Upload your first receipt to start earning points!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="bg-white/10 rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{receipt.merchant}</h4>
                      <p className="text-white/60 text-sm">{formatDate(receipt.processed_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${receipt.total_amount.toFixed(2)}</p>
                    <p className="text-green-400 text-sm font-medium">+{receipt.points_awarded} pts</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Confidence: {receipt.confidence}%</span>
                  <div className="flex items-center gap-2 text-white/60">
                    <span>Receipt #{receipt.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}