const requireEnv = (name: string, defaultValue: string | number): string => {
  return String(process.env[name] || defaultValue || '');
};

export default {
  // files
  UPLOAD_BASE_DIR: requireEnv('UPLOAD_BASE_DIR', ''),
  // qb
  QBITTORRENT_HOST: requireEnv('QBITTORRENT_HOST', '10.86.0.240'),
  QBITTORRENT_PORT: Number(requireEnv('QBITTORRENT_PORT', 8080)),
  QBITTORRENT_USERNAME: requireEnv('QBITTORRENT_USERNAME', 'jiuwusan'),
  QBITTORRENT_PASSWORD: requireEnv('QBITTORRENT_PASSWORD', 'ZkD953497'),
  // mysql
  MYSQL_HOST: requireEnv('MYSQL_HOST', '10.86.0.237'),
  MYSQL_PORT: Number(requireEnv('MYSQL_PORT', 3306)),
  MYSQL_USERNAME: requireEnv('MYSQL_USERNAME', 'root'),
  MYSQL_PASSWORD: requireEnv('MYSQL_PASSWORD', 'ZkD953HzR497'),
  MYSQL_DATABASE: requireEnv('MYSQL_DATABASE', 'life-prod'),
  // redis
  REDIS_HOST: requireEnv('REDIS_HOST', '10.86.0.237'),
  REDIS_PORT: Number(requireEnv('REDIS_PORT', 6379)),
  REDIS_PASSWORD: requireEnv('REDIS_PASSWORD', 'ZkD953HzR497')
};
