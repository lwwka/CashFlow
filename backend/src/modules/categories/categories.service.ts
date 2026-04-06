import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { UserScopeService } from '../../prisma/user-scope.service';

export interface CategoryRecord {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userScope: UserScopeService,
  ) {}

  async list(userEmail?: string): Promise<{ items: CategoryRecord[] }> {
    const email = this.userScope.requireUserEmail(userEmail);

    const categories = await this.prisma.category.findMany({
      where: {
        user: { email },
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return {
      items: categories.map((category) => ({
        id: category.id,
        name: category.name,
        type: category.type,
      })),
    };
  }

  async create(input: { userEmail?: string; name: string; type: 'income' | 'expense' }): Promise<CategoryRecord> {
    const email = this.userScope.requireUserEmail(input.userEmail);
    const userId = await this.userScope.getUserIdOrThrow(email);

    const category = await this.prisma.category.upsert({
      where: {
        userId_name_type: {
          userId,
          name: input.name,
          type: input.type,
        },
      },
      update: {},
      create: {
        userId,
        name: input.name,
        type: input.type,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    return category;
  }

  async update(id: string, input: { userEmail?: string; name?: string; type?: 'income' | 'expense' }): Promise<CategoryRecord> {
    const email = this.userScope.requireUserEmail(input.userEmail);

    const existing = await this.prisma.category.findFirst({
      where: {
        id,
        user: { email },
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.type ? { type: input.type } : {}),
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    return category;
  }

  async remove(id: string, userEmail?: string): Promise<{ id: string; deleted: true }> {
    const email = this.userScope.requireUserEmail(userEmail);

    const existing = await this.prisma.category.findFirst({
      where: {
        id,
        user: { email },
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { id, deleted: true };
  }
}
