import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error("Failed to create Prisma Client", error);
  prisma = null;
}

export async function GET() {
  if (!prisma) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const csvMappings = await prisma.csvMapping.findMany();
    return NextResponse.json(csvMappings);
  } catch (error) {
    console.error('Error fetching CSV mappings:', error);
    return NextResponse.json({ error: 'Error fetching CSV mappings' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!prisma) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const { name, mapping } = await request.json();
    const newMapping = await prisma.csvMapping.create({
      data: {
        name,
        mapping: JSON.stringify(mapping),
      },
    });
    return NextResponse.json(newMapping);
  } catch (error) {
    console.error('Error saving CSV mapping:', error);
    return NextResponse.json({ error: 'Error saving CSV mapping' }, { status: 500 });
  }
}