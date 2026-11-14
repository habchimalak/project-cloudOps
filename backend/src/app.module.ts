import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { ProjectsModule } from './projects/projects.module';
import { EnvironmentsModule } from './environments/environments.module';
import { ServersModule } from './servers/servers.module';
import { ApplicationsModule } from './applications/applications.module';
import { MetricsModule } from './metrics/metrics.module';
import { AlertsModule } from './alerts/alerts.module';

// Un module Nest par métier (semaine 2)
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    TeamsModule,
    ProjectsModule,
    EnvironmentsModule,
    ServersModule,
    ApplicationsModule,
    MetricsModule,
    AlertsModule,
  ],
})
export class AppModule {}
