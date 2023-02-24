const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        pfpUrl: { type: String },
        hasSounds: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// static login method
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });

    if (!user) {
        throw Error("Incorrect email");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw Error("Incorrect password");
    }
    return user;
};

// static signup method
userSchema.statics.signup = async function (
    email,
    name,
    username,
    password,
    pfpUrl
) {
    // check if email exists
    const exists = await this.findOne({ email });

    if (exists) {
        throw Error("Email already in use");
    }

    // hash password with bcrypt
    // salt - add chars to end of password before encrypt (same passwords, different salts)
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.create({
        email,
        name,
        username,
        password: hashedPassword,
        pfpUrl,
    });

    return user;
};

module.exports = mongoose.model("User", userSchema);
