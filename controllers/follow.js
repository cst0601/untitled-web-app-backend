//
// follow.js
// Handles follow / unfollow operations, uri starts with /api/follow.
//
// Created by Chikuma C., 05/14/2776 AUC
//
const followRouter = require('express').Router();

const User = require('../models/user');

followRouter.post('/:id', async (request, response) => {
    const followedUser = await User.findById(request.params.id);
    if (!followedUser) {
        return response.status(400).json({
            error: 'user does not exist.',
        });
    }
    else if (followedUser._id.toString() === response.locals.userId) {
        return response.status(400).json({
            error: 'cannot follow yourself.',
        });
    }

    await User.findByIdAndUpdate(
        response.locals.userId,
        { $addToSet: { followedUserIds: followedUser._id } }
    );

    response.status(200).end();
});

module.exports = followRouter;