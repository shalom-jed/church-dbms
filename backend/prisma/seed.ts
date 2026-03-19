import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@church.com' },
    update: {},
    create: {
      email: 'admin@church.com',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  const incomeCategories = [
    { categoryName: 'Tithe', description: 'Regular tithes from members' },
    { categoryName: 'Offering', description: 'Sunday and special offerings' },
    { categoryName: 'Pledge', description: 'Pledged donations' },
    { categoryName: 'Donation', description: 'One-time donations' },
  ];

  for (const category of incomeCategories) {
    await prisma.incomeCategory.upsert({
      where: { categoryName: category.categoryName },
      update: {},
      create: category,
    });
  }

  console.log('✅ Income categories created');

  const expenseCategories = [
    { categoryName: 'Rent', description: 'Building rent and utilities' },
    { categoryName: 'Salaries', description: 'Staff salaries' },
    { categoryName: 'Ministry', description: 'Ministry expenses' },
    { categoryName: 'Equipment', description: 'Equipment and maintenance' },
    { categoryName: 'Events', description: 'Event expenses' },
  ];

  for (const category of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { categoryName: category.categoryName },
      update: {},
      create: category,
    });
  }

  console.log('✅ Expense categories created');
  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });