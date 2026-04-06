import type { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './create-test-app';

describe('CashFlow core flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.budget.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers, authenticates, and returns the current user profile', async () => {
    const registerResponse = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'e2e-auth@cashflow.local',
      password: 'StrongPassword123',
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.accessToken).toEqual(expect.any(String));
    expect(registerResponse.body.user.email).toBe('e2e-auth@cashflow.local');

    const meResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.email).toBe('e2e-auth@cashflow.local');
  });

  it('rejects login with an invalid password', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'e2e-login-fail@cashflow.local',
      password: 'StrongPassword123',
    });

    const loginResponse = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'e2e-login-fail@cashflow.local',
      password: 'WrongPassword123',
    });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.message).toBe('Invalid email or password');
  });

  it('runs the authenticated category -> transaction -> budget -> overview flow', async () => {
    const registerResponse = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'e2e-flow@cashflow.local',
      password: 'StrongPassword123',
    });

    const token = registerResponse.body.accessToken as string;

    const categoryResponse = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Food',
        type: 'expense',
      });

    expect(categoryResponse.status).toBe(201);
    expect(categoryResponse.body.name).toBe('Food');

    const transactionResponse = await request(app.getHttpServer())
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'expense',
        amount: 120.5,
        occurredOn: '2026-04-06',
        categoryId: categoryResponse.body.id,
        note: 'Lunch',
      });

    expect(transactionResponse.status).toBe(201);
    expect(transactionResponse.body.amount).toBe(120.5);
    expect(transactionResponse.body.categoryId).toBe(categoryResponse.body.id);

    const budgetResponse = await request(app.getHttpServer())
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        month: '2026-04',
        categoryId: categoryResponse.body.id,
        amount: 3000,
      });

    expect(budgetResponse.status).toBe(201);
    expect(budgetResponse.body.month).toBe('2026-04');
    expect(budgetResponse.body.amount).toBe(3000);

    const transactionsListResponse = await request(app.getHttpServer())
      .get('/api/v1/transactions?month=2026-04')
      .set('Authorization', `Bearer ${token}`);

    expect(transactionsListResponse.status).toBe(200);
    expect(transactionsListResponse.body).toHaveLength(1);
    expect(transactionsListResponse.body[0].note).toBe('Lunch');

    const budgetsListResponse = await request(app.getHttpServer())
      .get('/api/v1/budgets?month=2026-04')
      .set('Authorization', `Bearer ${token}`);

    expect(budgetsListResponse.status).toBe(200);
    expect(budgetsListResponse.body.items).toHaveLength(1);

    const overviewResponse = await request(app.getHttpServer())
      .get('/api/v1/overview?month=2026-04')
      .set('Authorization', `Bearer ${token}`);

    expect(overviewResponse.status).toBe(200);
    expect(overviewResponse.body.month).toBe('2026-04');
    expect(overviewResponse.body.totalIncome).toBe(0);
    expect(overviewResponse.body.totalExpense).toBe(120.5);
    expect(overviewResponse.body.balance).toBe(-120.5);
  });

  it('updates and deletes transactions inside an authenticated flow', async () => {
    const registerResponse = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'e2e-transaction-edit@cashflow.local',
      password: 'StrongPassword123',
    });

    const token = registerResponse.body.accessToken as string;

    const categoryResponse = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Transport',
        type: 'expense',
      });

    const transactionResponse = await request(app.getHttpServer())
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'expense',
        amount: 45,
        occurredOn: '2026-04-07',
        categoryId: categoryResponse.body.id,
        note: 'MRT',
      });

    const patchResponse = await request(app.getHttpServer())
      .patch(`/api/v1/transactions/${transactionResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 50,
        note: 'Updated MRT ride',
      });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.amount).toBe(50);
    expect(patchResponse.body.note).toBe('Updated MRT ride');

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/api/v1/transactions/${transactionResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.deleted).toBe(true);

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/transactions?month=2026-04')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(0);
  });

  it('updates and deletes categories inside an authenticated flow', async () => {
    const registerResponse = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'e2e-category-edit@cashflow.local',
      password: 'StrongPassword123',
    });

    const token = registerResponse.body.accessToken as string;

    const categoryResponse = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Food',
        type: 'expense',
      });

    const patchResponse = await request(app.getHttpServer())
      .patch(`/api/v1/categories/${categoryResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dining',
      });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.name).toBe('Dining');

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/api/v1/categories/${categoryResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.deleted).toBe(true);

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toHaveLength(0);
  });

  it('updates and deletes budgets inside an authenticated flow', async () => {
    const registerResponse = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'e2e-budget-edit@cashflow.local',
      password: 'StrongPassword123',
    });

    const token = registerResponse.body.accessToken as string;

    const categoryResponse = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Food',
        type: 'expense',
      });

    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        month: '2026-04',
        categoryId: categoryResponse.body.id,
        amount: 3000,
      });

    expect(createResponse.status).toBe(201);

    const patchResponse = await request(app.getHttpServer())
      .patch('/api/v1/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        month: '2026-04',
        categoryId: categoryResponse.body.id,
        amount: 3200,
      });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.amount).toBe(3200);

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/api/v1/budgets/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.deleted).toBe(true);

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/budgets?month=2026-04')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toHaveLength(0);
  });

  it('rejects protected core CRUD requests without a token', async () => {
    const transactionsResponse = await request(app.getHttpServer()).get('/api/v1/transactions');
    const categoriesResponse = await request(app.getHttpServer()).get('/api/v1/categories');
    const budgetsResponse = await request(app.getHttpServer()).get('/api/v1/budgets?month=2026-04');
    const overviewResponse = await request(app.getHttpServer()).get('/api/v1/overview?month=2026-04');

    expect(transactionsResponse.status).toBe(401);
    expect(categoriesResponse.status).toBe(401);
    expect(budgetsResponse.status).toBe(401);
    expect(overviewResponse.status).toBe(401);
  });

  it('rejects protected endpoints with an invalid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/transactions')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});
