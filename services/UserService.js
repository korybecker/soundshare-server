const Sound = require("../models/soundModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const { uploadToPfpBucket } = require("../s3");

// create token in both login and signup functions
const createToken = (_id) => {
    // payload + secret
    return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

class UserService {
    async loginUser(req, res, next) {
        try {
            const { email, password } = req.body;

            // verify email and password and get user
            const user = await User.login(email, password);

            const userId = user._id;

            // create a token
            const token = createToken(userId);
            res.status(200).json({
                name: user.name,
                email,
                username: user.username,
                token,
                userId,
                pfpUrl: user.pfpUrl,
            });
        } catch (err) {
            return next(err);
        }
    }
    async signupUser(req, res, next) {
        try {
            let file = null;
            if (req.files && req.files.file) {
                file = req.files.file;
            }
            const { email, name, username, password } = req.body;

            let pfpUrl;
            if (file) {
                pfpUrl = await uploadToPfpBucket(file);
            } else {
                pfpUrl = "";
            }

            const welcome = `Welcome, ${name}!`;
            const newUser = await User.signup(
                email,
                name,
                username,
                password,
                pfpUrl
            );

            const userId = newUser._id;

            // create token
            const token = createToken(userId);

            res.status(201).json({
                welcome,
                name,
                email,
                username,
                token,
                userId,
                pfpUrl,
            });
        } catch (err) {
            return next(err);
        }
    }
    async getUser(req, res, next) {
        try {
            const { username } = req.params;
            const user = await User.findOne({ username: username }).lean();
            delete user["password"];
            delete user["email"];
            delete user["createdAt"];
            delete user["updatedAt"];

            // Replace _id with userId
            user.userId = user._id.toString();
            delete user["_id"];

            res.status(200).json(user);
        } catch (err) {
            return next(err);
        }
    }
    async deleteUser(userId) {
        // delete user data from document db and pfp from object storage
        return "Delete a User from database";
    }
}

module.exports = UserService;
