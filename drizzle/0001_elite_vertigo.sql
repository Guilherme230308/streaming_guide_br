CREATE TABLE `affiliate_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`tmdbId` int NOT NULL,
	`mediaType` enum('movie','tv') NOT NULL,
	`providerId` int NOT NULL,
	`providerName` varchar(255) NOT NULL,
	`clickType` enum('rent','buy','stream') NOT NULL,
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	`userAgent` text,
	CONSTRAINT `affiliate_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tmdbId` int NOT NULL,
	`mediaType` enum('movie','tv') NOT NULL,
	`title` varchar(500) NOT NULL,
	`providerId` int,
	`providerName` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`notified` boolean NOT NULL DEFAULT false,
	`notifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cached_providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tmdbId` int NOT NULL,
	`mediaType` enum('movie','tv') NOT NULL,
	`countryCode` varchar(2) NOT NULL DEFAULT 'BR',
	`providersData` text NOT NULL,
	`cachedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `cached_providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `cached_providers_tmdbId_mediaType_countryCode_unique` UNIQUE(`tmdbId`,`mediaType`,`countryCode`)
);
--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`providerId` int NOT NULL,
	`providerName` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_subscriptions_userId_providerId_unique` UNIQUE(`userId`,`providerId`)
);
--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tmdbId` int NOT NULL,
	`mediaType` enum('movie','tv') NOT NULL,
	`title` varchar(500) NOT NULL,
	`posterPath` varchar(255),
	`releaseDate` varchar(50),
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlist_id` PRIMARY KEY(`id`),
	CONSTRAINT `watchlist_userId_tmdbId_mediaType_unique` UNIQUE(`userId`,`tmdbId`,`mediaType`)
);
--> statement-breakpoint
CREATE INDEX `tmdbIdIdx` ON `affiliate_clicks` (`tmdbId`);--> statement-breakpoint
CREATE INDEX `clickedAtIdx` ON `affiliate_clicks` (`clickedAt`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `alerts` (`userId`);--> statement-breakpoint
CREATE INDEX `activeIdx` ON `alerts` (`isActive`,`notified`);--> statement-breakpoint
CREATE INDEX `expiresAtIdx` ON `cached_providers` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `user_subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `watchlist` (`userId`);--> statement-breakpoint
CREATE INDEX `tmdbIdIdx` ON `watchlist` (`tmdbId`);