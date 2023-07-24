//
// login_util.js
// Test helper for login user.
//
// Created by Chikuma C., 07/24/2776 AUC
//
const bcrypt = require('bcrypt');
const User = require('../models/user');
const signToken = require('../utils/token');

const loginUser = async (username='chikuma', password='123456789') => {
    const user = await User.findOne({ username });
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash);

    if (!user || !passwordCorrect) {
        throw new Error('login failed');
    }

    const token = signToken(user.username, user._id);
    return token;
};

module.exports = { loginUser };