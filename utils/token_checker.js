//
// token_checker.js
// Middleware for checking login status.
//
// Created by Chikuma C., 05/13/2776 AUC
//
const tokenCheckRouter = require('express').Router();
const jwt = require('jsonwebtoken');

const getTokenFrom = request => {
    const authorization = request.get('authorization');
    if (authorization && authorization.startsWith('Bearer')) {
        return authorization.replace('Bearer ', '');
    }
    return null;
};

const checkToken = async (request, response, next) => {
    const requestToken = getTokenFrom(request);
    if (!requestToken) {
        return response.status(401).json({ error: 'is not logged in.' });
    }

    const decodedToken = jwt.verify(requestToken, process.env.SECRET);
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'invalid token' });
    }
    response.locals.userId = decodedToken.id;
    response.locals.authentication = true;

    next();
};

// router paths that requires authentication
tokenCheckRouter.post('/api/post', checkToken);
tokenCheckRouter.delete('/api/post/:id', checkToken);

tokenCheckRouter.post('/api/follow/:id', checkToken);

module.exports = tokenCheckRouter;