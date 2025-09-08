const path = require('path');
const { LIFE_SERVER_API = 'http://127.0.0.1:9000' } = process.env;
module.exports = {
  pageExtensions: ['tsx', 'jsx'],
  async rewrites() {
    return [
      {
        source: '/life-api/:path*',
        destination: `${LIFE_SERVER_API}/:path*` // 这里替换为您要代理的目标地址
      }
    ];
  },
  // basePath: '/life',
  webpack: config => {
    config.resolve.alias['@/components'] = path.join(__dirname, 'components');
    config.resolve.alias['@/hooks'] = path.join(__dirname, 'hooks');
    config.resolve.alias['@/config'] = path.join(__dirname, 'config');
    config.resolve.alias['@/utils'] = path.join(__dirname, 'utils');
    config.resolve.alias['@/api'] = path.join(__dirname, 'api');
    config.resolve.alias.canvas = false;
    return config;
  }
};
