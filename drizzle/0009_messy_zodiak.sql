CREATE TABLE `usage_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`hour` int NOT NULL,
	`metricType` enum('tmdb_api_call','tmdb_cache_hit','ai_usage','page_view','search_request') NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usage_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `dateHourTypeIdx` UNIQUE(`date`,`hour`,`metricType`)
);
--> statement-breakpoint
CREATE INDEX `dateIdx` ON `usage_metrics` (`date`);