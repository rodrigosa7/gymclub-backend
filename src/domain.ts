export type WeightUnit = "kg" | "lb";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "kettlebell"
  | "cardio"
  | "smith-machine";

export type ExerciseCategory = "strength" | "cardio" | "mobility";
export type SetType = "warmup" | "working" | "dropset" | "failure" | "assisted";
export type WorkoutStatus = "active" | "completed";

export interface User {
  id: string;
  name: string;
  email: string;
  preferredWeightUnit: WeightUnit;
  createdAt: string;
}

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
  instructions: string[];
}

export interface RoutineTargetSet {
  id: string;
  type: SetType;
  targetRepsMin?: number;
  targetRepsMax?: number;
  targetWeightKg?: number | null;
}

export interface RoutineExerciseTemplate {
  id: string;
  exerciseId: string;
  order: number;
  notes: string;
  restSeconds: number;
  sets: RoutineTargetSet[];
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string;
  exercises: RoutineExerciseTemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  id: string;
  type: SetType;
  reps?: number | null;
  weightKg?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  rir?: number | null;
  isComplete: boolean;
  createdAt: string;
  completedAt?: string | null;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  order: number;
  notes: string;
  restSeconds: number;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId?: string | null;
  name: string;
  notes: string;
  status: WorkoutStatus;
  startedAt: string;
  completedAt?: string | null;
  exercises: WorkoutExercise[];
}

export interface FavoriteExercise {
  exerciseId: string;
  name: string;
  loggedSets: number;
}

export interface AnalyticsOverview {
  totalSessions: number;
  totalSets: number;
  totalVolumeKg: number;
  activeStreakDays: number;
  favoriteExercises: FavoriteExercise[];
}

export interface DatabaseSeed {
  currentUser: User;
  exercises: Exercise[];
  routines: Routine[];
  workouts: WorkoutSession[];
}

export interface CreateRoutineInput {
  name: string;
  description?: string;
  exercises: Array<{
    exerciseId: string;
    notes?: string;
    restSeconds?: number;
    sets: Array<{
      type?: SetType;
      targetRepsMin?: number;
      targetRepsMax?: number;
      targetWeightKg?: number | null;
    }>;
  }>;
}

export interface UpdateRoutineInput {
  name?: string;
  description?: string;
  exercises?: CreateRoutineInput["exercises"];
}

export interface StartWorkoutInput {
  name?: string;
  routineId?: string;
  exerciseIds?: string[];
  notes?: string;
}

export interface AddWorkoutExerciseInput {
  exerciseId: string;
  notes?: string;
  restSeconds?: number;
}

export interface AddWorkoutSetInput {
  type?: SetType;
  reps?: number | null;
  weightKg?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  rir?: number | null;
  isComplete?: boolean;
}

export interface UpdateWorkoutSetInput extends AddWorkoutSetInput {}
