const env = process.env;

const defaultConfig = {
  name: 'PROJECT NAME',
  level: env.LOG_LEVEL || 'debug',
  prettyPrint: false,
};

const config = {
  local: {
    ...defaultConfig,
    prettyPrint: {
      levelFirst: true,
    },
  },
  stg: {
    ...defaultConfig,
  },
  prod: {
    ...defaultConfig,
    level: 'info',
  },
};

module.exports = config[env.STAGE];
