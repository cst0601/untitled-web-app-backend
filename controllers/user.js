//
// user.js
// /api/user controller
//
// Created by Chikuma C., 05/12/2776 AUC
//
const bcrypt = require('bcrypt');
const userRouter = require('express').Router();
const User = require('../models/user');

userRouter.get('/:id', async (request, response) => {
    const user = await User
        .findById(request.params.id);

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
    response.status(201).json(newUser);
});

module.exports = userRouter;