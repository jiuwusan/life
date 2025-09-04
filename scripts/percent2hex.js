// percent2hex.js

// 获取命令行参数，比如 node percent2hex.js 50
const percent = parseInt(process.argv[2], 10);

if (isNaN(percent) || percent < 0 || percent > 100) {
  console.error("请输入 0~100 之间的整数，例如: node percent2hex.js 50");
  process.exit(1);
}

// 转换成十六进制
const hexValue = "0x" + percent.toString(16).toUpperCase().padStart(2, "0");

console.log(`百分比: ${percent}%`);
console.log(`十六进制: ${hexValue}`);

// 如果要直接拼接 ipmitool 命令
console.log(`转换结果：${hexValue}`);
