const adb = require("adbkit");
const schedule = require("node-schedule");

// 创建 adb 客户端
const client = adb.createClient({
  host: "127.0.0.1",
  port: 5037,
});

// 获取设备列表
async function getDevices() {
  try {
    const devices = await client.listDevices();
    if (devices.length === 0) {
      console.log("没有连接设备");
      return null;
    }
    return devices[0]; // 获取第一个设备
  } catch (error) {
    console.error("获取设备失败:", error);
    return null;
  }
}

// 工具函数：读取 Stream
function waitSleep(druction = 30) {
  console.log(`\n等待 ${druction}ms`);
  return new Promise((resolve) => {
    setTimeout(resolve, druction);
  });
}

// 工具函数：读取 Stream
function streamToString(stream, regex) {
  return new Promise((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk) => {
      const chunkStr = chunk.toString();
      if (regex && regex.test(chunkStr)) {
        stream.destroy();
        resolve(true);
      }
      data += chunkStr;
    });
    stream.on("end", () => {
      regex && resolve(regex.test(data));
      resolve(data);
    });
    stream.on("error", reject);
  });
}

const getXYByResourceId = (output, resourceId) => {
  // 解析元素边界信息
  const regex = new RegExp(
    `${resourceId}".*?bounds="\\[(\\d+),(\\d+)]\\[(\\d+),(\\d+)]`
  );
  const match = output.match(regex);
  if (match) {
    const x1 = parseInt(match[1], 10);
    const y1 = parseInt(match[2], 10);
    const x2 = parseInt(match[3], 10);
    const y2 = parseInt(match[4], 10);
    const centerX = Math.round((x1 + x2) / 2);
    const centerY = Math.round((y1 + y2) / 2);
    console.log(`元素中心坐标: (${centerX}, ${centerY})`);
    return { centerX, centerY };
  }
};

// 提取元素的中心坐标
async function getElementCenter(device, resourceId) {
  try {
    console.log(`查找元素: ${resourceId}`);
    const result = await client.shell(device.id, "uiautomator dump /dev/tty");
    const output = await streamToString(result);
    return getXYByResourceId(output, resourceId);
  } catch (error) {
    console.error("提取元素中心坐标失败:", error);
    return null;
  }
}

async function getScreenResolution(device) {
  try {
    // 获取屏幕分辨率
    const result = await client.shell(device.id, "wm size");
    const output = await streamToString(result);
    const match = output.match(/Physical size: (\d+)x(\d+)/);

    if (match) {
      const width = match[1];
      const height = match[2];
      console.log(`屏幕分辨率: ${width}x${height}`);
      return { width, height };
    }
  } catch (error) {
    console.error("获取屏幕分辨率失败:", error);
  }
}

// 等待页面元素出现
async function waitForElement(device, elementId, timeout = 10000) {
  const start = Date.now();
  const regex = new RegExp(elementId);
  while (Date.now() - start < timeout) {
    const startTimestamp = Date.now();
    try {
      const result = await client.shell(
        device.id,
        `uiautomator dump --compressed /dev/tty`
      );
      const regexResult = await streamToString(result, regex);
      console.log(`流转换 耗时：${Date.now() - startTimestamp}ms`);
      if (regexResult) {
        console.log(
          `元素 "${elementId}" 已出现，本次检查节点 耗时：${
            Date.now() - startTimestamp
          }ms`
        );
        return true;
      }
    } catch (error) {
      console.error("检查元素失败:", error);
    }
    // await new Promise((resolve) => setTimeout(resolve, 5));
    console.log(`本次检查节点 耗时：${Date.now() - startTimestamp}ms`);
  }
  console.log(`元素 "${elementId}" 在 ${timeout}ms 内未出现`);
  return false;
}

// 模拟点击
async function clickAtPosition(device, x, y) {
  if (Array.isArray(x) && Array.isArray(y)) {
    const x1 = x[0];
    const x2 = y[0];
    const y1 = x[1];
    const y2 = y[1];
    x = (x1 + x2) / 2;
    y = (y1 + y2) / 2;
  }
  console.log(`点击位置: (${x}, ${y})`);
  await client.shell(device.id, `input tap ${x} ${y}`);
}

// 点击指定元素
async function clickElement(device, resourceId) {
  const elementCenter = await getElementCenter(device, resourceId);
  if (elementCenter) {
    await clickAtPosition(device, elementCenter.centerX, elementCenter.centerY);
  }
}

// 执行抢票操作
async function grabTicket(device) {
  const startTimestamp = Date.now();
  console.log("点击，立即预定");
  clickAtPosition(device, 885, 2998);
  if (!(await waitForElement(device, "场次"))) {
    return;
  }
  /******提前预约，不需要这些操作，直接点击确定******/
  console.log("票档选择");
  console.log("选择日期");
  clickAtPosition(device, [77, 1031], [1363, 1240]);
  await waitSleep(300);
  console.log("选择座位");
  clickAtPosition(device, [677, 1643], [1083, 1819]);
  await waitSleep(30);
  /******提前预约，不需要这些操作，直接点击确定******/
  console.log("点击，确定");
  clickAtPosition(device, [797, 2888], [1440, 3108]);
  console.log("\n等待跳转 订单确认");
  if (!(await waitForElement(device, "确认订单"))) {
    return;
  }
  /******提前预约，不需要这些操作，直接点击确定******/
  console.log("跳转成功, 选择人员");
  clickAtPosition(device, [1282, 1200], [1363, 1281]);
  /******提前预约，不需要这些操作，直接点击确定******/
  await waitSleep(30);
//   clickAtPosition(device, [886, 2917], [1363, 3078]);
  console.log("订单提交成功 支付 \n");
  console.log(`耗时：${Date.now() - startTimestamp}ms`);
}

const runGrabTicket = async () => {
  console.log(`开始抢票 \n`);
  const device = await getDevices();
  //   await getScreenResolution(device);
  await grabTicket(device);
};

// 设置定时任务（例如每分钟抢一次票）
function scheduleGrabTicket(h, m) {
  console.log(`已预定抢票：${h}:${m} \n`);
  schedule.scheduleJob(`${m} ${h} * * *`, runGrabTicket);
}

// 启动定时抢票脚本
// scheduleGrabTicket(20, 53);

runGrabTicket();
