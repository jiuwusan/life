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
function waitSleep(drution = 30) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), drution);
  });
}

// 工具函数：读取 Stream
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk) => (data += chunk.toString()));
    stream.on("end", () => {
      //   console.log("data---------->", data);
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
  while (Date.now() - start < timeout) {
    try {
      const result = await client.shell(device.id, `uiautomator dump /dev/tty`);
      const output = await streamToString(result);
      if (output.includes(elementId)) {
        console.log(`元素 "${elementId}" 已出现`);
        return getXYByResourceId(output, elementId);
      }
    } catch (error) {
      console.error("检查元素失败:", error);
    }
    await new Promise((resolve) => setTimeout(resolve, 5)); // 每30ms检查一次
  }
  console.log(`元素 "${elementId}" 在 ${timeout}ms 内未出现`);
  return false;
}

// 模拟点击
async function clickAtPosition(device, x, y) {
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
  console.log("点击，立即预定");
  await clickElement(
    device,
    "cn.damai:id/trade_project_detail_purchase_status_bar_container_fl"
  );
  console.log("等待跳转 票档选择 \n");
  const buyButton = await waitForElement(device, "cn.damai:id/btn_buy_view");
  console.log("跳转成功 票档选择 \n");
  clickAtPosition(device, buyButton.centerX, buyButton.centerY);
  //   await clickElement(device, "cn.damai:id/btn_buy_view");
  console.log("等待跳转 订单确认 \n");
  await waitForElement(device, "提交订单");
  console.log("跳转成功 订单确认 \n");
  clickAtPosition(device, 1322, 1540);
  await waitSleep();
  // clickAtPosition(device, 1124, 2998);
  console.log("订单提交成功 支付 \n");
}

const runGrabTicket = async () => {
  console.log(`开始抢票 \n`);
  const device = await getDevices();
  await getScreenResolution(device);
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
