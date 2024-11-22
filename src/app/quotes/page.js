'use client'

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Plus } from 'lucide-react';

export default function QuotesPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto bg-gray-800 min-h-screen p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-5xl font-bold text-blue-400">Quotes</h1>
          <Link href="/quotes/create" passHref>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Create New Quote
            </button>
          </Link>
        </div>

        {/* Add your quotes list or table here */}
        <div className="text-gray-300">
          Your quotes will be displayed here. Implement the quotes list or table as needed.
        </div>
      </div>
    </MainLayout>
  );
}