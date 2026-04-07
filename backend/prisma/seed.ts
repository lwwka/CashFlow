import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seedPayload = {
  userEmail: 'demo@cashflow.local',
  password: 'demo-password-1234',
  categories: [
    { name: 'Salary', type: 'income' as const },
    { name: 'Food', type: 'expense' as const },
    { name: 'Transport', type: 'expense' as const },
  ],
  transactions: [
    { type: 'income' as const, amount: 50000, occurredOn: '2026-04-01', categoryName: 'Salary', note: 'April salary' },
    { type: 'expense' as const, amount: 120.5, occurredOn: '2026-04-03', categoryName: 'Food', note: 'Lunch' },
    { type: 'expense' as const, amount: 45, occurredOn: '2026-04-04', categoryName: 'Transport', note: 'MRT' },
  ],
  budgets: [
    { month: '2026-04', categoryName: 'Food', amount: 3000 },
    { month: '2026-04', categoryName: 'Transport', amount: 1200 },
    { month: '2026-04', amount: 10000 },
  ],
};

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(seedPayload.password, 12);

  await prisma.user.deleteMany({
    where: {
      email: seedPayload.userEmail,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: seedPayload.userEmail,
      passwordHash,
    },
    select: { id: true },
  });

  const categoryMap = new Map<string, string>();

  for (const category of seedPayload.categories) {
    const saved = await prisma.category.create({
      data: {
        userId: user.id,
        name: category.name,
        type: category.type,
      },
      select: { id: true },
    });

    categoryMap.set(`${category.type}:${category.name}`, saved.id);
  }

  await prisma.transaction.createMany({
    data: seedPayload.transactions.map((transaction) => ({
      userId: user.id,
      categoryId: transaction.categoryName ? categoryMap.get(`${transaction.type}:${transaction.categoryName}`) ?? null : null,
      type: transaction.type,
      amount: transaction.amount,
      occurredOn: new Date(`${transaction.occurredOn}T00:00:00.000Z`),
      note: transaction.note ?? null,
    })),
  });

  await prisma.budget.createMany({
    data: seedPayload.budgets.map((budget) => ({
      userId: user.id,
      categoryId: budget.categoryName ? categoryMap.get(`expense:${budget.categoryName}`) ?? null : null,
      month: budget.month,
      amount: budget.amount,
    })),
  });

  console.log(`Seed completed for ${seedPayload.userEmail} with password ${seedPayload.password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
