const S3 = require("aws-sdk/clients/s3");
const { randomBytes } = require("crypto");

const soundsBucketName = process.env.S3_SOUND_BUCKET_NAME;
const soundsRegion = process.env.S3_SOUND_BUCKET_REGION;

const pfpBucketName = process.env.S3_PFP_BUCKET_NAME;
const pfpBucketRegion = process.env.S3_PFP_BUCKET_REGION;

const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;

const soundS3 = new S3({
    soundsRegion,
    accessKeyId,
    secretAccessKey,
});

const pfpS3 = new S3({
    pfpBucketRegion,
    accessKeyId,
    secretAccessKey,
});

const uploadToPfpBucket = async (file) => {
    if (!file) {
        return "";
    }
    const rawBytes = randomBytes(16);
    const fileName = rawBytes.toString("hex");

    const uploadParams = {
        Bucket: pfpBucketName,
        Body: file.data,
        Key: fileName,
    };

    const data = await pfpS3.upload(uploadParams).promise();
    return data.Location;
};

// upload file to S3
const uploadToSoundsBucket = async (file) => {
    if (!file) {
        return "";
    }
    const rawBytes = randomBytes(16);
    const fileName = rawBytes.toString("hex");

    const uploadParams = {
        Bucket: soundsBucketName,
        Body: file.data,
        Key: fileName,
    };

    const data = await soundS3.upload(uploadParams).promise();
    return data.Location;
};

// delete file from S3
const deleteFromSoundsBucket = async (url) => {
    const key = url.split(".com/")[1];

    const deleteParams = {
        Bucket: soundsBucketName,
        Key: key,
    };
    await soundS3.deleteObject(deleteParams).promise();
};

module.exports.uploadToSoundsBucket = uploadToSoundsBucket;
module.exports.uploadToPfpBucket = uploadToPfpBucket;
module.exports.deleteFromSoundsBucket = deleteFromSoundsBucket;
