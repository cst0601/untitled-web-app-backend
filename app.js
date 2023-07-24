//
// app.js
// Creates actual application that takes router into use. Responsible for
// connecting to MongoDB.
//
// Created by Chikuma C., 05/11/2776 AUC
//
const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const tokenCheckRouter = require('./utils/token_checker');

const userRouter = require('./controllers/user');
const loginRouter = require('./controllers/login');
const postRouter = require('./controllers/post');
const followRouter = require('./controllers/follow');
const feedRouter = require('./controllers/feed');
const postLikeRouter = require('./controllers/post_like_middleware');

mongoose.connect(config.MONGODB_URI)
    .then(_ => {
        logger.info('connected to MongoDB.');
    })
    .catch(error => {
        logger.error('error connection to MongoDB', error);
    });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

// routers
app.use('/', tokenCheckRouter); // middleware to check login status
app.use('/api/user', userRouter);
app.use('/api/login', loginRouter);
app.use('/api/post', postRouter);
app.use('/api/follow', followRouter);
app.use('/api/feed', feedRouter);

app.use(postLikeRouter);

// error handlers
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;