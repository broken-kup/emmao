import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { likes } from '$lib/server/schema';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { postId, userName } = await request.json();

	const existing = await db
		.select()
		.from(likes)
		.where(and(eq(likes.postId, postId), eq(likes.userName, userName)));

	if (existing.length > 0) {
		await db.delete(likes).where(eq(likes.id, existing[0].id));
		return json({ liked: false });
	}

	await db.insert(likes).values({ postId, userName });
	return json({ liked: true });
};

export const GET: RequestHandler = async ({ url }) => {
	const postId = Number(url.searchParams.get('postId'));
	const userName = url.searchParams.get('userName') || '';

	const result = await db
		.select()
		.from(likes)
		.where(eq(likes.postId, postId));

	const userLiked = result.some((l) => l.userName === userName);
	return json({ count: result.length, userLiked });
};
