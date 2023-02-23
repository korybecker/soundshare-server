const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
    {
        sound: { type: mongoose.Schema.Types.ObjectId, ref: "Sound" },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Like", likeSchema);
