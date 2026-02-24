const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.book.createMany({
    data: [
      {
        title: '1984',
        author: 'George Orwell',
        description: 'Dystopian novel about surveillance and totalitarianism.'
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        description: 'Classic novel about justice and morality.'
      }
    ],
    skipDuplicates: true
  })

  await prisma.club.createMany({
    data: [
      { name: 'General', description: 'Общий книжный клуб для всех жанров.' },
      { name: 'Sci-Fi', description: 'Клуб любителей научной фантастики.' }
    ],
    skipDuplicates: true
  })

  console.log('✅ Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
