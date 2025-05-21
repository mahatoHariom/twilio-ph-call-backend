/*
  Warnings:

  - You are about to drop the column `callSid` on the `CallReservation` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `CallReservation` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `CallReservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CallReservation" DROP COLUMN "callSid",
DROP COLUMN "description",
DROP COLUMN "title";
