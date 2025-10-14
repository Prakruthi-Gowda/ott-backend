-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `subscriptionId` INTEGER NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `status` ENUM('CREATED', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'CREATED',
    `razorpayPaymentId` VARCHAR(191) NULL,
    `notes` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
