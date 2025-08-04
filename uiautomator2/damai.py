#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import uiautomator2 as u2
import re
import time
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

# === 全局配置 ===
DEVICE_IP_LIST = [
    "10.101.1.118"
]

CRON_HOUR = 13
CRON_MINUTE = 29
CRON_SECOND = 59

# 每隔多久保持设备活跃（秒）
KEEP_ALIVE_INTERVAL = 3

# === 日志设置 ===
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

# === 坐标解析 ===
def get_center_from_bounds(bounds_str):
    match = re.findall(r"\d+", bounds_str)
    if len(match) != 4:
        raise ValueError(f"无效 bounds 格式: {bounds_str}")
    x1, y1, x2, y2 = map(int, match)
    return (x1 + x2) // 2, (y1 + y2) // 2

# === 轮询点击 ===
def wait_and_click(d, timeout=10, interval=0.05, **kwargs):
    """
    等待某个元素出现并点击，支持 text / resourceId 等任意定位方式
    :param d: uiautomator2 设备对象
    :param timeout: 最大等待时间（秒）
    :param interval: 轮询间隔（秒）
    :param kwargs: 传递给 d(**kwargs) 的定位参数，如 text="提交订单", resourceId="xxx"
    :return: 是否成功点击
    """
    start = time.time()
    while time.time() - start < timeout:
        elem = d(**kwargs)
        if elem.exists:
            elem.click()
            return True
        time.sleep(interval)
    return False



# === 封装设备类 ===
class RobDevice:
    def __init__(self, ip):
        self.ip = ip
        self.d = None

    def init(self):
        try:
            self.d = u2.connect(self.ip)
            logging.info(f"✅ 已连接设备 {self.ip}")
        except Exception:
            logging.exception(f"❌ 设备 {self.ip} 初始化失败")

    def keep_alive(self):
        try:
            if self.d:
                info = self.d.info
                logging.info(f"📶 保活 {self.ip}，设备名称 {info.get('productName')}")
        except Exception:
            logging.warning(f"⚠️ 设备 {self.ip} 保活失败，尝试重连")
            self.init()

    def run(self):
        logging.info(f"⏰ 设备 {self.ip} 开始抢购任务")
        try:
            if not self.d:
                logging.warning(f"⚠️ 设备 {self.ip} 未连接，尝试连接")
                self.init()
            if not self.d:
                logging.error(f"🚫 设备 {self.ip} 无法连接，跳过任务")
                return
            
            # 使用无限次点击 直到成功
            # start_time = time.time()
            # time.sleep(0.5)
            while True:
                self.d.click(*get_center_from_bounds("[874,2917][1363,3078]"))
                time.sleep(0.05)
                # if time.time() - start_time > 3:
                    # break

            # resource-id="cn.damai:id/trade_project_detail_purchase_status_bar_container_fl", bounds="[495,2910][1404,3075]"
            if not wait_and_click(self.d,resourceId="cn.damai:id/trade_project_detail_purchase_status_bar_container_fl"):
                logging.warning(f"❌ {self.ip} 打开详情失败")
                return
            
            # resource-id="cn.damai:id/btn_buy_view", bounds="[874,2917][1363,3078]"
            if not wait_and_click(self.d,resourceId="cn.damai:id/btn_buy_view"):
                logging.warning(f"❌ {self.ip} 提交购票信息失败")
                return

            # text="立即提交", bounds="[886,2917][1363,3078]"
            if not wait_and_click(self.d,text="立即提交"):
                logging.warning(f"❌ {self.ip} 提交订单失败")
                return
            
            logging.info(f"✅ {self.ip} 抢购结束")

        except Exception:
            logging.exception(f"💥 设备 {self.ip} 抢购失败")

# === 主函数 ===
def run():
    logging.info(f"脚本启动中...")
    scheduler = BackgroundScheduler()
    devices = [RobDevice(ip) for ip in DEVICE_IP_LIST]

    # 初始化所有设备
    for device in devices:
        device.init()

    # 添加抢购任务
    trigger = CronTrigger(hour=CRON_HOUR, minute=CRON_MINUTE, second=CRON_SECOND)
    for device in devices:
        scheduler.add_job(device.run, trigger=trigger)

    # 添加保活任务（每 KEEP_ALIVE_INTERVAL 秒执行一次）
    # for device in devices:
    #     scheduler.add_job(device.keep_alive, "interval", seconds=KEEP_ALIVE_INTERVAL)

    scheduler.start()
    logging.info(f"📌 抢购调度器已启动，等待 {CRON_HOUR:02d}:{CRON_MINUTE:02d}:{CRON_SECOND:02d} 触发任务...")

    try:
        while True:
            time.sleep(2)
    except (KeyboardInterrupt, SystemExit):
        logging.info("🛑 接收到退出信号，正在关闭调度器")
        scheduler.shutdown()

# === 程序入口 ===
if __name__ == "__main__":
    run()
