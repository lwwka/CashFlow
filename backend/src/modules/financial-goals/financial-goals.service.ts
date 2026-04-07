import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { UserScopeService } from '../../prisma/user-scope.service';

export interface FinancialGoalRecord {
  id: string;
  goalType: string;
  targetAmount: number;
}

@Injectable()
export class FinancialGoalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userScope: UserScopeService,
  ) {}

  async getFinancialGoal(goalType: string, email: string): Promise<FinancialGoalRecord | null> {
    const goal = await this.prisma.financialGoal.findFirst({
      where: {
        goalType,
        user: { email },
      },
      select: {
        id: true,
        goalType: true,
        targetAmount: true,
      },
    });

    if (!goal) {
      return null;
    }

    return {
      id: goal.id,
      goalType: goal.goalType,
      targetAmount: Number(goal.targetAmount),
    };
  }

  async upsertFinancialGoal(input: { goalType: string; email: string; targetAmount: number }): Promise<FinancialGoalRecord> {
    const userId = await this.userScope.getUserIdOrThrow(input.email);

    const goal = await this.prisma.financialGoal.upsert({
      where: {
        userId_goalType: {
          userId,
          goalType: input.goalType,
        },
      },
      update: {
        targetAmount: input.targetAmount,
      },
      create: {
        userId,
        goalType: input.goalType,
        targetAmount: input.targetAmount,
      },
      select: {
        id: true,
        goalType: true,
        targetAmount: true,
      },
    });

    return {
      id: goal.id,
      goalType: goal.goalType,
      targetAmount: Number(goal.targetAmount),
    };
  }
}
