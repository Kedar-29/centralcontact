import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Website
  const website = await prisma.website.create({
    data: {
      name: "Central Contact",
      domain: "centralcontact.local",
      appKey: "app_key_example",
      secretKey: "secret_key_example",
    },
  })

  // Form linked to Website
  const form = await prisma.form.create({
    data: {
      title: "Contact Form",
      formSchema: { fields: ["name", "email", "message"] },
      websiteId: website.id,
    },
  })

  // Message linked to Form
  await prisma.message.create({
    data: {
      formData: { name: "Kedar", email: "kedar@example.com", message: "Hello!" },
      formId: form.id,
    },
  })

  console.log("✅ Seed data inserted successfully")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
