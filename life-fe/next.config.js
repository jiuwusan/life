const path = require('path');

module.exports = {
  // 仅 tsx 文件作为页面
  pageExtensions: ['tsx','jsx'],
  async rewrites() {
    return [
      {
        source: '/life-api/:path*',
        destination: 'http://localhost:9000/:path*' // 这里替换为您要代理的目标地址
      }
    ];
  },
  basePath: '/life',
  webpack: config => {
    config.resolve.alias['@/components'] = path.join(__dirname, 'components');
    config.resolve.alias['@/hooks'] = path.join(__dirname, 'hooks');
    config.resolve.alias['@/config'] = path.join(__dirname, 'config');
    config.resolve.alias['@/utils'] = path.join(__dirname, 'utils');
    config.resolve.alias['@/api'] = path.join(__dirname, 'api');
    return config;
  }
};
