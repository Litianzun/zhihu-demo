const mongoose = require('mongoose');

// Schema为mongoDB的类
const { Schema, model } = mongoose;

const topicSchema = new Schema({
    __v: { type: Number, select: false },
    name: { type: String, required: true },
    avatar_url: { type: String },
    introduction: { type: String }
})

module.exports = model('Topic', topicSchema);