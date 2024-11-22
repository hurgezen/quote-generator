// Add this near the top of the file
import { parse } from 'csv-parse/sync';

// Replace the existing POST function with this updated version
export async function POST(request) {
  console.log('API: Starting import process');
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      console.log('API: No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`API: File received - ${file.name}`);

    const fileContent = await file.text();
    console.log('API: File content read');

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    console.log(`API: CSV parsed, ${records.length} records found`);

    // Log the first record to see the structure
    console.log('First record:', records[0]);

    const mappedRecords = records.map(record => ({
      partNumber: record['Part Number'] || record['PartNumber'] || '',
      description: record['Description'] || '',
      listPrice: parseFloat(record['List Price'] || record['ListPrice'] || '0') || 0,
      dealerPrice: parseFloat(record['Dealer Price'] || record['DealerPrice'] || '0') || 0,
      currency: record['Currency'] || 'USD',
      tariffNumber: record['Tariff Number'] || record['TariffNumber'] || ''
    }));

    // Log the first mapped record
    console.log('First mapped record:', mappedRecords[0]);

    // Validate we have records to import
    if (mappedRecords.length === 0) {
      throw new Error('No valid records found after mapping');
    }

    const createdParts = await prisma.part.createMany({
      data: mappedRecords,
      skipDuplicates: true,
    });

    console.log(`API: Import complete. ${createdParts.count} parts imported`);
    return NextResponse.json({ count: createdParts.count });
  } catch (error) {
    console.error('API Error importing parts:', error);
    return NextResponse.json({ error: `Error importing parts: ${error.message}` }, { status: 500 });
  }
}