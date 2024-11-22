import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  console.log('API: Fetching parts');
  try {
    const parts = await prisma.part.findMany();
    console.log(`API: Found ${parts.length} parts`);
    const processedParts = parts.map(part => ({
      id: part.id,
      partNumber: part.partNumber || 'N/A',
      description: part.description || 'No description',
      listPrice: part.listPrice || 0,
      dealerPrice: part.dealerPrice || 0,
      currency: part.currency || 'USD',
      tariffNumber: part.tariffNumber || 'N/A'
    }));
    console.log('API: First processed part:', processedParts[0]);
    return NextResponse.json({ parts: processedParts });
  } catch (error) {
    console.error('API Error fetching parts:', error);
    return NextResponse.json({ error: 'Failed to fetch parts' }, { status: 500 });
  }
}