//
// login.js
// Program main entry point.
//
// Created by Chikuma C., 05/11/2776 AUC
//
const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');

app.listen(config.PORT, () => {
    logger.info(`Service running on port ${config.PORT}`);
});
