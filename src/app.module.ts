import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./modules/auth/auth.module";
import { ExercisesModule } from "./modules/exercises/exercises.module";
import { HealthModule } from "./modules/health/health.module";
import { InsightsModule } from "./modules/insights/insights.module";
import { MeModule } from "./modules/me/me.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { RoutinesModule } from "./modules/routines/routines.module";
import { SharedModule } from "./shared/shared.module";
import { WorkoutsModule } from "./modules/workouts/workouts.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    SharedModule,
    HealthModule,
    AuthModule,
    MeModule,
    ExercisesModule,
    RoutinesModule,
    WorkoutsModule,
    InsightsModule,
  ],
})
export class AppModule {}
