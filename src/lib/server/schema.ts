import {
	pgTable,
	serial,
	varchar,
	text,
	boolean,
	integer,
	timestamp,
	unique
} from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
	id: serial('id').primaryKey(),
	authorName: varchar('author_name', { length: 50 }).notNull(),
	type: varchar('type', { length: 20 }).notNull(),
	content: text('content'),
	imageKey: varchar('image_key', { length: 500 }),
	caption: text('caption'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const likes = pgTable(
	'likes',
	{
		id: serial('id').primaryKey(),
		postId: integer('post_id')
			.references(() => posts.id, { onDelete: 'cascade' })
			.notNull(),
		userName: varchar('user_name', { length: 50 }).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(t) => [unique().on(t.postId, t.userName)]
);

export const comments = pgTable('comments', {
	id: serial('id').primaryKey(),
	postId: integer('post_id')
		.references(() => posts.id, { onDelete: 'cascade' })
		.notNull(),
	authorName: varchar('author_name', { length: 50 }).notNull(),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const prayerTopics = pgTable('prayer_topics', {
	id: serial('id').primaryKey(),
	category: varchar('category', { length: 20 }).notNull(),
	slotIndex: integer('slot_index').notNull(),
	content: text('content').notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const scriptureVerses = pgTable('scripture_verses', {
	id: serial('id').primaryKey(),
	week: integer('week').notNull(),
	topic: varchar('topic', { length: 100 }).notNull(),
	verse1Ref: varchar('verse1_ref', { length: 100 }).notNull(),
	verse1Text: text('verse1_text').notNull(),
	verse2Ref: varchar('verse2_ref', { length: 100 }).notNull(),
	verse2Text: text('verse2_text').notNull()
});

export const taskChecks = pgTable(
	'task_checks',
	{
		id: serial('id').primaryKey(),
		week: integer('week').notNull(),
		taskType: varchar('task_type', { length: 30 }).notNull(),
		completed: boolean('completed').default(false).notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(t) => [unique().on(t.week, t.taskType)]
);
