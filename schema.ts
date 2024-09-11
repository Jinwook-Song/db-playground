import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  userId: integer('user_id', { mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  username: text('username').notNull(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
});

export const comments = sqliteTable('comments', {
  commentId: integer('comment_id', { mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  payload: text('payload').notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.userId, {
      onDelete: 'cascade',
    }),
});
