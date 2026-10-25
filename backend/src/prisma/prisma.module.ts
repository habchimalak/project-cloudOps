import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global : PrismaService est injectable dans tous les modules sans import
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
