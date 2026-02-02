CREATE TABLE `custom_list_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` int NOT NULL,
	`tmdbId` int NOT NULL,
	`mediaType` enum('movie','tv') NOT NULL,
	`title` varchar(500) NOT NULL,
	`posterPath` varchar(255),
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_list_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `custom_list_items_listId_tmdbId_mediaType_unique` UNIQUE(`listId`,`tmdbId`,`mediaType`)
);
--> statement-breakpoint
CREATE TABLE `custom_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `listIdIdx` ON `custom_list_items` (`listId`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `custom_lists` (`userId`);