//
// like.js
// Schema of like (post).
//
// Created by Chikuma C., 05/14/2776 AUC
//
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post',
    },
});

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });
const Like = mongoose.model('Like', likeSchema);

module.exports = Like;