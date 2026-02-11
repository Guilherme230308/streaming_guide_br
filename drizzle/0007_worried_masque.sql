CREATE TABLE `availability_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`tmdbId` int NOT NULL,
	`mediaType` enum('movie','tv') NOT NULL,
	`title` varchar(500) NOT NULL,
	`reportType` enum('wrong_provider','missing_provider','wrong_price','broken_link','other') NOT NULL,
	`providerName` varchar(255),
	`comment` text,
	`status` enum('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availability_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `tmdbIdIdx` ON `availability_reports` (`tmdbId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `availability_reports` (`status`);--> statement-breakpoint
CREATE INDEX `createdAtIdx` ON `availability_reports` (`createdAt`);