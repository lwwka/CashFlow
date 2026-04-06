import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Injectable()
export class UserScopeService {
  constructor(private readonly prisma: PrismaService) {}

  requireUserEmail(userEmail?: string): string {
    if (!userEmail) {
      throw new BadRequestException('userEmail is required');
    }

    return userEmail;
  }

  async getUserIdOrThrow(userEmail: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User not found for email ${userEmail}`);
    }

    return user.id;
  }

  async assertCategoryOwnership(userEmail: string, categoryId?: string): Promise<void> {
    if (!categoryId) {
      return;
    }

    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        user: { email: userEmail },
      },
      select: { id: true },
    });

    if (!category) {
      throw new BadRequestException(`Category ${categoryId} does not belong to user ${userEmail}`);
    }
  }
}
