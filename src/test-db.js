import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create a test customer
    const customer = await prisma.customer.create({
      data: {
        shorthand: 'TEST',
        name: 'Test Customer',
        email: 'test@example.com'
      },
    })
    console.log('Created test customer:', customer)

    // Fetch all customers
    const allCustomers = await prisma.customer.findMany()
    console.log('All customers:', allCustomers)

    // Delete the test customer
    await prisma.customer.delete({
      where: { id: customer.id },
    })
    console.log('Deleted test customer')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()