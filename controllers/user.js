//
// user.js
// /api/user controller
//
// Created by Chikuma C., 05/12/2776 AUC
//
const bcrypt = require('bcrypt');
const userRouter = require('express').Router();
const User = require('../models/user');
const signToken = require('../utils/token');

const isUserFollowed = async (loginUserId, userId) => {
    if (!loginUserId) return false; // query takes time, if null return early
    const loginUser = await User.findById(loginUserId);
    return (loginUser.followedUserIds.find(
        id => id.toString() === userId.toString()))? true: false;
};

userRouter.get('/:id', async (request, response) => {
    const user = await User.findById(request.params.id);

    if (user) {
        const responseJson = user.toJSON();
        responseJson.isFollowed = await isUserFollowed(response.locals.userId, user._id);
        response.json(responseJson);
    }
    else response.status(404).end();
});

userRouter.get('/username/:username', async (request, response) => {
    const user = await User.findOne({ username: request.params.username });

    if (user) response.json(user);
    else response.status(404).end();
});

userRouter.post('/', async (request, response, _next) => {
    const user = request.body;

    if (user.password.length < 8) response.status(400).end();

    const passwordHash = await bcrypt.hash(user.password, 10);
    const newUser = new User({
        username: user.username,
        displayName: user.displayName,
        passwordHash: passwordHash,
    });

    await newUser.save();
    const token = signToken(newUser.username, newUser._id);
    response.status(201).json({
        username: newUser.username,
        displayName: newUser.displayName,
        token: token,
    });
});

module.exports = userRouter;