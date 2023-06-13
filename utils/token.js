//
// token.js
// Create and sign token.
//
// Created by Chikuma C., 06/12/2776 AUC
//
const jwt = require('jsonwebtoken');

const signToken = (username, id) => {
    const userForToken = {
        username: username,
        id: id
    };

    const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        { expiresIn: 60 * 60 },
    );

    return token;
};

module.exports = signToken;