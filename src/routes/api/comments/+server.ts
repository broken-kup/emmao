import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { comments } from '$lib/server/schema';
import { eq, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const postId = Number(url.searchParams.get('postId'));
	if (!postId) return json([]);

	const result = await db
		.select()
		.from(comments)
		.where(eq(comments.postId, postId))
		.orderBy(asc(comments.createdAt));

	return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
	const { postId, authorName, content } = await request.json();

	const [comment] = await db
		.insert(comments)
		.values({ postId, authorName, content })
		.returning();

	return json(comment, { status: 201 });
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = Number(url.searchParams.get('id'));
	if (!id) return json({ error: 'id required' }, { status: 400 });

	await db.delete(comments).where(eq(comments.id, id));
	return json({ success: true });
};
