//
// blog.js
// Defines Mongoose schema for a post.
//
// Created by Chikuma C., 05/12/2776 AUC
//
const mongoose = require('mongoose');
const Like = require('./like');

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        context: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        strict: false,
    }
);

// 'likes' counted from Likes collections and set to document, this function
// should be used by mongoose middlewares
const setLikeFieldToDoc = async (document) => {
    if (!document) return;
    const likes = await Like.find({ postId: document._id }).count();
    document.set('likes', likes);
};

postSchema.post(['findOne', 'save'], async (document, next) => {
    await setLikeFieldToDoc(document);
    next();
});

postSchema.post(['find'], async (documents, next) => {
    for (let document of documents) {
        await setLikeFieldToDoc(document);
    }
    next();
});

postSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;