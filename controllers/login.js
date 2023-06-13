//
// login.js
// Controller for login, uri starts with /api/login.
//
// Created by Chikuma C., 05/12/2776 AUC
//
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');
const signToken = require('../utils/token');

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body;
    const user = await User.findOne({ username });
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash);

    if (!user || !passwordCorrect) {
        return response.status(401).json({
            error: 'invalid username or password'
        });
    }

    const token = signToken(user.username, user._id);

    response
        .status(200)
        .send({
            token: token,
            username: user.username,
            displayName: user.displayName,
        });
});

module.exports = loginRouter;