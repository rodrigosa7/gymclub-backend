import { randomUUID } from "node:crypto";

import {
  DatabaseSeed,
  Exercise,
  Routine,
  RoutineExerciseTemplate,
  RoutineTargetSet,
  User,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from "../domain";

const createSetTemplate = (
  type: RoutineTargetSet["type"],
  targetRepsMin: number,
  targetRepsMax: number,
  targetWeightKg?: number,
): RoutineTargetSet => ({
  id: randomUUID(),
  type,
  targetRepsMin,
  targetRepsMax,
  targetWeightKg: targetWeightKg ?? null,
});

const createLoggedSet = (
  type: WorkoutSet["type"],
  reps: number,
  weightKg: number,
  completedAt: string,
): WorkoutSet => ({
  id: randomUUID(),
  type,
  reps,
  weightKg,
  isComplete: true,
  createdAt: completedAt,
  completedAt,
});

const exercises: Exercise[] = [
  {
    id: "exercise-bench-press",
    slug: "barbell-bench-press",
    name: "Barbell Bench Press",
    category: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: "barbell",
    instructions: [
      "Retract your shoulders and plant your feet before unracking.",
      "Lower the bar to the mid chest with control.",
      "Press back up while keeping wrists stacked over elbows.",
    ],
  },
  {
    id: "exercise-incline-dumbbell-press",
    slug: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    category: "strength",
    muscleGroups: ["chest", "shoulders", "triceps"],
    equipment: "dumbbell",
    instructions: [
      "Set the bench to a low incline and keep your shoulder blades pinned.",
      "Lower dumbbells until elbows are slightly below the bench line.",
      "Drive up without letting the dumbbells drift too far forward.",
    ],
  },
  {
    id: "exercise-lat-pulldown",
    slug: "lat-pulldown",
    name: "Lat Pulldown",
    category: "strength",
    muscleGroups: ["back", "biceps"],
    equipment: "cable",
    instructions: [
      "Brace your torso and keep the ribs down.",
      "Pull elbows toward your back pockets.",
      "Control the eccentric until the lats are fully stretched.",
    ],
  },
  {
    id: "exercise-barbell-row",
    slug: "barbell-row",
    name: "Barbell Row",
    category: "strength",
    muscleGroups: ["back", "biceps"],
    equipment: "barbell",
    instructions: [
      "Hinge at the hips and keep a neutral spine.",
      "Pull the bar into your lower rib cage.",
      "Pause briefly at the top before lowering.",
    ],
  },
  {
    id: "exercise-back-squat",
    slug: "back-squat",
    name: "Back Squat",
    category: "strength",
    muscleGroups: ["quads", "glutes", "core"],
    equipment: "barbell",
    instructions: [
      "Create upper back tension before stepping back.",
      "Sit between the hips while keeping the midfoot loaded.",
      "Drive up with the chest and hips rising together.",
    ],
  },
  {
    id: "exercise-romanian-deadlift",
    slug: "romanian-deadlift",
    name: "Romanian Deadlift",
    category: "strength",
    muscleGroups: ["hamstrings", "glutes", "back"],
    equipment: "barbell",
    instructions: [
      "Push the hips back while keeping the bar close to the thighs.",
      "Stop when hamstrings are fully lengthened without losing position.",
      "Stand tall by squeezing the glutes, not by leaning back.",
    ],
  },
  {
    id: "exercise-leg-press",
    slug: "leg-press",
    name: "Leg Press",
    category: "strength",
    muscleGroups: ["quads", "glutes"],
    equipment: "machine",
    instructions: [
      "Set feet shoulder-width apart in a stable stance.",
      "Lower until knees are deeply bent without the pelvis rolling.",
      "Press evenly through the full foot.",
    ],
  },
  {
    id: "exercise-plank",
    slug: "plank",
    name: "Plank",
    category: "mobility",
    muscleGroups: ["core"],
    equipment: "bodyweight",
    instructions: [
      "Stack shoulders over elbows and squeeze glutes.",
      "Brace the midline as if preparing for a punch.",
      "Keep a straight line from shoulders to ankles.",
    ],
  },
];

const user: User = {
  id: "user-demo",
  name: "Gym Club Demo",
  email: "demo@gymclub.app",
  preferredWeightUnit: "kg",
  createdAt: "2026-03-01T09:00:00.000Z",
};

const pushDayExercises: RoutineExerciseTemplate[] = [
  {
    id: randomUUID(),
    exerciseId: "exercise-bench-press",
    order: 1,
    notes: "Pause the final rep of each working set for one second.",
    restSeconds: 150,
    sets: [
      createSetTemplate("warmup", 8, 8, 40),
      createSetTemplate("working", 6, 8, 70),
      createSetTemplate("working", 6, 8, 70),
      createSetTemplate("working", 6, 8, 70),
    ],
  },
  {
    id: randomUUID(),
    exerciseId: "exercise-incline-dumbbell-press",
    order: 2,
    notes: "Keep the stretch deep and the lockout soft.",
    restSeconds: 90,
    sets: [
      createSetTemplate("working", 8, 10, 26),
      createSetTemplate("working", 8, 10, 26),
      createSetTemplate("working", 8, 10, 26),
    ],
  },
  {
    id: randomUUID(),
    exerciseId: "exercise-plank",
    order: 3,
    notes: "Nasal breathing only.",
    restSeconds: 45,
    sets: [createSetTemplate("working", 1, 1)],
  },
];

const lowerDayExercises: RoutineExerciseTemplate[] = [
  {
    id: randomUUID(),
    exerciseId: "exercise-back-squat",
    order: 1,
    notes: "Belt on top set only.",
    restSeconds: 180,
    sets: [
      createSetTemplate("warmup", 5, 5, 60),
      createSetTemplate("working", 5, 5, 100),
      createSetTemplate("working", 5, 5, 100),
      createSetTemplate("working", 5, 5, 100),
    ],
  },
  {
    id: randomUUID(),
    exerciseId: "exercise-romanian-deadlift",
    order: 2,
    notes: "Tempo the eccentric for three seconds.",
    restSeconds: 120,
    sets: [
      createSetTemplate("working", 8, 10, 80),
      createSetTemplate("working", 8, 10, 80),
      createSetTemplate("working", 8, 10, 80),
    ],
  },
  {
    id: randomUUID(),
    exerciseId: "exercise-leg-press",
    order: 3,
    notes: "Full range, no bouncing in the hole.",
    restSeconds: 90,
    sets: [
      createSetTemplate("working", 10, 12, 160),
      createSetTemplate("working", 10, 12, 160),
      createSetTemplate("working", 10, 12, 160),
    ],
  },
];

const routines: Routine[] = [
  {
    id: "routine-push-a",
    userId: user.id,
    name: "Push A",
    description: "Chest, shoulders, triceps, and core.",
    exercises: pushDayExercises,
    createdAt: "2026-03-20T07:30:00.000Z",
    updatedAt: "2026-03-20T07:30:00.000Z",
  },
  {
    id: "routine-lower-a",
    userId: user.id,
    name: "Lower A",
    description: "Squat-focused lower body day.",
    exercises: lowerDayExercises,
    createdAt: "2026-03-21T07:30:00.000Z",
    updatedAt: "2026-03-21T07:30:00.000Z",
  },
];

const completedWorkoutExercises: WorkoutExercise[] = [
  {
    id: randomUUID(),
    exerciseId: "exercise-bench-press",
    order: 1,
    notes: "Felt strong today.",
    restSeconds: 150,
    sets: [
      createLoggedSet("warmup", 8, 40, "2026-03-30T18:10:00.000Z"),
      createLoggedSet("working", 8, 70, "2026-03-30T18:13:00.000Z"),
      createLoggedSet("working", 7, 70, "2026-03-30T18:16:30.000Z"),
      createLoggedSet("working", 6, 72.5, "2026-03-30T18:20:00.000Z"),
    ],
  },
  {
    id: randomUUID(),
    exerciseId: "exercise-incline-dumbbell-press",
    order: 2,
    notes: "Last set was close to failure.",
    restSeconds: 90,
    sets: [
      createLoggedSet("working", 10, 24, "2026-03-30T18:25:00.000Z"),
      createLoggedSet("working", 9, 24, "2026-03-30T18:27:00.000Z"),
      createLoggedSet("working", 8, 24, "2026-03-30T18:29:30.000Z"),
    ],
  },
];

const workouts: WorkoutSession[] = [
  {
    id: "workout-2026-03-30-push-a",
    userId: user.id,
    routineId: "routine-push-a",
    name: "Push A",
    notes: "First session after deload.",
    status: "completed",
    startedAt: "2026-03-30T18:00:00.000Z",
    completedAt: "2026-03-30T18:35:00.000Z",
    exercises: completedWorkoutExercises,
  },
];

export const createSeedData = (): DatabaseSeed => ({
  currentUser: user,
  exercises,
  routines,
  workouts,
});
