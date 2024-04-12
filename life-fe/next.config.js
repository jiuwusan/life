const path = require('path');

module.exports = {
  webpack: config => {
    config.resolve.alias['@/components'] = path.join(__dirname, 'components');
    config.resolve.alias['@/hooks'] = path.join(__dirname, 'hooks');
    config.resolve.alias['@/config'] = path.join(__dirname, 'config');
    config.resolve.alias['@/utils'] = path.join(__dirname, 'utils');
    config.resolve.alias['@/api'] = path.join(__dirname, 'api');
    return config;
  }
};
