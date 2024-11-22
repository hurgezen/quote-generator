'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Loader, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import HeaderMapping from '@/components/HeaderMapping';

export default function PartsList() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [showMapping, setShowMapping] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const initialFetchDone = useRef(false);

  const fetchParts = useCallback(async () => {
    console.log('Client: Fetching parts...');
    setLoading(true);
    try {
      const response = await fetch('/api/parts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Client: Successfully fetched ${data.parts.length} parts`);
      console.log('Client: First part:', data.parts[0]);
      setParts(data.parts);
    } catch (error) {
      console.error('Client: Error fetching parts:', error);
      setError('Failed to fetch parts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchParts();
      initialFetchDone.current = true;
    }
  }, [fetchParts]);

  const handleFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      console.log(`Client: File selected: ${selectedFile.name}`);
      setFile(selectedFile);
      setError(null);
      setUploadStatus('File selected');
    } else {
      console.log('Client: Invalid file type selected');
      setFile(null);
      setError('Please select a valid CSV file.');
      setUploadStatus('');
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) {
      console.log('Client: No file selected for upload');
      setError('Please select a file to upload.');
      return;
    }

    console.log('Client: Starting file upload...');
    setLoading(true);
    setError(null);
    setUploadSuccess(false);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/import-parts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
      }

      const data = await response.json();
      console.log(`Client: File processed. ${data.totalRecords} records found.`);
      setCsvHeaders(data.headers);
      setPreviewData(data.previewData);
      setShowMapping(true);
      setUploadStatus('File processed. Please map headers.');
    } catch (error) {
      console.error('Client: Upload error:', error);
      setError(`An error occurred while uploading the file: ${error.message}`);
      setUploadStatus('Upload failed');
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleMappingComplete = async (mapping) => {
    console.log('Client: Mapping completed', mapping);
    setUploadSuccess(true);
    setUploadStatus('Import successful');
    setShowMapping(false);
    await fetchParts();
  };

  const router = useRouter();

  const handleReupload = useCallback(() => {
    setFile(null);
    setUploadSuccess(false);
    setUploadStatus('');
    setShowMapping(false);
    setCsvHeaders([]);
    setPreviewData([]);
  }, []);

  

  return (
    <MainLayout>
      <div className="p-6 bg-gray-900">
        <h1 className="text-4xl font-bold text-blue-400 mb-6">Parts List</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold text-blue-300 mb-4">Import Parts</h2>
          <div className="flex items-center space-x-4 mb-4">
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
              <Upload className="w-5 h-5 mr-2" />
              Choose CSV File
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
            </label>
            {file && (
              <p className="text-sm text-gray-300">
                Selected file: {file.name}
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Upload and Process'}
            </button>
            <button
              onClick={handleReupload}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Re-upload CSV
            </button>
          </div>
          {uploadStatus && (
            <p className="text-sm mt-2 flex items-center">
              {uploadSuccess ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              )}
              {uploadStatus}
            </p>
          )}
        </div>
        
        {showMapping && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <HeaderMapping headers={csvHeaders} onMappingComplete={handleMappingComplete} />
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center h-40">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}
        {error && (
          <p className="text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </p>
        )}
        
        {!loading && parts.length > 0 ? (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-300 mb-4">Parts List</h2>
            <ul className="space-y-2">
              {parts.map((part) => (
                <li key={part.id} className="text-white bg-gray-700 p-3 rounded">
                  <span className="font-bold">{part.partNumber}</span> - {part.description}
                  <br />
                  List Price: {part.listPrice} {part.currency} | Dealer Price: {part.dealerPrice} {part.currency}
                  <br />
                  Tariff Number: {part.tariffNumber}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          !loading && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-white">No parts found. Please upload a CSV file to import parts.</p>
            </div>
          )
        )}

        <button 
          onClick={fetchParts} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh Parts List
        </button>
      </div>
    </MainLayout>
  );
}