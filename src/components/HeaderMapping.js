// src/components/HeaderMapping.js
import React, { useState } from 'react';

const requiredFields = ['partNumber', 'description', 'listPrice', 'dealerPrice', 'currency', 'tariffNumber'];

export default function HeaderMapping({ headers, onMappingComplete }) {
  const [mapping, setMapping] = useState({});

  const handleMappingChange = (field, header) => {
    setMapping(prev => ({ ...prev, [field]: header }));
  };

  const handleSubmit = () => {
    if (requiredFields.every(field => mapping[field])) {
      onMappingComplete(mapping);
    } else {
      alert('Please map all required fields');
    }
  };

  return (
    <div className="space-y-4 text-white">
      <h2 className="text-2xl font-bold">Map CSV Headers</h2>
      {requiredFields.map(field => (
        <div key={field} className="flex items-center space-x-2">
          <label className="w-1/3">{field}:</label>
          <select 
            className="w-2/3 p-2 border rounded bg-gray-700 text-white"
            onChange={(e) => handleMappingChange(field, e.target.value)}
            value={mapping[field] || ''}
          >
            <option value="">Select a header</option>
            {headers.map(header => (
              <option key={header} value={header} className="bg-gray-700">
                {header}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button 
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Complete Mapping
      </button>
    </div>
  );
}