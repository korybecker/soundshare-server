const Sound = require("../models/soundModel");
const User = require("../models/userModel");
const Like = require("../models/likeModel");
const NodeID3 = require("node-id3");
const { promisify } = require("util");
const stream = require("stream");
const pipeline = promisify(stream.pipeline);
const { S3 } = require("aws-sdk");
const soundsBucketName = process.env.S3_SOUND_BUCKET_NAME;
const soundsRegion = process.env.S3_SOUND_BUCKET_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;
const s3 = new S3({
    soundsRegion,
    accessKeyId,
    secretAccessKey,
});

const { uploadToSoundsBucket, deleteFromSoundsBucket } = require("../s3");

class SoundService {
    async getAllSounds(req, res, next) {
        try {
            const allSounds = await Sound.find().lean();
            for (let i = 0; i < allSounds.length; i++) {
                const sound = allSounds[i];

                const user = await User.findById(sound.uploadedBy);

                sound["pfpUrl"] = user.pfpUrl;
                sound["name"] = user.name;
                sound["username"] = user.username;
                allSounds[i] = sound;
            }
            res.json(allSounds);
        } catch (err) {
            return next(err);
        }
    }
    async getSoundsForUser(req, res, next) {
        const { userId } = req.params;
        try {
            const userSounds = await Sound.find({ uploadedBy: userId });
            res.json(userSounds);
        } catch (err) {
            return next(err);
        }
    }
    async getSound(req, res, next) {
        try {
            const { soundId } = req.params;
            const sound = await Sound.findById(soundId);
            res.status(200).json(sound);
        } catch (err) {
            return next(err);
        }
    }
    async addSound(req, res, next) {
        try {
            const file = req.file;
            const userId = req.user._id;
            const { title, description } = req.body;

            // authorize user can upload
            const user = await User.findById(userId);
            if (!user) {
                return res.status(500).json({
                    error: "User does not exist. Only authorized users can upload sounds.",
                });
            }

            // upload file to s3, get url back
            const url = await uploadToSoundsBucket(file.buffer);
            // add sound document including url to object in s3 bucket
            const newSound = await Sound.create({
                title,
                description,
                url,
                uploadedBy: userId,
            });

            await user.updateOne({ hasSounds: true });

            res.status(201).json(newSound);
        } catch (err) {
            return next(err);
        }
    }
    async downloadSound(req, res, next) {
        try {
            const { soundId } = req.params;
            const sound = await Sound.findById(soundId);
            if (!sound) {
                return res.status(404).json({ error: "Sound not found." });
            }

            const params = {
                Bucket: soundsBucketName,
                Key: sound.url.split(".com/")[1],
            };
            const s3Object = await s3.getObject(params).promise();
            const audioBuffer = s3Object.Body;

            const tags = {
                title: sound.title,
            };

            const updatedBuffer = NodeID3.write(tags, audioBuffer);

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${sound.title}.mp3"`
            );
            res.setHeader("Content-Type", "audio/mpeg");
            const readStream = new stream.PassThrough();
            readStream.end(updatedBuffer);

            readStream.pipe(res);
        } catch (err) {
            return next(err);
        }
    }
    async updateSound(req, res, next) {
        try {
            const { soundId } = req.params;
            const { title, description } = req.body;

            // find sound by id
            const sound = await Sound.findById(soundId);

            // check if sound exists
            if (!sound) {
                return res
                    .status(404)
                    .json({ error: { message: "Sound not found." } });
            }

            // check if sound is uploaded by the authorized user
            if (sound.uploadedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    error: {
                        message: "You are not authorized to update this sound.",
                    },
                });
            }
            const updatedSound = await Sound.findByIdAndUpdate(
                soundId,
                {
                    title,
                    description,
                },
                { new: true }
            );

            res.json(updatedSound);
        } catch (err) {
            return next(err);
        }
    }
    async deleteSound(req, res, next) {
        try {
            const { soundId } = req.params;
            const { url } = req.body;
            const userId = req.user._id;

            // find sound by id
            const sound = await Sound.findById(soundId).populate("uploadedBy");

            // check if sound exists
            if (!sound) {
                return res
                    .status(404)
                    .json({ error: { message: "Sound not found." } });
            }

            // check if sound is uploaded by the authorized user
            if (sound.uploadedBy.toString() !== userId.toString()) {
                return res.status(403).json({
                    error: {
                        message: "You are not authorized to delete this sound.",
                    },
                });
            }

            // delete sound from db and storage bucket
            await Sound.findByIdAndDelete(soundId);
            await deleteFromSoundsBucket(url);

            // delete likes associated with sound
            await Like.deleteMany({ sound: soundId });

            const userSounds = await Sound.find({ user: userId });
            if (userSounds.length === 0) {
                await User.updateOne({ _id: userId }, { hasSounds: false });
            }

            res.send("delete successful");
        } catch (err) {
            console.error(err);
            return next(err);
        }
    }
    async like(req, res, next) {
        const { soundId } = req.params;

        try {
            const userId = req.user._id;
            const sound = await Sound.findById(soundId);

            // check if sound DNE
            if (!sound) {
                return res
                    .status(404)
                    .json({ error: { message: "Sound not found." } });
            }

            const like = await Like.create({ sound: soundId, user: userId });

            sound.likes++;
            await sound.save();

            res.json(like);
        } catch (err) {
            console.error(err);
            return next(err);
        }
    }
    async unlike(req, res, next) {
        const { soundId } = req.params;

        try {
            const userId = req.user._id;
            const sound = await Sound.findById(soundId);

            // check if sound DNE
            if (!sound) {
                return res
                    .status(404)
                    .json({ error: { message: "Sound not found." } });
            }

            const like = await Like.deleteOne({ sound: soundId, user: userId });

            sound.likes--;
            await sound.save();

            res.json(like);
        } catch (err) {
            console.error(err);
            return next(err);
        }
    }
}

module.exports = SoundService;
