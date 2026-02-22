import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pairs } from '$lib/server/schema';
import { eq, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const pairKey = url.searchParams.get('pairKey');

	if (pairKey) {
		const result = await db
			.select()
			.from(pairs)
			.where(eq(pairs.pairKey, pairKey));
		return json(result);
	}

	const result = await db
		.select()
		.from(pairs)
		.orderBy(asc(pairs.createdAt));

	return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
	const { mentorName, companionName } = await request.json();

	if (!mentorName?.trim() || !companionName?.trim()) {
		return json({ error: '양육자와 동반자 이름을 모두 입력하세요' }, { status: 400 });
	}

	const pairKey = `${mentorName.trim()}::${companionName.trim()}`;

	const existing = await db
		.select()
		.from(pairs)
		.where(eq(pairs.pairKey, pairKey));

	if (existing.length > 0) {
		return json({ error: '이미 등록된 페어입니다' }, { status: 409 });
	}

	const [created] = await db
		.insert(pairs)
		.values({
			mentorName: mentorName.trim(),
			companionName: companionName.trim(),
			pairKey
		})
		.returning();

	return json(created, { status: 201 });
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = Number(url.searchParams.get('id'));
	if (!id) return json({ error: 'id required' }, { status: 400 });

	await db.delete(pairs).where(eq(pairs.id, id));
	return json({ success: true });
};
