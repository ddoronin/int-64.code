import AWS from 'aws-sdk';

export class S3Adapter {
  s3: AWS.S3;
  bucket: string;
  constructor(opts: { bucket: string; region?: string }) {
    const { bucket, region } = opts;
    this.bucket = bucket;
    this.s3 = new AWS.S3({ region });
  }

  async upload(key: string, buf: Buffer, contentType = 'application/pdf') {
    if (!this.bucket) throw new Error('S3_BUCKET not configured');
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: buf,
      ContentType: contentType,
      ACL: 'private',
    };
    await this.s3.putObject(params).promise();
    // Return object key; generating signed URL left to caller
    return `s3://${this.bucket}/${key}`;
  }
}

export default S3Adapter;
