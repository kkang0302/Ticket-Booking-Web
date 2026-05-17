-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `expiresAt` DATETIME(3) NULL;

-- AlterTable (add EXPIRED to BookingStatus enum)
ALTER TABLE `bookings` MODIFY `status` ENUM('PENDING', 'RESERVED', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING';
