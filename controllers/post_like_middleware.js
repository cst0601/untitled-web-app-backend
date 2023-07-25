//
// post_like_middleware.js
// Middleware to add "is post like" field to all post if user is logged in.
//
// Created by Chikuma 07/22/2776 AUC
//
const postLikeRouter = require('express').Router();

const Like = require('../models/like');

const addLike = async (post, loggedInUserId) => {
    const like = await Like.findOne({ postId: post.id, userId: loggedInUserId });
    return { ...post.toJSON(), liked: like !== null };
};

const addLikeIfLogin = async (request, response) => {
    const userId = response.locals.userId;
    let posts = response.locals.posts;
    let statusCode = (response.locals.status)? response.locals.status: 200;

    posts = await Promise.all(posts.map(post => addLike(post, userId)));

    response.status(statusCode).json(posts);
};

const addOneLikeIfLogin = async (request, response) => {
    const userId = response.locals.userId;
    let post = response.locals.post;
    let statusCode = (response.locals.status)? response.locals.status: 200;

    post = await addLike(post, userId);
    response.status(statusCode).json(post);
};

postLikeRouter.get('/api/feed', addLikeIfLogin);
postLikeRouter.get('/api/feed/:username', addLikeIfLogin);

postLikeRouter.get('/api/post/:id', addOneLikeIfLogin);
postLikeRouter.post('/api/post', addOneLikeIfLogin);
postLikeRouter.put('/api/post/like/:id', addOneLikeIfLogin);
postLikeRouter.delete('/api/post/like/:id', addOneLikeIfLogin);

module.exports = postLikeRouter;