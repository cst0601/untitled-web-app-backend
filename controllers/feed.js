//
// feed.js
// Controller for user post feeds, uri starts with /api/feed
//
// Created by Chikuma C., 05/14/2776 AUC
//
const feedRouter = require('express').Router();

const Post = require('../models/post');
const User = require('../models/user');

feedRouter.get('/', async (request, response, next) => {
    const requestUser = await User.findById(response.locals.userId);
    const queryUserIds = [ ...requestUser.followedUserIds, requestUser._id ];

    const posts = await Post
        .find({
            user : { $in : queryUserIds }
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('user', { username: 1, displayName: 1 });

    response.locals.posts = posts;
    next();
});

feedRouter.get('/:username', async (request, response, next) => {
    const requestUser = await User.findOne({
        username: request.params.username
    });
    const posts = await Post
        .find({ user: requestUser })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('user', { username: 1, displayName: 1 });

    response.locals.posts = posts;
    next();
});

module.exports = feedRouter;