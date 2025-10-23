const { nextSleep } = require('./util');

const createTasks = ({ name, callback }) => {
  const tasks = [];
  let processing = false;

  const startTasks = async () => {
    if (processing) {
      return;
    }
    processing = true;
    // 每次只取一个任务，直到 tasks 为空，需要考虑 tasks 随时 push 新任务的情况
    while (tasks.length > 0) {
      await nextSleep(1000);
      console.log(`${name}:  ${tasks.length}`);
      try {
        callback && typeof callback === 'function' && (await callback(tasks.shift()));
      } catch (error) {
        console.log('任务执行异常', error);
      }
    }
    processing = false;
  };

  const pushTask = taskParams => {
    !taskParams && (taskParams = { timestamp: Date.now() });
    const newParams = Array.isArray(taskParams) ? taskParams : [taskParams];
    tasks.push(...newParams);
    startTasks();
    return tasks.length;
  };

  const getTasks = () => tasks;

  return { getTasks, pushTask, startTasks };
};

module.exports = { createTasks };
