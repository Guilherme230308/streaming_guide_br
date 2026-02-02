CREATE TABLE `viewing_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tmdbId` int NOT NULL,
	`mediaType` enum('movie','tv') NOT NULL,
	`title` varchar(500) NOT NULL,
	`posterPath` varchar(255),
	`watchedAt` timestamp NOT NULL DEFAULT (now()),
	`genreIds` text,
	CONSTRAINT `viewing_history_id` PRIMARY KEY(`id`),
	CONSTRAINT `viewing_history_userId_tmdbId_mediaType_unique` UNIQUE(`userId`,`tmdbId`,`mediaType`)
);
--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `viewing_history` (`userId`);--> statement-breakpoint
CREATE INDEX `watchedAtIdx` ON `viewing_history` (`watchedAt`);