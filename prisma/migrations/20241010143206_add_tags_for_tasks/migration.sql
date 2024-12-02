/*
  Warnings:

  - The `tags` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TaskTag" AS ENUM ('Work', 'Personal', 'Urgent', 'Important', 'Project', 'Meeting', 'FollowUp', 'Waiting', 'Delegated', 'Health', 'Finance', 'Learning', 'Home', 'Errand', 'Planning');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "tags",
ADD COLUMN     "tags" "TaskTag"[];
