import { Injectable } from "@nestjs/common";

import { CurrentUserService } from "../../shared/current-user.service";
import { workoutInclude } from "../../shared/prisma-include";
import { serializeAnalyticsOverview, serializeWorkout } from "../../shared/serializers";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async getHistory(): Promise<ReturnType<typeof serializeWorkout>[]> {
    const user = await this.currentUserService.getRequiredUser();
    const workouts = await this.prisma.workout.findMany({
      where: {
        userId: user.id,
        status: "completed",
      },
      orderBy: {
        completedAt: "desc",
      },
      include: workoutInclude,
    });

    return workouts.map(serializeWorkout);
  }

  async getAnalyticsOverview(): Promise<ReturnType<typeof serializeAnalyticsOverview>> {
    const user = await this.currentUserService.getRequiredUser();
    const workouts = await this.prisma.workout.findMany({
      where: {
        userId: user.id,
        status: "completed",
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    let totalSets = 0;
    let totalVolumeKg = 0;
    const favoriteExerciseCounts = new Map<string, { name: string; loggedSets: number }>();

    for (const workout of workouts) {
      for (const exercise of workout.exercises) {
        for (const set of exercise.sets) {
          if (!set.isComplete) {
            continue;
          }

          totalSets += 1;
          totalVolumeKg += (set.reps ?? 0) * Number(set.weightKg?.toString() ?? 0);

          favoriteExerciseCounts.set(exercise.exerciseId, {
            name: exercise.exercise.name,
            loggedSets: (favoriteExerciseCounts.get(exercise.exerciseId)?.loggedSets ?? 0) + 1,
          });
        }
      }
    }

    const favoriteExercises = Array.from(favoriteExerciseCounts.entries())
      .map(([exerciseId, value]) => ({
        exerciseId,
        name: value.name,
        loggedSets: value.loggedSets,
      }))
      .sort((left, right) => right.loggedSets - left.loggedSets || left.name.localeCompare(right.name))
      .slice(0, 5);

    return serializeAnalyticsOverview(
      workouts.length,
      totalSets,
      totalVolumeKg,
      this.calculateActiveStreak(workouts.map((workout) => workout.completedAt)),
      favoriteExercises,
    );
  }

  private calculateActiveStreak(completedDates: Array<Date | null>): number {
    const completedDaySet = new Set(
      completedDates
        .filter((value): value is Date => Boolean(value))
        .map((value) => value.toISOString().slice(0, 10)),
    );

    let streak = 0;
    const cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);

    while (completedDaySet.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return streak;
  }
}
