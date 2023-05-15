//
// config.js
//
// Created by Chikuma C., 04/27/2776 AUC
//
require('dotenv').config();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

module.exports = {
    PORT,
    MONGODB_URI
};