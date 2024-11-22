import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        shorthand: data.shorthand,
        name: data.name,
        fullName: data.fullName,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        vkn: data.vkn,
        vd: data.vd,
      },
      include: {
        contacts: true,
        quotes: true,
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if the customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { contacts: true, quotes: true }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Delete associated contacts
    if (customer.contacts.length > 0) {
      await prisma.contact.deleteMany({
        where: { customerId: id }
      });
    }

    // Delete associated quotes
    if (customer.quotes.length > 0) {
      await prisma.quote.deleteMany({
        where: { customerId: id }
      });
    }

    // Delete the customer
    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer', details: error.message }, { status: 500 });
  }
}