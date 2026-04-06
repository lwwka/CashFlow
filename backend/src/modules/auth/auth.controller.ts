import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { CurrentUser } from './current-user.decorator';
import { AuthService, type AuthUser } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto): Promise<{ accessToken: string; user: { id: string; email: string } }> {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto): Promise<{ accessToken: string; user: { id: string; email: string } }> {
    return this.authService.login(body);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser): Promise<{ id: string; email: string; createdAt: string }> {
    return this.authService.getProfile(user.sub);
  }
}
