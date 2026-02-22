import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '$env/dynamic/private';

function getR2Client() {
	return new S3Client({
		region: 'auto',
		endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: env.R2_ACCESS_KEY_ID!,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY!
		}
	});
}

export async function getUploadUrl(key: string, contentType: string) {
	const client = getR2Client();
	const command = new PutObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: key,
		ContentType: contentType
	});
	const url = await getSignedUrl(client, command, { expiresIn: 600 });
	return url;
}

export async function deleteObject(key: string) {
	const client = getR2Client();
	const command = new DeleteObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: key
	});
	await client.send(command);
}

export function getPublicUrl(key: string) {
	return `${env.R2_PUBLIC_URL}/${key}`;
}
