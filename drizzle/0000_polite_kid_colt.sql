CREATE TABLE `payments` (
	`id` varchar(36) NOT NULL,
	`transaction_id` varchar(36) NOT NULL,
	`method` enum('tunai','qris','transfer') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`cash_received` decimal(12,2),
	`change_amount` decimal(12,2),
	`status` enum('PENDING','CONFIRMED','FAILED') NOT NULL DEFAULT 'PENDING',
	`confirmed_by` varchar(36),
	`confirmed_at` datetime,
	`created_at` datetime NOT NULL DEFAULT '2026-09-03 08:03:28.767',
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_transaction_id_unique` UNIQUE(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` varchar(100) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`created_at` datetime NOT NULL DEFAULT '2026-09-03 08:03:28.766',
	`updated_at` datetime NOT NULL DEFAULT '2026-09-03 08:03:28.766',
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction_items` (
	`id` varchar(36) NOT NULL,
	`transaction_id` varchar(36) NOT NULL,
	`service_id` varchar(50) NOT NULL,
	`service_name` varchar(100) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`subtotal` decimal(12,2) NOT NULL,
	CONSTRAINT `transaction_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(36) NOT NULL,
	`transaction_number` varchar(30) NOT NULL,
	`customer_id` varchar(36) NOT NULL,
	`capster_id` varchar(36),
	`subtotal` decimal(12,2) NOT NULL,
	`discount` decimal(12,2) NOT NULL DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`status` enum('PENDING_CAPSTER','ACCEPTED','IN_PROGRESS','WAITING_PAYMENT','PAYMENT_CONFIRMED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING_CAPSTER',
	`notes` text,
	`created_at` datetime NOT NULL DEFAULT '2026-09-03 08:03:28.767',
	`updated_at` datetime NOT NULL DEFAULT '2026-09-03 08:03:28.767',
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transaction_number_unique` UNIQUE(`transaction_number`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(150) NOT NULL,
	`phone` varchar(20),
	`role` enum('customer','capster') NOT NULL,
	`capster_role` varchar(100),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`created_at` datetime NOT NULL DEFAULT '2026-09-03 08:03:28.766',
	`updated_at` datetime NOT NULL DEFAULT '2026-09-03 08:03:28.766',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `payments_transaction_idx` ON `payments` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `payments_confirmed_by_idx` ON `payments` (`confirmed_by`);--> statement-breakpoint
CREATE INDEX `transaction_items_transaction_idx` ON `transaction_items` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `transaction_items_service_idx` ON `transaction_items` (`service_id`);--> statement-breakpoint
CREATE INDEX `transactions_customer_idx` ON `transactions` (`customer_id`);--> statement-breakpoint
CREATE INDEX `transactions_capster_idx` ON `transactions` (`capster_id`);--> statement-breakpoint
CREATE INDEX `transactions_status_idx` ON `transactions` (`status`);--> statement-breakpoint
CREATE INDEX `transactions_created_at_idx` ON `transactions` (`created_at`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);