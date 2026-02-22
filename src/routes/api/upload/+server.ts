import { json } from '@sveltejs/kit';
import { getUploadUrl } from '$lib/server/r2';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { fileName, contentType } = await request.json();
	const key = `posts/${Date.now()}-${fileName}`;
	const uploadUrl = await getUploadUrl(key, contentType);
	return json({ uploadUrl, key });
};
