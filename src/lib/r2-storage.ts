import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

const accountId = process.env.R2_ACCOUNT_ID || ''
const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''
export const bucketName = process.env.R2_BUCKET_NAME || 'choutuppal-media'

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.warn('R2 storage credentials are not fully configured in environment variables.')
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

/**
 * Uploads a buffer or file to Cloudflare R2
 * @param buffer File buffer to upload
 * @param key The destination path/filename in the bucket (e.g. 'listings/image.jpg')
 * @param contentType The mime type of the file
 */
export async function uploadToR2(buffer: Buffer | Uint8Array, key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })

  await r2Client.send(command)

  // We return a relative API path to serve the media securely from our Next.js backend
  // without exposing private S3 URLs or needing to hardcode the Cloudflare pub-<hash>.r2.dev URL.
  return `/api/media?key=${encodeURIComponent(key)}`
}
