import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.workoutSet.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.routineTargetSet.deleteMany();
  await prisma.routineExercise.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: "user-demo",
      name: "Gym Club Demo",
      email: "demo@gymclub.app",
      preferredWeightUnit: "kg",
      createdAt: new Date("2026-03-01T09:00:00.000Z"),
    },
  });

  await prisma.exercise.createMany({
    data: [
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
    ],
  });

  await prisma.routine.create({
    data: {
      id: "routine-push-a",
      userId: "user-demo",
      name: "Push A",
      description: "Chest, shoulders, triceps, and core.",
      createdAt: new Date("2026-03-20T07:30:00.000Z"),
      updatedAt: new Date("2026-03-20T07:30:00.000Z"),
      exercises: {
        create: [
          {
            id: "routine-push-a-bench",
            exerciseId: "exercise-bench-press",
            order: 1,
            notes: "Pause the final rep of each working set for one second.",
            restSeconds: 150,
            sets: {
              create: [
                { id: "routine-push-a-bench-1", order: 1, type: "warmup", targetRepsMin: 8, targetRepsMax: 8, targetWeightKg: 40 },
                { id: "routine-push-a-bench-2", order: 2, type: "working", targetRepsMin: 6, targetRepsMax: 8, targetWeightKg: 70 },
                { id: "routine-push-a-bench-3", order: 3, type: "working", targetRepsMin: 6, targetRepsMax: 8, targetWeightKg: 70 },
                { id: "routine-push-a-bench-4", order: 4, type: "working", targetRepsMin: 6, targetRepsMax: 8, targetWeightKg: 70 },
              ],
            },
          },
          {
            id: "routine-push-a-incline",
            exerciseId: "exercise-incline-dumbbell-press",
            order: 2,
            notes: "Keep the stretch deep and the lockout soft.",
            restSeconds: 90,
            sets: {
              create: [
                { id: "routine-push-a-incline-1", order: 1, type: "working", targetRepsMin: 8, targetRepsMax: 10, targetWeightKg: 26 },
                { id: "routine-push-a-incline-2", order: 2, type: "working", targetRepsMin: 8, targetRepsMax: 10, targetWeightKg: 26 },
                { id: "routine-push-a-incline-3", order: 3, type: "working", targetRepsMin: 8, targetRepsMax: 10, targetWeightKg: 26 },
              ],
            },
          },
          {
            id: "routine-push-a-plank",
            exerciseId: "exercise-plank",
            order: 3,
            notes: "Nasal breathing only.",
            restSeconds: 45,
            sets: {
              create: [{ id: "routine-push-a-plank-1", order: 1, type: "working", targetRepsMin: 1, targetRepsMax: 1 }],
            },
          },
        ],
      },
    },
  });

  await prisma.routine.create({
    data: {
      id: "routine-lower-a",
      userId: "user-demo",
      name: "Lower A",
      description: "Squat-focused lower body day.",
      createdAt: new Date("2026-03-21T07:30:00.000Z"),
      updatedAt: new Date("2026-03-21T07:30:00.000Z"),
      exercises: {
        create: [
          {
            id: "routine-lower-a-squat",
            exerciseId: "exercise-back-squat",
            order: 1,
            notes: "Belt on top set only.",
            restSeconds: 180,
            sets: {
              create: [
                { id: "routine-lower-a-squat-1", order: 1, type: "warmup", targetRepsMin: 5, targetRepsMax: 5, targetWeightKg: 60 },
                { id: "routine-lower-a-squat-2", order: 2, type: "working", targetRepsMin: 5, targetRepsMax: 5, targetWeightKg: 100 },
                { id: "routine-lower-a-squat-3", order: 3, type: "working", targetRepsMin: 5, targetRepsMax: 5, targetWeightKg: 100 },
                { id: "routine-lower-a-squat-4", order: 4, type: "working", targetRepsMin: 5, targetRepsMax: 5, targetWeightKg: 100 },
              ],
            },
          },
          {
            id: "routine-lower-a-rdl",
            exerciseId: "exercise-romanian-deadlift",
            order: 2,
            notes: "Tempo the eccentric for three seconds.",
            restSeconds: 120,
            sets: {
              create: [
                { id: "routine-lower-a-rdl-1", order: 1, type: "working", targetRepsMin: 8, targetRepsMax: 10, targetWeightKg: 80 },
                { id: "routine-lower-a-rdl-2", order: 2, type: "working", targetRepsMin: 8, targetRepsMax: 10, targetWeightKg: 80 },
                { id: "routine-lower-a-rdl-3", order: 3, type: "working", targetRepsMin: 8, targetRepsMax: 10, targetWeightKg: 80 },
              ],
            },
          },
          {
            id: "routine-lower-a-legpress",
            exerciseId: "exercise-leg-press",
            order: 3,
            notes: "Full range, no bouncing in the hole.",
            restSeconds: 90,
            sets: {
              create: [
                { id: "routine-lower-a-legpress-1", order: 1, type: "working", targetRepsMin: 10, targetRepsMax: 12, targetWeightKg: 160 },
                { id: "routine-lower-a-legpress-2", order: 2, type: "working", targetRepsMin: 10, targetRepsMax: 12, targetWeightKg: 160 },
                { id: "routine-lower-a-legpress-3", order: 3, type: "working", targetRepsMin: 10, targetRepsMax: 12, targetWeightKg: 160 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.workout.create({
    data: {
      id: "workout-2026-03-30-push-a",
      userId: "user-demo",
      routineId: "routine-push-a",
      name: "Push A",
      notes: "First session after deload.",
      status: "completed",
      startedAt: new Date("2026-03-30T18:00:00.000Z"),
      completedAt: new Date("2026-03-30T18:35:00.000Z"),
      exercises: {
        create: [
          {
            id: "workout-2026-03-30-bench",
            exerciseId: "exercise-bench-press",
            order: 1,
            notes: "Felt strong today.",
            restSeconds: 150,
            sets: {
              create: [
                { id: "workout-2026-03-30-bench-1", order: 1, type: "warmup", reps: 8, weightKg: 40, isComplete: true, createdAt: new Date("2026-03-30T18:10:00.000Z"), completedAt: new Date("2026-03-30T18:10:00.000Z") },
                { id: "workout-2026-03-30-bench-2", order: 2, type: "working", reps: 8, weightKg: 70, isComplete: true, createdAt: new Date("2026-03-30T18:13:00.000Z"), completedAt: new Date("2026-03-30T18:13:00.000Z") },
                { id: "workout-2026-03-30-bench-3", order: 3, type: "working", reps: 7, weightKg: 70, isComplete: true, createdAt: new Date("2026-03-30T18:16:30.000Z"), completedAt: new Date("2026-03-30T18:16:30.000Z") },
                { id: "workout-2026-03-30-bench-4", order: 4, type: "working", reps: 6, weightKg: 72.5, isComplete: true, createdAt: new Date("2026-03-30T18:20:00.000Z"), completedAt: new Date("2026-03-30T18:20:00.000Z") },
              ],
            },
          },
          {
            id: "workout-2026-03-30-incline",
            exerciseId: "exercise-incline-dumbbell-press",
            order: 2,
            notes: "Last set was close to failure.",
            restSeconds: 90,
            sets: {
              create: [
                { id: "workout-2026-03-30-incline-1", order: 1, type: "working", reps: 10, weightKg: 24, isComplete: true, createdAt: new Date("2026-03-30T18:25:00.000Z"), completedAt: new Date("2026-03-30T18:25:00.000Z") },
                { id: "workout-2026-03-30-incline-2", order: 2, type: "working", reps: 9, weightKg: 24, isComplete: true, createdAt: new Date("2026-03-30T18:27:00.000Z"), completedAt: new Date("2026-03-30T18:27:00.000Z") },
                { id: "workout-2026-03-30-incline-3", order: 3, type: "working", reps: 8, weightKg: 24, isComplete: true, createdAt: new Date("2026-03-30T18:29:30.000Z"), completedAt: new Date("2026-03-30T18:29:30.000Z") },
              ],
            },
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
