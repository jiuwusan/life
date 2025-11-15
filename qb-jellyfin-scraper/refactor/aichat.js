class AiChat {
  config = {};

  /**
   * @param {object} config
   * @param {string} config.ALI_AI_API_TOKEN
   * @param {string} config.GEMINI_AI_API_TOKEN
   */
  constructor(config) {
    this.config = config;
  }

  async alichat({ systemPrompt, userPrompt }) {
    const { ALI_AI_API_TOKEN } = this.config;
    if (!ALI_AI_API_TOKEN) {
      return;
    }
    const messages = [];
    systemPrompt && messages.push({ role: 'system', content: systemPrompt });
    userPrompt && messages.push({ role: 'user', content: userPrompt });
    const result = await fetch(`https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`, {
      data: {
        model: 'qwen3-max', // deepseek-r1
        messages
      },
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ALI_AI_API_TOKEN}` }
    });
    try {
      return (await result.json())?.choices?.[0]?.message?.content;
    } catch (error) {
      console.log('gemini error:', error);
    }
  }

  async gemini({ systemPrompt, userPrompt }) {
    const { GEMINI_AI_API_TOKEN } = this.config;
    if (!GEMINI_AI_API_TOKEN) {
      return;
    }
    const messages = [];
    systemPrompt && messages.push(systemPrompt);
    userPrompt && messages.push(userPrompt);
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
      data: {
        contents: [
          {
            parts: [
              {
                text: messages.join('。')
              }
            ]
          }
        ]
      },
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_AI_API_TOKEN }
    });
    try {
      return (await result.json())?.candidates?.[0].content?.parts?.[0]?.text;
    } catch (error) {
      console.log('gemini error:', error);
    }
  }

  async chat({ systemPrompt, userPrompt }) {
    let result = await this.gemini({ systemPrompt, userPrompt });
    !result && (result = await this.alichat({ systemPrompt, userPrompt }));
    return result;
  }

  async getMediaInfo({ name }) {
    const extractChinese = filename => {
      // 匹配中文字符（含中文标点）
      const matches = filename.match(/[\u4e00-\u9fa5\u3000-\u303F\uff00-\uffef]+/g);
      return (matches || [])[0] || '';
    };

    const extractYear = filename => {
      // 匹配年份
      const matches = filename.match(/\b(19|20)\d{2}\b/);
      return (matches || [])[0] || '';
    };
    // AI 解读
    const systemPrompt = '我是一个影视爱好者，使用jellyfin搭建了家庭影院';
    const userPrompt = `这是“${name}”某个影视文件/文件夹名称,请结合全球影视资料库（TheTVDB/TheMovieDB/TMDB/IMDb/豆瓣...）分析并仅返回影视名称（优先中文名称，如无中文名称则返回英文名称，不要混用，不要包含季信息）和年份，使用“|”分割`;
    let [Name, Year] = ((await this.chat({ systemPrompt, userPrompt })) || '').replace(/\s+/g, '')?.split('|') || [];
    // 使用正则兜底
    !Name && !Year && ([Name, Year] = [extractChinese(name), extractYear(name)]);
    console.log('AI Media Info Result:', { Name, Year });
    return { Name, Year };
  }
}

module.exports = { AiChat };
