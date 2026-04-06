import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';

export interface AuthUser {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: { email: string; password: string }): Promise<{ accessToken: string; user: { id: string; email: string } }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return {
      accessToken: await this.signToken(user.id, user.email),
      user,
    };
  }

  async login(input: { email: string; password: string }): Promise<{ accessToken: string; user: { id: string; email: string } }> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      accessToken: await this.signToken(user.id, user.email),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async getProfile(userId: string): Promise<{ id: string; email: string; createdAt: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private signToken(userId: string, email: string): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
      email,
    });
  }
}
