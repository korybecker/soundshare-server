//    Sound Model

const mongoose = require("mongoose");

const soundSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        url: { type: String, required: true },
        description: { type: String },
        uploadedBy: { type: String },
        likes: { type: Number },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Sound", soundSchema);
