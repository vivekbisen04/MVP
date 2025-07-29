'use client';

import { useState } from 'react';
import ReceiptUpload from '@/components/ReceiptUpload';
import Dashboard from '@/components/Dashboard';
import { Coins } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard'>('upload');

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Receipt Rewards</h1>
          </div>
          <p className="text-white/80 text-lg">Scan receipts, earn points, get rewards!</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 rounded-md transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Upload Receipt
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-md transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
          {activeTab === 'upload' ? <ReceiptUpload /> : <Dashboard />}
        </div>
      </div>
    </div>
  );
}
