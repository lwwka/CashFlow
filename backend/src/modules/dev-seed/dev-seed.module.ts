import { Module } from '@nestjs/common';

import { DevSeedController } from './dev-seed.controller';
import { DevSeedService } from './dev-seed.service';

@Module({
  controllers: [DevSeedController],
  providers: [DevSeedService],
})
export class DevSeedModule {}
