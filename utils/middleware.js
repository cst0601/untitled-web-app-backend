//
// middleware.js
// Unknown endpoint and error handler middleware.
//
// Created by Chikuma C., 04/27/2776 AUC
//
const logger = require('./logger');

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method);
    logger.info('Path:  ', request.path);
    logger.info('Body:  ', request.body);
    logger.info('---');
    next();
};

// middleware for unknown endpoints
const unknownEndpoint = (request, response) => {
    response.status(404).send({ 'error': 'unknown endpoint' });
};

// error handler middleware
const errorHandler = (error, request, response, next) => {
    logger.error(error.message);
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }
    next(error);
};

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
};