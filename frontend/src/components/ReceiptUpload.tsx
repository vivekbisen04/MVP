'use client';

import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface UploadResult {
  success: boolean;
  receipt?: {
    id: number;
    merchant: string;
    total: number;
    points_awarded: number;
    confidence: number;
  };
  message?: string;
  error?: string;
}

export default function ReceiptUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (files[0].type.startsWith('image/')) {
        setSelectedFile(files[0]);
        setResult(null);
      } else {
        setResult({ success: false, error: 'Please select an image file' });
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setResult(null);
      } else {
        setResult({ success: false, error: 'Please select an image file' });
      }
    }
  };

  const uploadReceipt = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const response = await axios.post(`${API_BASE_URL}/api/receipts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout
      });

      setResult(response.data);
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      
      if (error.response?.data?.error) {
        setResult({ success: false, error: error.response.data.error });
      } else if (error.code === 'ECONNABORTED') {
        setResult({ success: false, error: 'Upload timeout. Please try again.' });
      } else {
        setResult({ success: false, error: 'Failed to process receipt. Please try again.' });
      }
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Upload Your Receipt</h2>
        <p className="text-white/80">Drag and drop your receipt image or click to select</p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-white bg-white/10'
            : selectedFile
            ? 'border-green-400 bg-green-400/10'
            : 'border-white/40 hover:border-white/60 hover:bg-white/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        {selectedFile ? (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-white/60 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={clearFile}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-16 h-16 text-white/60 mx-auto" />
            <div>
              <p className="text-white font-medium">Drop your receipt image here</p>
              <p className="text-white/60 text-sm">or click to browse files</p>
            </div>
            <p className="text-white/40 text-xs">Supports JPG, PNG, HEIC (max 10MB)</p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {selectedFile && (
        <div className="text-center">
          <button
            onClick={uploadReceipt}
            disabled={uploading}
            className="inline-flex items-center gap-3 bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Receipt...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Process Receipt
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`rounded-xl p-6 ${
          result.success 
            ? 'bg-green-500/20 border border-green-400' 
            : 'bg-red-500/20 border border-red-400'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            
            <div className="flex-1">
              {result.success && result.receipt ? (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold text-lg">Receipt Processed Successfully! 🎉</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="text-white/60">Merchant:</span>
                      <p className="text-white font-medium">{result.receipt.merchant}</p>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="text-white/60">Total:</span>
                      <p className="text-white font-medium">${result.receipt.total.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="text-white/60">Points Earned:</span>
                      <p className="text-green-400 font-bold text-lg">+{result.receipt.points_awarded}</p>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="text-white/60">Confidence:</span>
                      <p className="text-white font-medium">{result.receipt.confidence}%</p>
                    </div>
                  </div>
                  
                  {result.message && (
                    <p className="text-green-400 font-medium">{result.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-red-400 font-semibold">Processing Failed</h3>
                  <p className="text-white/80 mt-1">{result.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}