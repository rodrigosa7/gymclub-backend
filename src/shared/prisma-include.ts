import { Prisma } from "@prisma/client";

export const routineInclude = Prisma.validator<Prisma.RoutineInclude>()({
  exercises: {
    orderBy: {
      order: "asc",
    },
    include: {
      sets: {
        orderBy: {
          order: "asc",
        },
      },
    },
  },
});

export const workoutInclude = Prisma.validator<Prisma.WorkoutInclude>()({
  exercises: {
    orderBy: {
      order: "asc",
    },
    include: {
      sets: {
        orderBy: {
          order: "asc",
        },
      },
    },
  },
});

export type RoutineWithRelations = Prisma.RoutineGetPayload<{
  include: typeof routineInclude;
}>;

export type WorkoutWithRelations = Prisma.WorkoutGetPayload<{
  include: typeof workoutInclude;
}>;
