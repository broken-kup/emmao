import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { meetingDates } from '$lib/server/schema';
import { and, eq, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const pairKey = url.searchParams.get('pairKey') || '';

	const result = await db
		.select()
		.from(meetingDates)
		.where(eq(meetingDates.pairKey, pairKey))
		.orderBy(asc(meetingDates.week));

	return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
	const { pairKey, week, meetingDate } = await request.json();

	const existing = await db
		.select()
		.from(meetingDates)
		.where(
			and(
				eq(meetingDates.pairKey, pairKey),
				eq(meetingDates.week, week)
			)
		);

	if (existing.length > 0) {
		const [updated] = await db
			.update(meetingDates)
			.set({ meetingDate, updatedAt: new Date() })
			.where(eq(meetingDates.id, existing[0].id))
			.returning();
		return json(updated);
	}

	const [created] = await db
		.insert(meetingDates)
		.values({ pairKey, week, meetingDate })
		.returning();

	return json(created, { status: 201 });
};
