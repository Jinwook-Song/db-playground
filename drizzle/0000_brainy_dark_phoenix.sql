CREATE TABLE `comments` (
	`comment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payload` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL
);
