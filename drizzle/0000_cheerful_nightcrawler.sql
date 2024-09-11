-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `movies` (
	`movie_id` integer PRIMARY KEY,
	`title` text,
	`original_title` text,
	`original_language` text,
	`overview` text,
	`release_date` integer,
	`revenue` integer,
	`budget` integer,
	`homepage` text,
	`runtime` integer,
	`rating` real,
	`status` text,
	`country` text,
	`genres` text,
	`director` text,
	`spoken_languages` text
);
--> statement-breakpoint
CREATE INDEX `idx_release_rating` ON `movies` (`release_date`,`rating`);
*/