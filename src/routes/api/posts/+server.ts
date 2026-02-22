import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { posts, likes, comments } from '$lib/server/schema';
import { desc, eq, sql, and } from 'drizzle-orm';
import { deleteObject } from '$lib/server/r2';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const limit = Number(url.searchParams.get('limit')) || 20;
	const offset = Number(url.searchParams.get('offset')) || 0;
	const pairKey = url.searchParams.get('pairKey') || '';

	const conditions = pairKey ? eq(posts.pairKey, pairKey) : undefined;

	const result = await db
		.select({
			id: posts.id,
			pairKey: posts.pairKey,
			authorName: posts.authorName,
			category: posts.category,
			type: posts.type,
			content: posts.content,
			imageKey: posts.imageKey,
			caption: posts.caption,
			createdAt: posts.createdAt,
			likeCount: sql<number>`(SELECT COUNT(*) FROM likes WHERE likes.post_id = ${posts.id})`,
			commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE comments.post_id = ${posts.id})`
		})
		.from(posts)
		.where(conditions)
		.orderBy(desc(posts.createdAt))
		.limit(limit)
		.offset(offset);

	return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { pairKey, authorName, category, type, content, imageKey, caption } = body;

	const [post] = await db
		.insert(posts)
		.values({ pairKey, authorName, category, type, content, imageKey, caption })
		.returning();

	return json(post, { status: 201 });
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = Number(url.searchParams.get('id'));
	if (!id) return json({ error: 'id required' }, { status: 400 });

	const [post] = await db.select().from(posts).where(eq(posts.id, id));
	if (!post) return json({ error: 'not found' }, { status: 404 });

	if (post.imageKey) {
		try {
			await deleteObject(post.imageKey);
		} catch (e) {
			console.error('R2 delete failed:', e);
		}
	}

	await db.delete(posts).where(eq(posts.id, id));
	return json({ success: true });
};
