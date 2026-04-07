import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { UserScopeService } from '../../prisma/user-scope.service';

export interface MonthlyGoalRecord {
  id: string;
  month: string;
  savingsTarget: number;
}

@Injectable()
export class MonthlyGoalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userScope: UserScopeService,
  ) {}

  async getMonthlyGoal(month: string, email: string): Promise<MonthlyGoalRecord | null> {
    const goal = await this.prisma.monthlyGoal.findFirst({
      where: {
        month,
        user: { email },
      },
      select: {
        id: true,
        month: true,
        savingsTarget: true,
      },
    });

    if (!goal) {
      return null;
    }

    return {
      id: goal.id,
      month: goal.month,
      savingsTarget: Number(goal.savingsTarget),
    };
  }

  async upsertMonthlyGoal(input: { month: string; email: string; savingsTarget: number }): Promise<MonthlyGoalRecord> {
    const userId = await this.userScope.getUserIdOrThrow(input.email);

    const goal = await this.prisma.monthlyGoal.upsert({
      where: {
        userId_month: {
          userId,
          month: input.month,
        },
      },
      update: {
        savingsTarget: input.savingsTarget,
      },
      create: {
        userId,
        month: input.month,
        savingsTarget: input.savingsTarget,
      },
      select: {
        id: true,
        month: true,
        savingsTarget: true,
      },
    });

    return {
      id: goal.id,
      month: goal.month,
      savingsTarget: Number(goal.savingsTarget),
    };
  }
}
