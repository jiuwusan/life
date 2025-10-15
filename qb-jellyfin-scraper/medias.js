const request = require("./request");
// const Jellyfin_SERVER_URL = process.env.Jellyfin_SERVER_URL;
// const Jellyfin_X_Emby_Token = process.env.Jellyfin_X_Emby_Token;
// const DINGDING_WEBHOOK_TOKEN = process.env.DINGDING_WEBHOOK_TOKEN;

const Jellyfin_SERVER_URL = "https://cloud.jiuwusan.cn:36443/jellyfin";
const Jellyfin_X_Emby_Token = "728a845fa9da46cdaad205b6b8ea14b7";
const DINGDING_WEBHOOK_TOKEN =
  "f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997";

const refresh = async (req) => {
  const result = await request(Jellyfin_SERVER_URL);
  console.log(result);
  return { message: "refresh success!" };
};

module.exports = { refresh };
