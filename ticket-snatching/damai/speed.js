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

// 等待页面元素出现
// async function waitForElement(device, elementId, timeout = 10000) {
//   const start = Date.now();
//   const regex = new RegExp(elementId);
//   while (Date.now() - start < timeout) {
//     const startTimestamp = Date.now();
//     try {
//       const result = await client.shell(
//         device.id,
//         `uiautomator dump --compressed /dev/tty`
//       );
//       const regexResult = await streamToString(result, regex);
//       console.log(`流转换 耗时：${Date.now() - startTimestamp}ms`);
//       if (regexResult) {
//         console.log(
//           `元素 "${elementId}" 已出现，本次检查节点 耗时：${
//             Date.now() - startTimestamp
//           }ms`
//         );
//         return true;
//       }
//     } catch (error) {
//       console.error("检查元素失败:", error);
//     }
//     // await new Promise((resolve) => setTimeout(resolve, 5));
//     console.log(`本次检查节点 耗时：${Date.now() - startTimestamp}ms`);
//   }
//   console.log(`元素 "${elementId}" 在 ${timeout}ms 内未出现`);
//   return false;
// }

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

const getElementInfo = (output, resourceId) => {
  // 解析元素边界信息
  const regex = new RegExp(
    `${resourceId}.*?bounds="\\[(\\d+),(\\d+)]\\[(\\d+),(\\d+)]`
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

async function waitForElement(device, elementValue, timeout = 10000) {
  const start = Date.now();
  const regex = new RegExp(`.*${elementValue}.*`);
  let regexCount = 0;
  while (Date.now() - start < timeout) {
    try {
      console.log(`第${++regexCount}查找 "${elementValue}" 元素`);
      const result = await client.shell(device.id, `uiautomator dump /dev/tty`);
      const output = await streamToString(result);
      if (regex.test(output)) {
        console.log(`元素 "${elementValue}" 已出现`);
        return getElementInfo(output, elementValue);
      }
    } catch (error) {
      console.error("检查元素失败:", error);
    }
  }
  console.log(`元素 "${elementValue}" 在 ${timeout}ms 内未出现`);
  return false;
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    // 清除上一个定时器
    clearTimeout(timeout);
    // 设置新的定时器
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const debounceRefreshEvent = debounce(function (device, centerX, centerY) {
  clickAtPosition(device, centerX, centerY);
}, 35);

// 点击刷新
const clickRefresh = (() => {
  let runing = false;
  return async (device) => {
    if (runing) {
      return;
    }
    runing = true;
    console.log("\n--> 是否需要刷新 \n");
    const elementInfo = await waitForElement(device, "刷新", 2000);
    runing = false;
    if (!elementInfo) {
      return;
    }
    debounceRefreshEvent(device, elementInfo.centerX, elementInfo.centerY);
  };
})();

// 执行抢票操作
async function grabTicket(device) {
  let clickCount = 0;
  while (true) {
    console.log(`第 ${++clickCount} 次 点击`);
    await waitSleep(30);
    await clickAtPosition(device, [886, 2917], [1363, 3078]);
    clickRefresh(device);
  }
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
scheduleGrabTicket(15, 18);

// runGrabTicket();
