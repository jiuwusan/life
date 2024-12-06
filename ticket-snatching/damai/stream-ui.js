const adb = require("adbkit");
const fs = require("fs");

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

const saveToDisk = (filePath, data) => {
  return new Promise((resolve) => {
    // 写入文件
    fs.writeFile(
      filePath || "./stream/ui.xml",
      data.replace("UI hierchary dumped to: /dev/tty", ""),
      "utf8",
      (err) => {
        if (err) {
          console.error("文件写入失败:", err);
          resolve(false);
        } else {
          console.log(`文件写入成功（${filePath}）。`);
        }
      }
    );
  });
};

async function streamUItoXML(filePath) {
  const device = await getDevices();
  const result = await client.shell(device.id, `uiautomator dump /dev/tty`);
  const xmlStr = await streamToString(result);
  await saveToDisk(filePath, xmlStr);
}

streamUItoXML("./damai/damai-detail-ui.xml");
