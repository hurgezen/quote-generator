import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const parts = await prisma.part.findMany();
    console.log('Debug: All parts in database:', parts);
    return NextResponse.json({ parts });
  } catch (error) {
    console.error('Debug: Error fetching parts:', error);
    return NextResponse.json({ error: 'Failed to fetch parts' }, { status: 500 });
  }
}