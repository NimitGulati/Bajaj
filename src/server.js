'use strict';

const config = require('./config/env');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});
