/*
  Warnings:

  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
*/
-- Step 1: Add column as nullable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT;

-- Step 2: Set placeholder for existing users (they'll need to reset password)
UPDATE "User" SET "passwordHash" = '$2b$10$placeholder_for_existing_user' WHERE "passwordHash" IS NULL;

-- Step 3: Add NOT NULL constraint
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
