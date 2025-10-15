module.exports = {
  apps: [
    {
      name: "service-health",
      script: "./services/service-health/index.js",
      instances: 1,
      autorestart: true,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
