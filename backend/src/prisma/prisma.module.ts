import { Global, Module } from '@nestjs/common';

import { UserScopeService } from './user-scope.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, UserScopeService],
  exports: [PrismaService, UserScopeService],
})
export class PrismaModule {}
