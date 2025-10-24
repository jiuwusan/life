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
    {
      name: "service-scraper-family",
      script: "./services/service-scraper/index.js",
      instances: 1,
      autorestart: true,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "production",
        PORT: 30001,
        JELLYFIN_SERVER_URL: "http://jellyfin:8096/jellyfin",
        JELLYFIN_X_EMBY_TOKEN: "728a845fa9da46cdaad205b6b8ea14b7",
        JELLYFIN_X_EMBY_TOKEN_USER_ID: "0684f8441d8c42cf90fd4adf212983ee",
        JELLYFIN_COLLECTION_TYPES: "movies,tvshows", // movies,tvshows
        DINGDING_WEBHOOK_TOKEN: "f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997",
        ALI_AI_API_TOKEN: "sk-6a05e0f81ad04c038fef0053b040e3d6",
        GEMINI_AI_API_TOKEN: "AIzaSyC4w2fgNRd63DATqYWOPTzH_Y4lflgZ7Zw"
      },
      out_file: "./services/service-scraper/logs/family.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
    {
      name: "service-scraper-9kg",
      script: "./services/service-scraper/index.js",
      instances: 1,
      autorestart: true,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "production",
        PORT: 30002,
        JELLYFIN_SERVER_URL: "http://jellyfin-9kg:8096/jellyfin",
        JELLYFIN_X_EMBY_TOKEN: "965671bf2a004adaa34e5f85959c818c",
        JELLYFIN_X_EMBY_TOKEN_USER_ID: "1ea59e8111234b41867c833a2118cf46",
        JELLYFIN_COLLECTION_TYPES: "",
        DINGDING_WEBHOOK_TOKEN: "f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997",
        ALI_AI_API_TOKEN: "sk-6a05e0f81ad04c038fef0053b040e3d6",
        GEMINI_AI_API_TOKEN: "AIzaSyC4w2fgNRd63DATqYWOPTzH_Y4lflgZ7Zw"
      },
      out_file: "./services/service-scraper/logs/9kg.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
