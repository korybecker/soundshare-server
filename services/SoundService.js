const Sound = require("../models/soundModel");
const User = require("../models/userModel");
const Like = require("../models/likeModel");

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
            const file = req.files.file;
            const { title, description, uploadedBy } = req.body;

            // upload file to s3, get url back
            const url = await uploadToSoundsBucket(file);
            // add sound document including url to object in s3 bucket
            const newSound = await Sound.create({
                title,
                description,
                url,
                uploadedBy,
            });
            res.status(201).json(newSound);
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
                    .json({ error: { message: "Sound not found" } });
            }

            // check if sound is uploaded by the authorized user
            if (sound.uploadedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    error: {
                        message: "You are not authorized to delete this sound",
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

            // find sound by id
            const sound = await Sound.findById(soundId);

            // check if sound exists
            if (!sound) {
                return res
                    .status(404)
                    .json({ error: { message: "Sound not found" } });
            }

            // check if sound is uploaded by the authorized user
            if (sound.uploadedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    error: {
                        message: "You are not authorized to delete this sound",
                    },
                });
            }

            // delete sound from db and storage bucket
            await Sound.findByIdAndDelete(soundId);
            await deleteFromSoundsBucket(url);

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
                    .json({ error: { message: "Sound not found" } });
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
                    .json({ error: { message: "Sound not found" } });
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
