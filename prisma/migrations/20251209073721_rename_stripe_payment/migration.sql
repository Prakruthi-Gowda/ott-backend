/*
  Warnings:

  - You are about to drop the column `razorpayPaymentId` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `payment` DROP COLUMN `razorpayPaymentId`,
    ADD COLUMN `stripePaymentId` VARCHAR(191) NULL;
