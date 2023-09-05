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

// checks token, if authentication failed, return a invalid token response.
const checkToken = async (request, response, next) => {
    const requestToken = getTokenFrom(request);
    if (!requestToken) {
        return response.status(401).json({ error: 'is not logged in.' });
    }

    try {
        const decodedToken = jwt.verify(requestToken, process.env.SECRET);
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'invalid token' });
        }
        response.locals.userId = decodedToken.id;
        response.locals.authentication = true;
    } catch (error) {
        return response.status(401).json({ error: 'invalid token' });
    }

    next();
};

// if token does not exist in request, continue with next middleware.
const softCheckToken = async (request, response, next) => {
    const requestToken = getTokenFrom(request);
    if (!requestToken) {
        response.locals.userId = undefined;
        response.locals.authentication = false;
        next();
    }
    else {
        try {
            const decodedToken = jwt.verify(requestToken, process.env.SECRET);
            if (!decodedToken.id) {
                return response.status(401).json({ error: 'invalid token' });
            }
            response.locals.userId = decodedToken.id;
            response.locals.authentication = true;
        } catch (error) {
            return response.status(401).json({ error: 'invalid token' });
        }
        next();
    }
};

// router paths that requires authentication
// hard check
tokenCheckRouter.post('/api/post', checkToken);
tokenCheckRouter.delete('/api/post/:id', checkToken);
tokenCheckRouter.put('/api/post/like/:id', checkToken);
tokenCheckRouter.delete('/api/post/like/:id', checkToken);
tokenCheckRouter.get('/api/feed', checkToken);

tokenCheckRouter.post('/api/follow/:id', checkToken);
tokenCheckRouter.delete('/api/follow/:id', checkToken);

// soft check
tokenCheckRouter.get('/api/feed/:username', softCheckToken);
tokenCheckRouter.get('/api/user/:id', softCheckToken);
tokenCheckRouter.get('/api/user/username/:username', softCheckToken);

module.exports = tokenCheckRouter;