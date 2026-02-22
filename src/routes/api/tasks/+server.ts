import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { taskChecks } from '$lib/server/schema';
import { and, eq, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const pairKey = url.searchParams.get('pairKey') || '';

	const result = await db
		.select()
		.from(taskChecks)
		.where(eq(taskChecks.pairKey, pairKey))
		.orderBy(asc(taskChecks.week), asc(taskChecks.taskType));

	return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
	const { pairKey, week, taskType, completed } = await request.json();

	const existing = await db
		.select()
		.from(taskChecks)
		.where(
			and(
				eq(taskChecks.pairKey, pairKey),
				eq(taskChecks.week, week),
				eq(taskChecks.taskType, taskType)
			)
		);

	if (existing.length > 0) {
		const [updated] = await db
			.update(taskChecks)
			.set({ completed, updatedAt: new Date() })
			.where(eq(taskChecks.id, existing[0].id))
			.returning();
		return json(updated);
	}

	const [created] = await db
		.insert(taskChecks)
		.values({ pairKey, week, taskType, completed })
		.returning();

	return json(created, { status: 201 });
};
