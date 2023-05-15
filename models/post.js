//
// blog.js
// Defines Mongoose schema for a post.
//
// Created by Chikuma C., 05/12/2776 AUC
//
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    context: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    }
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