const Sound = require("../models/soundModel");
const User = require("../models/userModel");
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
            const updatedSound = await Sound.findByIdAndUpdate(soundId, {
                title,
                description,
            });
            res.json(updatedSound);
        } catch (err) {
            return next(err);
        }
    }
    async deleteSound(req, res, next) {
        try {
            const { soundId } = req.params;
            const { url } = req.body;
            await Sound.findByIdAndDelete(soundId);
            await deleteFromSoundsBucket(url);
            res.send("delete successful");
        } catch (err) {
            console.error(err);
            return next(err);
        }
    }
}

module.exports = SoundService;
