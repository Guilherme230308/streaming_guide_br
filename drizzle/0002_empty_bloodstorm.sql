CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tmdbId` int NOT NULL,
	`mediaType` enum('movie','tv') NOT NULL,
	`rating` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`),
	CONSTRAINT `ratings_userId_tmdbId_mediaType_unique` UNIQUE(`userId`,`tmdbId`,`mediaType`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tmdbId` int NOT NULL,
	`mediaType` enum('movie','tv') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviews_userId_tmdbId_mediaType_unique` UNIQUE(`userId`,`tmdbId`,`mediaType`)
);
--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `ratings` (`userId`);--> statement-breakpoint
CREATE INDEX `tmdbIdIdx` ON `ratings` (`tmdbId`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `reviews` (`userId`);--> statement-breakpoint
CREATE INDEX `tmdbIdIdx` ON `reviews` (`tmdbId`);