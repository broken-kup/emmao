import { db } from '$lib/server/db';
import { scriptureVerses } from '$lib/server/schema';
import { asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const verses = await db
		.select()
		.from(scriptureVerses)
		.orderBy(asc(scriptureVerses.week));

	return { verses };
};
