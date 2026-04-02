import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { ExercisesModule } from "./modules/exercises/exercises.module";
import { HealthModule } from "./modules/health/health.module";
import { InsightsModule } from "./modules/insights/insights.module";
import { MeModule } from "./modules/me/me.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { RoutinesModule } from "./modules/routines/routines.module";
import { WorkoutsModule } from "./modules/workouts/workouts.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    HealthModule,
    MeModule,
    ExercisesModule,
    RoutinesModule,
    WorkoutsModule,
    InsightsModule,
  ],
})
export class AppModule {}
