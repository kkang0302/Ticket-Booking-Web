/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `idempotencyKey` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `password` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `bookings_idempotencyKey_key` ON `bookings`(`idempotencyKey`);
