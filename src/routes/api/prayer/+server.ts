import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { prayerTopics } from '$lib/server/schema';
import { and, eq, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const result = await db
		.select()
		.from(prayerTopics)
		.orderBy(asc(prayerTopics.category), asc(prayerTopics.slotIndex));

	return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
	const { category, slotIndex, content } = await request.json();

	const existing = await db
		.select()
		.from(prayerTopics)
		.where(and(eq(prayerTopics.category, category), eq(prayerTopics.slotIndex, slotIndex)));

	if (existing.length > 0) {
		const [updated] = await db
			.update(prayerTopics)
			.set({ content, updatedAt: new Date() })
			.where(eq(prayerTopics.id, existing[0].id))
			.returning();
		return json(updated);
	}

	const [created] = await db
		.insert(prayerTopics)
		.values({ category, slotIndex, content })
		.returning();

	return json(created, { status: 201 });
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = Number(url.searchParams.get('id'));
	if (!id) return json({ error: 'id required' }, { status: 400 });

	await db.delete(prayerTopics).where(eq(prayerTopics.id, id));
	return json({ success: true });
};
