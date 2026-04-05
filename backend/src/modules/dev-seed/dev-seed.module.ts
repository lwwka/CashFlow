import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { DevSeedController } from './dev-seed.controller';
import { DevSeedService } from './dev-seed.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DevSeedController],
  providers: [DevSeedService],
})
export class DevSeedModule {}
