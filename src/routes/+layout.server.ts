import { seed } from '$lib/server/seed';
import type { LayoutServerLoad } from './$types';

let seeded = false;

export const load: LayoutServerLoad = async () => {
	if (!seeded) {
		try {
			await seed();
			seeded = true;
		} catch (e) {
			console.error('Seed failed:', e);
		}
	}
	return {};
};
