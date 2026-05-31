import { prisma } from './lib/prisma';

async function main() {
  console.log('Seeding initial data...');

  // 1. Create Books
  const dsaBook = await prisma.book.create({
    data: {
      name: 'Data Structures & Algorithms',
      desc: 'Master DSA for technical interviews',
      priority: 'High',
      cover: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    }
  });

  const hsbcBook = await prisma.book.create({
    data: {
      name: 'HSBC Interview Prep',
      desc: 'Everything needed to clear the HSBC coding round and technical interview',
      priority: 'High',
      cover: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    }
  });

  // 2. Create Chapters
  const dsaChapter1 = await prisma.chapter.create({
    data: {
      title: 'Arrays & Strings',
      bookId: dsaBook.id,
      order: 1
    }
  });

  const hsbcChapter1 = await prisma.chapter.create({
    data: {
      title: 'Java OOPs & Streams',
      bookId: hsbcBook.id,
      order: 1
    }
  });

  // 3. Create Pages
  await prisma.page.create({
    data: {
      title: 'Two Sum Problem',
      chapterId: dsaChapter1.id,
      type: 'dsa',
      difficulty: 'Easy',
      companies: 'Amazon, Google'
    }
  });

  await prisma.page.create({
    data: {
      title: 'Java 8 Stream API',
      chapterId: hsbcChapter1.id,
      type: 'theory',
      difficulty: 'Medium',
      companies: 'HSBC'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
