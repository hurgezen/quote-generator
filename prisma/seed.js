import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, try to find the customer by shorthand
  let customer = await prisma.customer.findFirst({
    where: { shorthand: "ACME" }
  });

  if (!customer) {
    // If the customer doesn't exist, create it
    customer = await prisma.customer.create({
      data: {
        shorthand: "ACME",
        name: "ACME Corporation",
        fullName: "ACME Corporation International",
        address: "123 Main St, Anytown, AT 12345",
        phone: "+1 (555) 123-4567",
        email: "info@acmecorp.com",
        website: "https://www.acmecorp.com",
        vkn: "1234567890",
        vd: "Anytown Tax Office",
      }
    });
  }

  // Now that we have the customer, we can create or update the contacts
  const contactsData = [
    {
      name: "John Doe",
      position: "CEO",
      email: "john.doe@acmecorp.com",
      phone: "+1 (555) 123-4568",
      address: "123 Main St, Anytown, AT 12345"
    },
    {
      name: "Jane Smith",
      position: "Sales Manager",
      email: "jane.smith@acmecorp.com",
      phone: "+1 (555) 123-4569",
      address: "123 Main St, Anytown, AT 12345"
    },
    {
      name: "Bob Johnson",
      position: "Technical Support",
      email: "bob.johnson@acmecorp.com",
      phone: "+1 (555) 123-4570",
      address: "123 Main St, Anytown, AT 12345"
    }
  ];

  for (const contactData of contactsData) {
    await prisma.contact.upsert({
      where: {
        customerId_email: {
          customerId: customer.id,
          email: contactData.email
        }
      },
      update: contactData,
      create: {
        ...contactData,
        customerId: customer.id
      }
    });
  }

  console.log('Seed data has been successfully inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });