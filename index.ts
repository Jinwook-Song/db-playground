import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { comments, users } from './schema';
import { eq } from 'drizzle-orm';

const sqlite = new Database('users.db');

const db = drizzle(sqlite, { logger: true });

// const result = await db.insert(users).values({ username: 'jw' }).returning();
// const result = await db
//   .update(users)
//   .set({ isAdmin: true })
//   .where(eq(users.userId, 1))
//   .returning();

// const comment = await db
//   .insert(comments)
//   .values({ payload: 'hello drizzle', userId: 1 })
//   .returning();

// const result = await db
//   .select({ paylaod: comments.payload })
//   .from(comments)
//   .where(eq(comments.userId, 1));

const result = await db
  .select()
  .from(comments)
  .leftJoin(users, eq(comments.userId, users.userId));

console.log(result);
