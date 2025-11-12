class QueueTasks {
  config = {};
  tasks = [];
  processing = false;
  /**
   * @param {object} config
   * @param {string} config.name
   * @param {number} config.delay
   * @param {function} config.callback
   */
  constructor(config) {
    this.config = config;
  }

  nextSleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async startTasks() {
    if (this.processing) {
      return;
    }
    // 开始
    this.processing = true;
    // 每次只取一个任务，直到 tasks 为空，需要考虑 tasks 随时 push 新任务的情况
    while (this.tasks.length > 0) {
      await this.nextSleep(this.config.delay || 2000);
      try {
        const current = this.tasks.shift();
        console.log(`${this.config.name} start:`, current);
        console.log(`${this.config.name} remaining:`, this.tasks.length);
        this.config.callback && typeof this.config.callback === 'function' && (await this.config.callback(current));
      } catch (error) {
        console.log(`${this.name} error:`, error);
      }
    }
    // 结束
    this.processing = false;
  }

  pushTask(params) {
    !params && (params = { timestamp: Date.now() });
    const newParams = Array.isArray(params) ? params : [params];
    // 1. 将新任务添加到队列
    this.tasks.push(...newParams);
    // 2. 检查队列是否正在处理中，以及是否有待处理任务,使用 setTimeout 确保 startTasks 在下一个事件循环周期运行
    !this.processing && setTimeout(() => this.startTasks(), 0);
    return this.tasks.length;
  }

  getTasks() {
    return this.tasks;
  }
}
