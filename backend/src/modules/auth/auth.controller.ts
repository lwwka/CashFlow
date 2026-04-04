import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;
}

@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body() body: RegisterDto): { message: string; email: string } {
    // TODO: persist user with Argon2id hash and unique email check.
    return { message: 'register endpoint ready', email: body.email };
  }
}
