import * as puppeteer from 'puppeteer';

/**
 * 获取 cookies 数组
 *
 * @returns
 */
export const getWebCookies = async (weburl: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.goto(weburl, {
    waitUntil: 'networkidle2'
  });

  // 等待页面加载
  let waitCount = 0;
  let cookies = [];
  while (waitCount < 20) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    cookies = await page.browserContext().cookies();
    if (cookies?.length > 0) {
      break;
    }
    ++waitCount;
  }
  // 关闭浏览器
  await browser.close();
  return cookies;
};

/**
 * 获取 cookies 字符串
 *
 * @returns
 */
export const getWebCookiesStr = async (weburl: string, options?: { keys?: string[] }) => {
  const { keys = [] } = options || {};
  const cookies = await getWebCookies(weburl);
  return cookies
    .filter(({ name }) => keys?.length < 1 || (keys?.length > 0 && keys.includes(name)))
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
};

export default {
  getWebCookies,
  getWebCookiesStr
};
