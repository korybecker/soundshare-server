const Sound = require("../models/soundModel");
const User = require("../models/userModel");
const Like = require("../models/likeModel");

class LikeService {
    async getLikesForUser(req, res, next) {
        const { userId } = req.params;
        try {
            const data = await Like.find({ user: userId });
            const likes = [];
            for (let like of data) {
                likes.push(like.sound);
            }
            res.json(likes);
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = LikeService;
